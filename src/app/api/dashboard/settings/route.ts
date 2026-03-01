import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym" }, { status: 400 });

  try {
    const [gym, settings] = await Promise.all([
      prisma.gym.findUnique({
        where: { id: gymId },
        select: { name: true },
      }),
      prisma.gymSettings.findUnique({
        where: { gymId },
        select: {
          whatsappEnabled: true,
          whatsappInstanceId: true,
          whatsappApiKey: true,
          whatsappEndpoint: true,
          primaryColor: true,
          accentColor: true,
          darkModeEnabled: true,
          expiryReminder: true,
          reminderDays: true,
          welcomeMessage: true,
        },
      }),
    ]);

    if (!gym) return NextResponse.json({ error: "Gym not found" }, { status: 404 });

    return NextResponse.json({
      name: gym.name,
      // WhatsApp
      whatsappEnabled: settings?.whatsappEnabled ?? false,
      whatsappInstanceId: settings?.whatsappInstanceId ?? "",
      whatsappApiKey: settings?.whatsappApiKey ?? "",
      whatsappEndpoint: settings?.whatsappEndpoint ?? "https://send.fastpaynow.in/api/send",
      // Theme
      primaryColor: settings?.primaryColor ?? "#3b82f6",
      accentColor: settings?.accentColor ?? "#10b981",
      darkModeEnabled: settings?.darkModeEnabled ?? false,
      // Notifications — map DB field names → frontend field names
      sendExpiryReminder: settings?.expiryReminder ?? true,
      reminderDaysBefore: settings?.reminderDays ?? 3,
      sendWelcomeMessage: settings?.welcomeMessage ?? true,
    });
  } catch (err) {
    console.error("[GET /api/dashboard/settings]", err);
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

    // Update gym name separately
    if (body.name) {
      await prisma.gym.update({
        where: { id: gymId },
        data: { name: body.name },
      });
    }

    // Build WhatsApp fields conditionally
    const whatsappFields = body.whatsappEnabled
      ? {
          whatsappEnabled: true,
          ...(body.whatsappInstanceId !== undefined && { whatsappInstanceId: body.whatsappInstanceId || null }),
          ...(body.whatsappApiKey !== undefined && { whatsappApiKey: body.whatsappApiKey || null }),
          ...(body.whatsappEndpoint !== undefined && {
            whatsappEndpoint: body.whatsappEndpoint || "https://send.fastpaynow.in/api/send",
          }),
        }
      : {
          // Clear credentials when disabled
          whatsappEnabled: false,
          whatsappInstanceId: null,
          whatsappApiKey: null,
        };

    const settings = await prisma.gymSettings.upsert({
      where: { gymId },
      create: {
        gymId,
        ...whatsappFields,
        primaryColor: body.primaryColor ?? "#3b82f6",
        accentColor: body.accentColor ?? "#10b981",
        darkModeEnabled: body.darkModeEnabled ?? false,
        expiryReminder: body.sendExpiryReminder ?? true,
        reminderDays: body.reminderDaysBefore ?? 3,
        welcomeMessage: body.sendWelcomeMessage ?? true,
      },
      update: {
        ...whatsappFields,
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
        darkModeEnabled: body.darkModeEnabled,
        expiryReminder: body.sendExpiryReminder,
        reminderDays: body.reminderDaysBefore,
        welcomeMessage: body.sendWelcomeMessage,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("[PATCH /api/dashboard/settings]", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}