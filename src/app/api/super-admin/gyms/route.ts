import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const gyms = await prisma.gym.findMany({
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
        subscription: {
          include: {
            plan: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            employees: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(gyms);
  } catch (err) {
    console.error("[GET /api/super-admin/gyms]", err);
    return NextResponse.json({ error: "Failed to fetch gyms" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      address,
      mobile,
      email,
      logo,
      adminName,
      adminEmail,
      adminPassword,
      adminMobile,
    } = body;

    // 1. Basic validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Gym name is required" },
        { status: 400 }
      );
    }

    if (!adminName?.trim() || !adminEmail?.trim() || !adminPassword) {
      return NextResponse.json(
        { error: "Admin name, email, and password are required" },
        { status: 400 }
      );
    }

    // 2. Check if gym with same name already exists
    const existingGym = await prisma.gym.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });

    if (existingGym) {
      return NextResponse.json(
        { error: "A gym with this name already exists" },
        { status: 409 }
      );
    }

    // 3. Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Admin email already in use" },
        { status: 409 }
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 5. Create gym + admin user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admin user first
      const admin = await tx.user.create({
        data: {
          name: adminName.trim(),
          email: adminEmail.trim(),
          password: hashedPassword,
          mobile: adminMobile?.trim() || null,
          role: "GYM_ADMIN",
        },
      });

      // Create gym and link to admin
      const gym = await tx.gym.create({
        data: {
          name: name.trim(),
          address: address?.trim() || null,
          mobile: mobile?.trim() || null,
          email: email?.trim() || null,
          logo: logo?.trim() || null,
          adminId: admin.id,
        },
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
      });

      return gym;
    });

    console.log("Gym created successfully:", result.id);

    return NextResponse.json(
      {
        success: true,
        message: "Gym created successfully",
        gym: {
          id: result.id,
          name: result.name,
          admin: {
            name: result.admin.name,
            email: result.admin.email,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/gyms]", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Email or gym name already in use" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create gym" },
      { status: 500 }
    );
  }
}