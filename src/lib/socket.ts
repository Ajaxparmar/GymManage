import type { Server as SocketIOServer } from "socket.io";

// Use Node's global object so server.ts and Next.js API routes
// share the same instance. Module-level variables don't work because
// Next.js compiles API routes in a separate module scope from the custom server.
declare global {
  // eslint-disable-next-line no-var
  var __socketIO: SocketIOServer | undefined;
}

export function setIO(io: SocketIOServer) {
  global.__socketIO = io;
}

export function getIO(): SocketIOServer | null {
  return global.__socketIO ?? null;
}