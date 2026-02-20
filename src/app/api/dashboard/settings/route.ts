import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    console.log("Fetching gym settings...");
    
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym" }, { status: 400 });

  try {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: {
        name: true,
        whatsappEnabled: true,
        whatsappApiKey: true,
        whatsappPhoneNumber: true,
        primaryColor: true,
        accentColor: true,
        darkModeEnabled: true,
        sendExpiryReminder: true,
        reminderDaysBefore: true,
        sendWelcomeMessage: true,
      },
    });

    if (!gym) return NextResponse.json({ error: "Gym not found" }, { status: 404 });

    return NextResponse.json(gym);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym" }, { status: 400 });

  try {
    const body = await req.json();

    // Optional: validate sensitive fields
    const updateData: Record<string, unknown> = {
      name: body.name,
      whatsappEnabled: body.whatsappEnabled,
      primaryColor: body.primaryColor,
      accentColor: body.accentColor,
      darkModeEnabled: body.darkModeEnabled,
      sendExpiryReminder: body.sendExpiryReminder,
      reminderDaysBefore: body.reminderDaysBefore,
      sendWelcomeMessage: body.sendWelcomeMessage,
    };

    // Only update WhatsApp fields if enabled + key provided
    if (body.whatsappEnabled) {
      if (body.whatsappApiKey) updateData.whatsappApiKey = body.whatsappApiKey;
      if (body.whatsappPhoneNumber) updateData.whatsappPhoneNumber = body.whatsappPhoneNumber;
    } else {
      // Clear sensitive fields when disabled
      updateData.whatsappApiKey = null;
      updateData.whatsappPhoneNumber = null;
    }

    const updated = await prisma.gym.update({
      where: { id: gymId },
      data: updateData,
      select: {
        name: true,
        whatsappEnabled: true,
        primaryColor: true,
        accentColor: true,
        darkModeEnabled: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("[PATCH /api/gym/settings]", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}