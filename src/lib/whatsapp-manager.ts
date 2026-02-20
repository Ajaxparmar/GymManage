// import { Client, LocalAuth, type Message } from "whatsapp-web.js";
// import type { Server as SocketIOServer } from "socket.io";
// import { prisma } from "@/lib/prisma";
// import * as fs from "fs";
// import * as os from "os";

// export type WAStatus = "initializing" | "qr" | "ready" | "disconnected" | "auth_failure";

// export interface GymWASession {
//   gymId: string;
//   status: WAStatus;
//   phoneNumber?: string | null;
//   connectedAt?: Date | null;
//   updatedAt: Date;
// }

// interface ActiveClient {
//   client: Client;
//   status: WAStatus;
//   qr?: string;
// }

// const registry = new Map<string, ActiveClient>();

// function findChrome(): string {
//   const cacheDir = `${os.homedir()}/.cache/puppeteer/chrome`;
//   if (!fs.existsSync(cacheDir)) {
//     throw new Error(`Puppeteer chrome not found at ${cacheDir}. Run: npm install puppeteer`);
//   }

//   const versions = fs.readdirSync(cacheDir).sort().reverse();
//   for (const version of versions) {
//     const candidates = [
//       `${cacheDir}/${version}/chrome-linux64/chrome`,
//       `${cacheDir}/${version}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
//       `${cacheDir}/${version}/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
//       `${cacheDir}/${version}/chrome-win64/chrome.exe`,
//     ];
//     for (const p of candidates) {
//       if (fs.existsSync(p)) return p;
//     }
//   }
//   throw new Error("No Chrome executable found in puppeteer cache");
// }

// export async function getSessionFromDb(gymId: string): Promise<GymWASession | null> {
//   const record = await prisma.whatsAppSession.findUnique({ where: { gymId } });
//   if (!record) return null;
//   return {
//     gymId: record.gymId,
//     status: record.status as WAStatus,
//     phoneNumber: record.phoneNumber,
//     connectedAt: record.connectedAt,
//     updatedAt: record.updatedAt,
//   };
// }

// async function upsertSession(gymId: string, update: Partial<GymWASession>) {
//   await prisma.whatsAppSession.upsert({
//     where: { gymId },
//     create: {
//       gymId,
//       status: update.status ?? "disconnected",
//       phoneNumber: update.phoneNumber ?? null,
//       connectedAt: update.connectedAt ?? null,
//       updatedAt: new Date(),
//     },
//     update: {
//       status: update.status,
//       phoneNumber: update.phoneNumber,
//       connectedAt: update.connectedAt,
//       updatedAt: new Date(),
//     },
//   });
// }

// async function deleteSession(gymId: string) {
//   await prisma.whatsAppSession.deleteMany({ where: { gymId } });
// }

// export async function initGymWhatsApp(gymId: string, io: SocketIOServer): Promise<void> {
//   console.log(`[WA] initGymWhatsApp called for ${gymId}`);

//   if (registry.has(gymId)) {
//     const entry = registry.get(gymId)!;
//     console.log(`[WA] Already exists — status: ${entry.status}`);
//     if (entry.status === "ready") {
//       io.to(`gym:${gymId}`).emit("wa:status", { status: "ready" });
//     } else if (entry.qr) {
//       io.to(`gym:${gymId}`).emit("wa:qr", entry.qr);
//     }
//     return;
//   }

//   let chromePath: string;
//   try {
//     chromePath = findChrome();
//     console.log(`[WA] Using Chrome: ${chromePath}`);
//   } catch (err) {
//     console.error("[WA] Chrome not found:", err);
//     await upsertSession(gymId, { status: "auth_failure" });
//     io.to(`gym:${gymId}`).emit("wa:status", { status: "auth_failure" });
//     return;
//   }

//   const client = new Client({
//     authStrategy: new LocalAuth({ clientId: gymId }),
//     puppeteer: {
//       executablePath: chromePath,
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-gpu",
//         "--disable-software-rasterizer",
//       ],
//     },
//   });

//   const entry: ActiveClient = { client, status: "initializing" };
//   registry.set(gymId, entry);

//   await upsertSession(gymId, { status: "initializing" });
//   io.to(`gym:${gymId}`).emit("wa:status", { status: "initializing" });

//   client.on("qr", async (qr: string) => {
//     console.log(`[WA] QR GENERATED for ${gymId} (length: ${qr.length})`);
//     entry.status = "qr";
//     entry.qr = qr;
//     await upsertSession(gymId, { status: "qr" });
//     io.to(`gym:${gymId}`).emit("wa:qr", qr);
//   });

//   client.on("ready", async () => {
//     console.log(`[WA] READY for ${gymId}`);
//     entry.status = "ready";
//     entry.qr = undefined;
//     const phone = client.info?.wid?.user ? `+${client.info.wid.user}` : null;
//     await upsertSession(gymId, {
//       status: "ready",
//       phoneNumber: phone,
//       connectedAt: new Date(),
//     });
//     io.to(`gym:${gymId}`).emit("wa:status", {
//       status: "ready",
//       phoneNumber: phone,
//     });
//   });

//   client.on("auth_failure", async () => {
//     console.log(`[WA] AUTH FAILURE for ${gymId}`);
//     entry.status = "auth_failure";
//     await upsertSession(gymId, { status: "auth_failure" });
//     io.to(`gym:${gymId}`).emit("wa:status", { status: "auth_failure" });
//     registry.delete(gymId);
//   });

//   client.on("disconnected", async (reason) => {
//     console.log(`[WA] DISCONNECTED ${gymId} — reason: ${reason}`);
//     entry.status = "disconnected";
//     await upsertSession(gymId, { status: "disconnected" });
//     io.to(`gym:${gymId}`).emit("wa:status", { status: "disconnected", reason });
//     registry.delete(gymId);
//   });

//   client.on("message", (msg: Message) => {
//     io.to(`gym:${gymId}`).emit("wa:message", {
//       from: msg.from,
//       body: msg.body,
//       timestamp: msg.timestamp,
//     });
//   });

//   try {
//     console.log(`[WA] Starting client.initialize() for ${gymId}`);
//     await client.initialize();
//     console.log(`[WA] client.initialize() completed for ${gymId}`);
//   } catch (err) {
//     console.error(`[WA] initialize() failed for ${gymId}:`, err);
//     registry.delete(gymId);
//     await upsertSession(gymId, { status: "disconnected" });
//     io.to(`gym:${gymId}`).emit("wa:status", { status: "disconnected" });
//   }
// }

// export async function disconnectGymWhatsApp(gymId: string, io: SocketIOServer): Promise<void> {
//   const entry = registry.get(gymId);
//   if (entry) {
//     try { await entry.client.logout(); } catch {}
//     try { await entry.client.destroy(); } catch {}
//     registry.delete(gymId);
//   }
//   await deleteSession(gymId);
//   io.to(`gym:${gymId}`).emit("wa:status", { status: "disconnected" });
// }

// export async function sendWhatsAppMessage(gymId: string, to: string, message: string): Promise<void> {
//   const entry = registry.get(gymId);
//   if (!entry || entry.status !== "ready") {
//     throw new Error(`WhatsApp not ready for gym ${gymId}`);
//   }
//   const chatId = to.replace(/\D/g, "") + "@c.us";
//   await entry.client.sendMessage(chatId, message);
// }

// export function getGymWAStatus(gymId: string): WAStatus {
//   return registry.get(gymId)?.status ?? "disconnected";
// }

import { Client, LocalAuth, type Message } from "whatsapp-web.js";
import type { Server as SocketIOServer } from "socket.io";
import { prisma } from "@/lib/prisma";

export type WAStatus = "initializing" | "qr" | "ready" | "disconnected" | "auth_failure";

export interface GymWASession {
  gymId: string;
  status: WAStatus;
  phoneNumber?: string | null;
  connectedAt?: Date | null;
  updatedAt: Date;
}

interface ActiveClient {
  client: Client;
  status: WAStatus;
  qr?: string;
}

const registry = new Map<string, ActiveClient>();

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

async function upsertSession(gymId: string, update: Partial<GymWASession>) {
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
      ...(update.status !== undefined && { status: update.status }),
      ...(update.phoneNumber !== undefined && { phoneNumber: update.phoneNumber }),
      ...(update.connectedAt !== undefined && { connectedAt: update.connectedAt }),
      updatedAt: new Date(),
    },
  });
}

async function deleteSession(gymId: string) {
  await prisma.whatsAppSession.deleteMany({ where: { gymId } });
}

// ─── Core Initialization ──────────────────────────────────────────────────────

export async function initGymWhatsApp(gymId: string, io: SocketIOServer): Promise<void> {
  console.log(`[WA-${gymId}] initGymWhatsApp called`);

  // Force destroy existing client to mimic working Express behavior
  if (registry.has(gymId)) {
    console.log(`[WA-${gymId}] Destroying previous client to force fresh session`);
    const old = registry.get(gymId);
    try {
      await old?.client.destroy();
    } catch (e) {
      console.log(`[WA-${gymId}] Destroy failed (maybe already dead):`, e);
    }
    registry.delete(gymId);
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: gymId }), // per-gym session
    puppeteer: {
      // NO executablePath → uses bundled Chromium (like working code)
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    },
  });

  const entry: ActiveClient = { client, status: "initializing" };
  registry.set(gymId, entry);

  await upsertSession(gymId, { status: "initializing" });
  io.to(`gym:${gymId}`).emit("wa:status", { status: "initializing" });

  client.on("qr", async (qr: string) => {
    console.log(`[WA-${gymId}] QR RECEIVED (length: ${qr.length})`);
    entry.status = "qr";
    entry.qr = qr;
    await upsertSession(gymId, { status: "qr" });
    io.to(`gym:${gymId}`).emit("wa:qr", qr);
  });

  client.on("ready", async () => {
    console.log(`[WA-${gymId}] READY!`);
    entry.status = "ready";
    entry.qr = undefined;
    const phone = client.info?.wid?.user ? `+${client.info.wid.user}` : null;
    await upsertSession(gymId, {
      status: "ready",
      phoneNumber: phone,
      connectedAt: new Date(),
    });
    io.to(`gym:${gymId}`).emit("wa:status", {
      status: "ready",
      phoneNumber: phone,
    });
  });

  client.on("auth_failure", async (msg) => {
    console.log(`[WA-${gymId}] AUTH FAILURE: ${msg}`);
    entry.status = "auth_failure";
    await upsertSession(gymId, { status: "auth_failure" });
    io.to(`gym:${gymId}`).emit("wa:status", { status: "auth_failure" });
    registry.delete(gymId);
  });

  client.on("disconnected", async (reason) => {
    console.log(`[WA-${gymId}] DISCONNECTED: ${reason}`);
    entry.status = "disconnected";
    await upsertSession(gymId, { status: "disconnected" });
    io.to(`gym:${gymId}`).emit("wa:status", { status: "disconnected", reason });
    registry.delete(gymId);
  });

  client.on("message", (msg: Message) => {
    io.to(`gym:${gymId}`).emit("wa:message", {
      from: msg.from,
      body: msg.body,
      timestamp: msg.timestamp,
    });
  });

  try {
    console.log(`[WA-${gymId}] Starting client.initialize() ...`);
    await client.initialize();
    console.log(`[WA-${gymId}] client.initialize() completed`);
  } catch (err) {
    console.error(`[WA-${gymId}] initialize() FAILED:`, err);
    registry.delete(gymId);
    await upsertSession(gymId, { status: "disconnected" });
    io.to(`gym:${gymId}`).emit("wa:status", { status: "disconnected" });
  }
}

export async function disconnectGymWhatsApp(gymId: string, io: SocketIOServer): Promise<void> {
  const entry = registry.get(gymId);
  if (entry) {
    try { await entry.client.logout(); } catch {}
    try { await entry.client.destroy(); } catch {}
    registry.delete(gymId);
  }
  await deleteSession(gymId);
  io.to(`gym:${gymId}`).emit("wa:status", { status: "disconnected" });
}

export async function sendWhatsAppMessage(gymId: string, to: string, message: string, p0: { showToast: boolean; silent: boolean; }): Promise<void> {
  const entry = registry.get(gymId);
  console.log(`[WA-${gymId}] sendWhatsAppMessage called — entry status: ${entry?.status ?? "none"}`);
  
  if (!entry || entry.status !== "ready") {
    throw new Error(`WhatsApp client not ready for gym ${gymId}`);
  }
  const chatId = to.replace(/\D/g, "") + "@c.us";
  await entry.client.sendMessage(chatId, message);
}

export function getGymWAStatus(gymId: string): WAStatus {
    const entry = registry.get(gymId);
    return entry?.status ?? "disconnected";
  }