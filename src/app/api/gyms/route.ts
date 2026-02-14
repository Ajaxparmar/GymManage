import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gyms = await prisma.gym.findMany();
  return NextResponse.json(gyms);
}

// app/api/gyms/route.ts

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const body = await req.json();
  
    try {
      // 1. Create Gym Admin user
      const hashed = await hashPassword(body.adminPassword);
  
      const adminUser = await prisma.user.create({
        data: {
          email: body.adminEmail,
          password: hashed,
          name: body.adminName,
          mobile: body.adminMobile || null,
          role: "GYM_ADMIN",
          isActive: true,
        },
      });
  
      // 2. Create Gym
      const newGym = await prisma.gym.create({
        data: {
          name: body.name,
          address: body.address || null,
          mobile: body.mobile || null,
          email: body.email || null,
          logo: body.logo || null,
          isActive: true,
          adminId: adminUser.id,           // Gym → Admin
        },
      });
  
      // 3. IMPORTANT: Link back — set gymId on the admin user
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { gymId: newGym.id },
      });
  
      return NextResponse.json({
        success: true,
        gym: newGym,
        admin: { id: adminUser.id, email: adminUser.email },
      });
  
    } catch (err) {
      console.error("Gym creation failed:", err);
      return NextResponse.json(
        { error: "Failed to create gym and admin" },
        { status: 500 }
      );
    }
  }

// Add PUT for update, DELETE for delete similarly with auth checks