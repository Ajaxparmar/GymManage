import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // uncomment if needed

import { getIO } from "@/lib/socket";
import { initGymWhatsApp, disconnectGymWhatsApp, getSessionFromDb } from "@/lib/whatsapp-manager";

export async function GET(req: NextRequest) {
  console.log("[WA-API] GET /whatsapp called");

  // Replace with your real session logic
  const session = await getServerSession(); // or getServerSession(authOptions)
  const gymId = session?.user?.gymId;

  if (!gymId) {
    return NextResponse.json({ error: "No gymId in session" }, { status: 401 });
  }

  const data = await getSessionFromDb(gymId);
  return NextResponse.json(data ?? { status: "disconnected" });
}

export async function POST(req: NextRequest) {
  console.log("[WA-API] POST /whatsapp received");

  const session = await getServerSession();
  const gymId = "698ef8b528882654a0879804";

  if (!gymId) {
    console.log("[WA-API] Missing gymId");
    return NextResponse.json({ error: "Unauthorized - no gymId" }, { status: 401 });
  }

  const io = getIO();
  if (!io) {
    console.error("[WA-API] Socket.IO not initialized");
    return NextResponse.json({ error: "Socket.IO not ready" }, { status: 500 });
  }

  try {
    console.log(`[WA-API] Starting WhatsApp init for gym ${gymId}`);
    await initGymWhatsApp(gymId, io);
    console.log(`[WA-API] Init completed for ${gymId}`);
    return NextResponse.json({ success: true });
  } catch (err: string | unknown) {
    console.error("[WA-API] Init error:", err);
    const errorMessage = err instanceof Error ? err.message : "Initialization failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log("[WA-API] DELETE /whatsapp received");

  const session = await getServerSession();
  const gymId = session?.user?.gymId;

  if (!gymId) return NextResponse.json({ error: "No gymId" }, { status: 401 });

  const io = getIO();
  if (!io) return NextResponse.json({ error: "Socket.IO not ready" }, { status: 500 });

  await disconnectGymWhatsApp(gymId, io);
  return NextResponse.json({ success: true });
}