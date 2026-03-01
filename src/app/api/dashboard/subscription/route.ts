import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET — current subscription + history + available plans
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym" }, { status: 400 });

  try {
    const [subscription, plans] = await Promise.all([
      prisma.gymSubscription.findUnique({
        where: { gymId },
        include: { plan: true },
      }),
      prisma.gymSubscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      }),
    ]);

    return NextResponse.json({ subscription, plans });
  } catch (err) {
    console.error("[GET /api/dashboard/subscription]", err);
    return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
  }
}

// POST — request an upgrade
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym" }, { status: 400 });

  try {
    const { planId, message } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const plan = await prisma.gymSubscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { name: true, email: true, admin: { select: { name: true, email: true } } },
    });

    // Log upgrade request as a notification (reuse Notification or log it)
    // For now we store it as a custom notification on the gym's first student — 
    // better: store in a dedicated UpgradeRequest model. 
    // Since schema has no UpgradeRequest, we'll store metadata in a WhatsAppLog entry as a paper trail
    await prisma.whatsAppLog.create({
      data: {
        gymId,
        phoneNumber: gym?.admin?.email || "upgrade-request",
        message: `UPGRADE REQUEST: Gym "${gym?.name}" requested plan "${plan.name}" (₹${plan.price}). Note: ${message || "None"}`,
        status: "pending",
        provider: "upgrade-request",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Upgrade request for "${plan.name}" submitted. Our team will contact you shortly.`,
    });
  } catch (err) {
    console.error("[POST /api/dashboard/subscription]", err);
    return NextResponse.json({ error: "Failed to submit upgrade request" }, { status: 500 });
  }
}