// src/app/api/dashboard/send-msg/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getIO } from "@/lib/socket";
import { sendWhatsAppMessage, initGymWhatsApp, getGymWAStatus } from "@/lib/whatsapp-manager";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  console.log("[SEND] POST /send-msg received");
  const { to, message } = await req.json();
  console.log("[SEND] Payload:", { to, message });
  
  const session = await getServerSession(authOptions);
  console.log("[SEND] Received request:",session);
  
  if (!session?.user?.gymId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;


  if (!to || !message) {
    return NextResponse.json({ error: "Missing to or message" }, { status: 400 });
  }

  try {
    const currentStatus = getGymWAStatus(gymId);
    console.log(`[SEND] Current status for ${gymId}: ${currentStatus}`);

    if (currentStatus !== "ready") {
      console.log(`[SEND] Client not ready (${currentStatus}) — attempting re-init`);
      const io = getIO();
      if (!io) {
        throw new Error("Socket.IO not available");
      }
      await initGymWhatsApp(gymId, io);
      // Wait a bit for ready (not perfect, but helps in quick tests)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    await sendWhatsAppMessage(gymId, to, message, { showToast: true, silent: false });
    return NextResponse.json({ success: true, message: "Sent" });
  } catch (err: unknown) {
    console.error("[SEND] Failed:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}