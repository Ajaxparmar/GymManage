import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

interface CreatePaymentRequest {
  studentId: string;
  userId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  remarks?: string;
  paymentDate?: string;
}

/* POST - Record Payment */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreatePaymentRequest;
    const { studentId, userId, amount, paymentMethod = 'CASH', remarks, paymentDate } = body;

    if (!studentId || !userId || amount === undefined) {
      return NextResponse.json(
        { error: 'studentId, userId, and amount are required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      /* Create the payment record */
      const payment = await tx.payment.create({
        data: {
          studentId,
          userId,
          amount,
          paymentMethod,
          remarks: remarks ?? null,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
        include: {
          student: { select: { id: true, name: true } },
          collectedBy: { select: { id: true, name: true } },
        },
      });

      /* Update student's paidAmount and pendingAmount */
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { paidAmount: true, totalFees: true },
      });

      if (student) {
        const newPaid    = student.paidAmount + amount;
        const newPending = Math.max(0, student.totalFees - newPaid);

        await tx.student.update({
          where: { id: studentId },
          data: {
            paidAmount:    newPaid,
            pendingAmount: newPending,
          },
        });
      }

      return payment;
    });

    return NextResponse.json(
      { success: true, message: `₹${amount} payment recorded successfully`, data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to record payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/* GET - List Payments */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const userId    = searchParams.get('userId');
    const gymId     = searchParams.get('gymId');
    const from      = searchParams.get('from');
    const to        = searchParams.get('to');

    const payments = await prisma.payment.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(userId    && { userId }),
        ...(gymId     && { student: { gymId } }),
        ...(from || to
          ? {
              paymentDate: {
                ...(from && { gte: new Date(from) }),
                ...(to   && { lte: new Date(to) }),
              },
            }
          : {}),
      },
      include: {
        student: { select: { id: true, name: true, mobile: true } },
        collectedBy: { select: { id: true, name: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      data: payments,
      meta: { totalCollected, count: payments.length },
    });
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

/* DELETE - Delete Payment (and reverse student balance) */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: { studentId: true, amount: true },
      });

      if (!payment) throw new Error('Payment not found');

      /* Reverse balance on student */
      const student = await tx.student.findUnique({
        where: { id: payment.studentId },
        select: { paidAmount: true, totalFees: true },
      });

      if (student) {
        const newPaid    = Math.max(0, student.paidAmount - payment.amount);
        const newPending = student.totalFees - newPaid;

        await tx.student.update({
          where: { id: payment.studentId },
          data: { paidAmount: newPaid, pendingAmount: newPending },
        });
      }

      await tx.payment.delete({ where: { id: paymentId } });
    });

    return NextResponse.json({ success: true, message: 'Payment deleted and balance reversed' });
  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}