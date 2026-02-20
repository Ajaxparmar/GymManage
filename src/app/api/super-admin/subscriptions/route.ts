import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { gymId, planId, startDate, endDate, amountPaid, status } = body;

    if (!gymId || !planId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate gym exists
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
    });

    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    // Validate plan exists
    const plan = await prisma.gymSubscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Create or update subscription
    const subscription = await prisma.gymSubscription.upsert({
      where: { gymId },
      update: {
        planId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amountPaid: Number(amountPaid) || plan.price,
        status,
      },
      create: {
        gymId,
        planId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amountPaid: Number(amountPaid) || plan.price,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription saved successfully",
      subscription,
    });
  } catch (err) {
    console.error("[POST /api/super-admin/subscriptions]", err);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}