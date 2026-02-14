import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    return NextResponse.json({ error: "No gym associated" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { studentId, amount, paymentMethod = "CASH", remarks } = body;

    if (!studentId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment details" }, { status: 400 });
    }

    // Verify member belongs to this gym
    const student = await prisma.student.findFirst({
      where: { id: studentId, gymId },
    });

    if (!student) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (amount > student.pendingAmount) {
      return NextResponse.json({ error: "Amount exceeds pending dues" }, { status: 400 });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: Number(amount),
        paymentMethod,
        remarks,
        studentId,
        userId: session.user.id!, // collector
      },
    });

    // Update student balances
    await prisma.student.update({
      where: { id: studentId },
      data: {
        paidAmount: { increment: Number(amount) },
        pendingAmount: { decrement: Number(amount) },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: string | unknown) {
    console.error("[POST /api/payments]", err);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}