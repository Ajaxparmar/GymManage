// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym associated" }, { status: 400 });
//   }

//   try {
//     const body = await req.json();
//     const { studentId, amount, paymentMethod = "CASH", remarks } = body;

//     if (!studentId || !amount || amount <= 0) {
//       return NextResponse.json({ error: "Invalid payment details" }, { status: 400 });
//     }

//     // Verify member belongs to this gym
//     const student = await prisma.student.findFirst({
//       where: { id: studentId, gymId },
//     });

//     if (!student) {
//       return NextResponse.json({ error: "Member not found" }, { status: 404 });
//     }

//     if (amount > student.pendingAmount) {
//       return NextResponse.json({ error: "Amount exceeds pending dues" }, { status: 400 });
//     }

//     // Create payment record
//     await prisma.payment.create({
//       data: {
//         amount: Number(amount),
//         paymentMethod,
//         remarks,
//         studentId,
//         userId: session.user.id!, // collector
//       },
//     });

//     // Update student balances
//     await prisma.student.update({
//       where: { id: studentId },
//       data: {
//         paidAmount: { increment: Number(amount) },
//         pendingAmount: { decrement: Number(amount) },
//       },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err: string | unknown) {
//     console.error("[POST /api/payments]", err);
//     return NextResponse.json(
//       { error: "Failed to record payment" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { addDays, format } from "date-fns";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  console.log("[POST /api/payments] Request received");

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    console.log("[POST /api/payments] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    console.log("[POST /api/payments] No gym ID");
    return NextResponse.json({ error: "No gym associated" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { studentId, amount, paymentMethod = "CASH", remarks } = body;

    if (!studentId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment details", message: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Fetch current student data (with plan duration)
    const student = await prisma.student.findFirst({
      where: { id: studentId, gymId },
      include: {
        plan: {
          select: { duration: true, price: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (amount > student.pendingAmount) {
      return NextResponse.json(
        { error: "Amount exceeds pending dues" },
        { status: 400 }
      );
    }

    console.log(`[POST /api/payments] Recording payment of ₹${amount} for student ${studentId}`);

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
      include: {
        plan: { select: { duration: true } },
      },
    });

    // 3. If pending is now <= 0 → renew membership
    let renewalMessage = "";
    if (updatedStudent.pendingAmount <= 0) {
      const durationDays = updatedStudent.plan?.duration || 30;

      // Calculate new expiry date
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + durationDays);

      await prisma.student.update({
        where: { id: studentId },
        data: {
          status: "ACTIVE",
          expiryDate: newExpiry,
          pendingAmount: 0, // ensure it's exactly 0
        },
      });

      renewalMessage = ` → Membership renewed until ${format(newExpiry, "dd MMM yyyy")}`;
      console.log(`[POST /api/payments] Membership renewed for ${studentId} by ${durationDays} days`);
    }
    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully.${renewalMessage}`,
      newPending: Math.max(0, updatedStudent.pendingAmount),
      newExpiry: updatedStudent.expiryDate?.toISOString(),
    });
  } catch (err: unknown) {
    console.error("[POST /api/payments] Error:", err);
    return NextResponse.json(
      { error: "Failed to record payment", message: (err as Error).message || "Unknown error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}