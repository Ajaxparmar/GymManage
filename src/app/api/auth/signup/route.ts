import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";           // ← your bcrypt hash function
import { prisma } from "@/lib/prisma";             // ← your Prisma client instance

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, password, name, mobile, role } = body;

    // Basic validation (you can also do more with Zod here if you want)
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        mobile: mobile || null,
        role: role || "GYM_ADMIN", // fallback
        isActive: true,
      },
    });

    // Optional: you could auto-sign-in here by calling signIn("credentials", ...)
    // but for security + UX, many apps just redirect to /login after signup

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}