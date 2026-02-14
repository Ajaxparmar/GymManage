import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';




/* ----------------------------------
   Types
-----------------------------------*/

interface CreatePlanInput {
  name: string;
  duration: number;
  price: number;
  description?: string | null;
  isDefault?: boolean;
}

interface CreateGymRequest {
  gym: {
    name: string;
    address?: string;
    location?: string;
    mobile?: string;
    email?: string;
    logo?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
    mobile?: string;
  };
  plans: CreatePlanInput[];
}

/* ----------------------------------
   POST - Create Gym + Admin + Plans
-----------------------------------*/

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateGymRequest;

    const { gym, admin, plans } = body;

    /* Validation */

    if (!gym?.name) {
      return NextResponse.json(
        { error: 'Gym name is required' },
        { status: 400 }
      );
    }

    if (!admin?.name || !admin?.email || !admin?.password) {
      return NextResponse.json(
        { error: 'Admin details are required' },
        { status: 400 }
      );
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json(
        { error: 'At least one plan is required' },
        { status: 400 }
      );
    }

    /* Check Email */

    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    /* Hash Password */

    const hashedPassword = await bcrypt.hash(admin.password, 10);

    /* Transaction */

    const result = await prisma.$transaction(
        async (tx) => {
      /* Create Admin */

      const newAdmin = await tx.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          mobile: admin.mobile ?? null,
          role: 'GYM_ADMIN',
          isActive: true,
        },
      });

      /* Create Gym */

      const newGym = await tx.gym.create({
        data: {
          name: gym.name,
          address: gym.address || gym.location || null,
          mobile: gym.mobile ?? null,
          email: gym.email ?? null,
          logo: gym.logo ?? null,
          adminId: newAdmin.id,
          isActive: true,
        },
      });

      /* Update Admin */

      await tx.user.update({
        where: { id: newAdmin.id },
        data: { gymId: newGym.id },
      });

      /* Create Plans */

      const createdPlans = await Promise.all(
        plans.map((plan) =>
          tx.membershipPlan.create({
            data: {
              name: plan.name,
              duration: plan.duration,
              price: plan.price,
              description: plan.description ?? null,
              isDefault: plan.isDefault ?? true,
              gymId: newGym.id,
              isActive: true,
            },
          })
        )
      );

      return {
        gym: newGym,
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
        plans: createdPlans,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Gym created successfully',
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create gym error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create gym',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/* ----------------------------------
   GET - List Gyms
-----------------------------------*/

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const adminId = searchParams.get('adminId');
    const gymId = searchParams.get('gymId');

    const gyms = await prisma.gym.findMany({
      where: {
        ...(adminId && { adminId }),
        ...(gymId && { id: gymId }),
        isActive: true,
      },

      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },

        plans: {
          where: { isActive: true },
          orderBy: [
            { isDefault: 'desc' },
            { duration: 'asc' },
          ],
        },

        _count: {
          select: {
            students: true,
            employees: true,
            plans: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: gyms,
    });
  } catch (error) {
    console.error('Fetch gyms error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch gyms' },
      { status: 500 }
    );
  }
}

/* ----------------------------------
   PUT - Update Gym
-----------------------------------*/

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const { gymId, ...updateData } = body;

    if (!gymId) {
      return NextResponse.json(
        { error: 'Gym ID required' },
        { status: 400 }
      );
    }

    const updatedGym = await prisma.gym.update({
      where: { id: gymId },

      data: updateData,

      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        plans: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gym updated',
      data: updatedGym,
    });
  } catch (error) {
    console.error('Update gym error:', error);

    return NextResponse.json(
      { error: 'Failed to update gym' },
      { status: 500 }
    );
  }
}

/* ----------------------------------
   DELETE - Soft Delete Gym
-----------------------------------*/

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const gymId = searchParams.get('id');

    if (!gymId) {
      return NextResponse.json(
        { error: 'Gym ID required' },
        { status: 400 }
      );
    }

    const deletedGym = await prisma.gym.update({
      where: { id: gymId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Gym deactivated',
      data: deletedGym,
    });
  } catch (error) {
    console.error('Delete gym error:', error);

    return NextResponse.json(
      { error: 'Failed to delete gym' },
      { status: 500 }
    );
  }
}
