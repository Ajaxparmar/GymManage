import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { sendWhatsAppMessage } from "@/lib/wa-service";

async function isWhatsAppReady(gymId: string): Promise<boolean> {
  const settings = await prisma.gymSettings.findUnique({
    where: { gymId },
    select: { whatsappEnabled: true, whatsappInstanceId: true, whatsappApiKey: true },
  });
  return !!(settings?.whatsappEnabled && settings.whatsappInstanceId && settings.whatsappApiKey);
}

export async function POST(req: NextRequest) {
  console.log("[POST /api/payments] Request received");

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym associated" }, { status: 400 });

  try {
    const body = await req.json();
    const { studentId, amount, paymentMethod = "CASH", remarks } = body;

    if (!studentId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment details", message: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, gymId },
      include: { plan: { select: { name: true, duration: true, price: true } } },
    });

    if (!student) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    if (amount > student.pendingAmount) {
      return NextResponse.json({ error: "Amount exceeds pending dues" }, { status: 400 });
    }

    // 1. Create payment record
    await prisma.payment.create({
      data: {
        amount: Number(amount),
        paymentDate: new Date(),
        paymentMethod,
        remarks: remarks || `Payment of ₹${amount} on ${new Date().toISOString()}`,
        studentId,
        userId: session.user.id!,
      },
    });

    // 2. Update balances
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        paidAmount: { increment: Number(amount) },
        pendingAmount: { decrement: Number(amount) },
      },
      include: { plan: { select: { name: true, duration: true } } },
    });

    // 3. Renew membership if fully paid
    let newExpiry = updatedStudent.expiryDate;
    let renewalMessage = "";

    if (updatedStudent.pendingAmount <= 0) {
      const durationDays = updatedStudent.plan?.duration || 30;
      newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + durationDays);

      await prisma.student.update({
        where: { id: studentId },
        data: { status: "ACTIVE", expiryDate: newExpiry, pendingAmount: 0 },
      });

      renewalMessage = ` → Membership renewed until ${format(newExpiry, "dd MMM yyyy")}`;
      console.log(`[POST /api/payments] Membership renewed for ${studentId}`);
    }

    // 4. Send WhatsApp receipt (non-blocking)
    try {
      const waReady = await isWhatsAppReady(gymId);
      if (waReady) {
        const gym = await prisma.gym.findUnique({
          where: { id: gymId },
          select: { name: true },
        });

        const remainingDues = Math.max(0, updatedStudent.pendingAmount);
        const isFullyPaid = remainingDues <= 0;

        const msg =
          `Hi ${student.name},\n\n` +
          `✅ Payment received at *${gym?.name}*\n\n` +
          `💰 Amount Paid: ₹${Number(amount).toLocaleString()}\n` +
          `📋 Method: ${paymentMethod}\n` +
          `📅 Date: ${format(new Date(), "dd MMM yyyy, hh:mm a")}\n` +
          (isFullyPaid
            ? `\n🎉 All dues cleared!\n📆 Membership valid till: ${format(newExpiry!, "dd MMM yyyy")}`
            : `\n⚠️ Remaining dues: ₹${remainingDues.toLocaleString()}`) +
          `\n\nThank you! 💪`;

        await sendWhatsAppMessage(gymId, student.mobile, msg);
        console.log(`[POST /api/payments] WhatsApp receipt sent to ${student.mobile}`);
      }
    } catch (err) {
      // Non-blocking — don't fail the payment if WA fails
      console.warn("[POST /api/payments] WhatsApp receipt failed:", err);
    }

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully.${renewalMessage}`,
      newPending: Math.max(0, updatedStudent.pendingAmount),
      newExpiry: newExpiry?.toISOString(),
    });
  } catch (err: unknown) {
    console.error("[POST /api/payments] Error:", err);
    return NextResponse.json(
      { error: "Failed to record payment", message: (err as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}