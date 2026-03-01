import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendWhatsAppMessage } from "@/lib/wa-service";

export async function POST(req: NextRequest) {
  console.log("[SEND] POST /send-msg received");

  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  const { to, message } = await req.json();

  if (!to || !message) {
    return NextResponse.json({ error: "Missing to or message" }, { status: 400 });
  }

  // Ensure it's a phone number, not a DB id or garbage
  const digitsOnly = to.replace(/\D/g, "");
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return NextResponse.json(
      { error: `Invalid phone number: "${to}". Must include country code e.g. +919876543210` },
      { status: 400 }
    );
  }

  console.log("[SEND] Sending to:", digitsOnly, "gymId:", gymId);

  try {
    await sendWhatsAppMessage(gymId, to, message);
    return NextResponse.json({ success: true, message: "Sent" });
  } catch (err: unknown) {
    console.error("[SEND] Failed:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}