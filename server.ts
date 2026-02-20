import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { setIO } from "@/lib/socket";
import { initGymWhatsApp, getSessionFromDb } from "@/lib/whatsapp-manager";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3002;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handler(req, res);
  });

  const io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: { origin: "*" },
  });

  setIO(io);

  io.on("connection", async (socket) => {
    const gymId = socket.handshake.query.gymId as string | undefined;

    if (!gymId) {
      console.log("[Socket] Connection rejected - no gymId");
      socket.disconnect();
      return;
    }

    socket.join(`gym:${gymId}`);
    console.log(`[Socket] ${socket.id} joined gym:${gymId}`);

    try {
      const session = await getSessionFromDb(gymId);
      socket.emit("wa:status", {
        status: session?.status ?? "disconnected",
        phoneNumber: session?.phoneNumber ?? null,
        connectedAt: session?.connectedAt ?? null,
      });
    } catch (err) {
      console.error("[Socket] Failed to send initial status:", err);
      socket.emit("wa:status", { status: "disconnected" });
    }

    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.id} left gym:${gymId}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});