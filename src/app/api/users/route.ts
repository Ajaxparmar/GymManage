import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  role?: 'SUPER_ADMIN' | 'GYM_ADMIN' | 'EMPLOYEE';
  gymId?: string;
}

/* POST - Create User */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateUserRequest;
    const { name, email, password, mobile, role = 'EMPLOYEE', gymId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        mobile: mobile ?? null,
        role,
        gymId: gymId ?? null,
        isActive: true,
      },
      select: {
        id: true, name: true, email: true,
        mobile: true, role: true, gymId: true,
        isActive: true, createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, message: 'User created successfully', data: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/* GET - List Users */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gymId  = searchParams.get('gymId');
    const role   = searchParams.get('role') as 'SUPER_ADMIN' | 'GYM_ADMIN' | 'EMPLOYEE' | null;
    const userId = searchParams.get('userId');

    const users = await prisma.user.findMany({
      where: {
        ...(gymId  && { gymId }),
        ...(role   && { role }),
        ...(userId && { id: userId }),
        isActive: true,
      },
      select: {
        id: true, name: true, email: true, mobile: true,
        role: true, gymId: true, isActive: true, createdAt: true,
        employeeAt: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

/* PUT - Update User */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, password, ...updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, name: true, email: true, mobile: true,
        role: true, gymId: true, isActive: true, updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, message: 'User updated', data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

/* DELETE - Soft Delete User */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const deleted = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: 'User deactivated', data: { id: deleted.id } });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}