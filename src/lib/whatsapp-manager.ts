export async function sendWhatsAppMessageServer(
  gymId: string,
  phoneNumber: string,
  message: string,
  _opts?: { showToast?: boolean; silent?: boolean }
) {
  if (!gymId)                         throw new Error("gymId is required");
  if (!phoneNumber?.startsWith("+"))  throw new Error("Phone number must include country code (e.g. +919876543210)");
  if (!message?.trim())               throw new Error("Message cannot be empty");

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error("Base URL is not defined in env");

  const response = await fetch(`${baseUrl}/api/dashboard/send-msg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gymId,
      to: phoneNumber,
      message: message.trim(),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data?.error || "Failed to send WhatsApp");
  }

  return data;
}