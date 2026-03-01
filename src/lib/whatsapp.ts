import { prisma } from "@/lib/prisma";

export type WAStatus = "ready" | "disconnected";

export interface GymWASession {
  gymId: string;
  status: WAStatus;
  phoneNumber?: string | null;
  connectedAt?: Date | null;
  updatedAt: Date;
}

const INSTANCE_ID = "388342fa-c9dd-4768-b0b3-0bbe34c2d76a";
const API_KEY      = "wag_26f2184c28d84775b3505dfec5e621d3";
const API_URL      = "https://send.fastpaynow.in/api/send";

// ─── Prisma helpers ───────────────────────────────────────────────────────────

export async function getSessionFromDb(gymId: string): Promise<GymWASession | null> {
  const record = await prisma.whatsAppSession.findUnique({ where: { gymId } });
  if (!record) return null;
  return {
    gymId: record.gymId,
    status: record.status as WAStatus,
    phoneNumber: record.phoneNumber,
    connectedAt: record.connectedAt,
    updatedAt: record.updatedAt,
  };
}

export async function upsertSession(gymId: string, update: Partial<GymWASession>) {
  await prisma.whatsAppSession.upsert({
    where: { gymId },
    create: {
      gymId,
      status: update.status ?? "disconnected",
      phoneNumber: update.phoneNumber ?? null,
      connectedAt: update.connectedAt ?? null,
      updatedAt: new Date(),
    },
    update: {
      ...(update.status      !== undefined && { status: update.status }),
      ...(update.phoneNumber !== undefined && { phoneNumber: update.phoneNumber }),
      ...(update.connectedAt !== undefined && { connectedAt: update.connectedAt }),
      updatedAt: new Date(),
    },
  });
}

export async function deleteSession(gymId: string) {
  await prisma.whatsAppSession.deleteMany({ where: { gymId } });
}

// ─── Send message via external API ───────────────────────────────────────────

export async function sendWhatsAppMessage(
  gymId: string,
  to: string,
  message: string,
  _opts?: { showToast?: boolean; silent?: boolean }
): Promise<void> {
  // Strip all non-digits (handles "+91...", "+1..." etc.)
  const toDigits = to.replace(/\D/g, "");

  const payload = {
    instanceId: INSTANCE_ID,
    apiKey: API_KEY,
    to: toDigits,
    message: message.trim(),
  };

  console.log(`[WA-${gymId}] Sending to ${toDigits} via fastpaynow API`);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(`[WA-${gymId}] API error:`, data);
    throw new Error(data?.message || data?.error || "Failed to send WhatsApp message");
  }

  console.log(`[WA-${gymId}] Message sent successfully:`, data);
}

// ─── Stub helpers (kept so existing imports don't break) ─────────────────────

export function getGymWAStatus(_gymId: string): WAStatus {
  // Since the external API is always-on, we always report "ready"
  return "ready";
}