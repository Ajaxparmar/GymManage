import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MembershipStatus } from '@prisma/client';

interface CreateStudentRequest {
  gymId: string;
  planId: string;
  createdById: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  photo?: string;
  joiningDate?: string;
  expiryDate: string;
  totalFees: number;
  paidAmount: number;
}

/* POST - Enroll Student */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateStudentRequest;
    const {
      gymId, planId, createdById, name, mobile,
      email, address, photo, joiningDate, expiryDate,
      totalFees, paidAmount,
    } = body;

    if (!gymId || !planId || !createdById || !name || !mobile || !expiryDate) {
      return NextResponse.json(
        { error: 'gymId, planId, createdById, name, mobile, and expiryDate are required' },
        { status: 400 }
      );
    }

    const pendingAmount = totalFees - paidAmount;

    const newStudent = await prisma.student.create({
      data: {
        gymId, planId, createdById,
        name, mobile,
        email: email ?? null,
        address: address ?? null,
        photo: photo ?? null,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        expiryDate: new Date(expiryDate),
        totalFees: totalFees ?? 0,
        paidAmount: paidAmount ?? 0,
        pendingAmount: pendingAmount ?? 0,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
        gym: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { success: true, message: 'Student enrolled successfully', data: newStudent },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll student', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/* GET - List Students */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymId    = searchParams.get('gymId');
    const planId   = searchParams.get('planId');
    const status   = searchParams.get('status') as MembershipStatus | null;
    const mobile   = searchParams.get('mobile');
    const studentId = searchParams.get('studentId');

    const students = await prisma.student.findMany({
      where: {
        ...(gymId     && { gymId }),
        ...(planId    && { planId }),
        ...(status    && { status }),
        ...(mobile    && { mobile }),
        ...(studentId && { id: studentId }),
      },
      include: {
        plan: true,
        gym: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('Fetch students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

/* PUT - Update Student */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, ...updateData } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Recalculate pendingAmount if fees changed
    if (updateData.totalFees !== undefined || updateData.paidAmount !== undefined) {
      const current = await prisma.student.findUnique({
        where: { id: studentId },
        select: { totalFees: true, paidAmount: true },
      });
      if (current) {
        const total  = updateData.totalFees  ?? current.totalFees;
        const paid   = updateData.paidAmount ?? current.paidAmount;
        updateData.pendingAmount = total - paid;
      }
    }

    // Convert date strings if present
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: {
        plan: true,
        gym: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, message: 'Student updated', data: updatedStudent });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

/* DELETE - Suspend / Hard Delete Student */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');
    const hard      = searchParams.get('hard') === 'true';

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    if (hard) {
      await prisma.student.delete({ where: { id: studentId } });
      return NextResponse.json({ success: true, message: 'Student permanently deleted' });
    }

    const suspended = await prisma.student.update({
      where: { id: studentId },
      data: { status: 'SUSPENDED' },
    });

    return NextResponse.json({ success: true, message: 'Student suspended', data: { id: suspended.id } });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}