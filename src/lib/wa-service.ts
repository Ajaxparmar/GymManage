// src/lib/wa-service.ts
import { prisma } from "@/lib/prisma";

export async function sendWhatsAppMessage(
  gymId: string,
  to: string,
  message: string,
  _opts?: { showToast?: boolean; silent?: boolean }
): Promise<void> {
  // Load config from DB per gym
  const settings = await prisma.gymSettings.findUnique({ where: { gymId } });

  if (!settings?.whatsappEnabled) {
    throw new Error("WhatsApp is not enabled for this gym");
  }
  if (!settings.whatsappInstanceId || !settings.whatsappApiKey) {
    throw new Error("WhatsApp API credentials are not configured");
  }

  const endpoint = settings.whatsappEndpoint || "https://send.fastpaynow.in/api/send";
  const toDigits = to.replace(/\D/g, "");

  console.log(`[WA-${gymId}] Sending to ${toDigits} via ${endpoint}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instanceId: settings.whatsappInstanceId,
      apiKey: settings.whatsappApiKey,
      to: toDigits,
      message: message.trim(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(`[WA-${gymId}] API error:`, data);
    throw new Error(data?.message || data?.error || "Failed to send WhatsApp message");
  }

  console.log(`[WA-${gymId}] Message sent successfully`);
}