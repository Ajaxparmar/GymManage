import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CreatePlanRequest {
  gymId: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  isDefault?: boolean;
}

/* POST - Create Plan */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreatePlanRequest;
    const { gymId, name, duration, price, description, isDefault = false } = body;

    if (!gymId || !name || !duration || price === undefined) {
      return NextResponse.json(
        { error: 'gymId, name, duration, and price are required' },
        { status: 400 }
      );
    }

    const gym = await prisma.gym.findUnique({ where: { id: gymId } });
    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    const newPlan = await prisma.membershipPlan.create({
      data: {
        name, duration, price,
        description: description ?? null,
        isDefault,
        gymId,
        isActive: true,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Plan created successfully', data: newPlan },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json(
      { error: 'Failed to create plan', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/* GET - List Plans */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymId  = searchParams.get('gymId');
    const planId = searchParams.get('planId');

    const plans = await prisma.membershipPlan.findMany({
      where: {
        ...(gymId  && { gymId }),
        ...(planId && { id: planId }),
        isActive: true,
      },
      include: {
        _count: { select: { students: true } },
      },
      orderBy: [
        { isDefault: 'desc' },
        { duration: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    console.error('Fetch plans error:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

/* PUT - Update Plan */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, ...updateData } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: planId },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: 'Plan updated', data: updatedPlan });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

/* DELETE - Soft Delete Plan */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('id');

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    const deleted = await prisma.membershipPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'Plan deactivated', data: { id: deleted.id } });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}