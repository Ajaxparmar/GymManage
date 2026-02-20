"use client";

/**
 * components/WhatsAppSettingsTab.tsx
 *
 * Drop-in replacement for the WhatsApp <TabsContent> in GymSettingsPage.
 *
 * Usage:
 *   import { WhatsAppSettingsTab } from "@/components/WhatsAppSettingsTab";
 *   ...
 *   <TabsContent value="whatsapp">
 *     <WhatsAppSettingsTab />
 *   </TabsContent>
 *
 * It manages its own socket connection, QR display, and status polling.
 * No props required — gymId is read from the next-auth session.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// Extend the session user type to include gymId
declare module "next-auth" {
  interface User {
    gymId?: string | null;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      gymId?: string | null;
    };
  }
}
import { useSession } from "next-auth/react";
import { io as ioClient, Socket } from "socket.io-client";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  Loader2,
  QrCode,
  RefreshCw,
  Smartphone,
  Unplug,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type WAStatus =
  | "idle"
  | "initializing"
  | "qr"
  | "ready"
  | "disconnected"
  | "auth_failure";

interface WAState {
  status: WAStatus;
  phoneNumber?: string | null;
  connectedAt?: string | null;
  qr?: string | null;
}

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WAStatus }) {
  const map: Record<WAStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    idle: { label: "Not connected", variant: "outline", icon: <WifiOff className="h-3 w-3" /> },
    disconnected: { label: "Disconnected", variant: "outline", icon: <WifiOff className="h-3 w-3" /> },
    initializing: { label: "Initializing…", variant: "secondary", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    qr: { label: "Scan QR", variant: "secondary", icon: <QrCode className="h-3 w-3" /> },
    ready: { label: "Connected", variant: "default", icon: <Wifi className="h-3 w-3" /> },
    auth_failure: { label: "Auth Failed", variant: "destructive", icon: <AlertTriangle className="h-3 w-3" /> },
  };

  const { label, variant, icon } = map[status] ?? map.idle;

  return (
    <Badge variant={variant} className="gap-1.5 text-xs">
      {icon}
      {label}
    </Badge>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WhatsAppSettingsTab() {
  const { data: session } = useSession();
  const gymId = session?.user?.gymId ?? undefined;

  const socketRef = useRef<Socket | null>(null);

  const [state, setState] = useState<WAState>({ status: "idle" });
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // ── Fetch persisted state on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!gymId) return;

    fetch("/api/dashboard/whatsapp", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setState((prev) => ({
          ...prev,
          status: data.status ?? "disconnected",
          phoneNumber: data.phoneNumber ?? null,
          connectedAt: data.connectedAt ?? null,
        }));
      })
      .catch(() => {});
  }, [gymId]);

  // ── Socket connection ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!gymId) return;

    const socket = ioClient(window.location.origin, {
      path: "/api/socket.io",
      query: { gymId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("wa:qr", (qr: string) => {
      setState((prev) => ({ ...prev, status: "qr", qr }));
      setConnecting(false);
    });

    socket.on(
      "wa:status",
      (payload: { status: WAStatus; phoneNumber?: string; connectedAt?: string; reason?: string }) => {
        setState((prev) => ({
          ...prev,
          status: payload.status,
          phoneNumber: payload.phoneNumber ?? prev.phoneNumber,
          connectedAt: payload.connectedAt ?? prev.connectedAt,
          qr: payload.status === "ready" ? null : prev.qr,
        }));
        setConnecting(false);
        setDisconnecting(false);

        if (payload.status === "ready") {
          toast.success("WhatsApp connected successfully!");
        } else if (payload.status === "auth_failure") {
          toast.error("WhatsApp authentication failed. Please scan again.");
        } else if (payload.status === "disconnected") {
          toast.info("WhatsApp disconnected.");
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [gymId]);

  // ── Connect handler ─────────────────────────────────────────────────────────
  const handleConnect = useCallback(async () => {
    setConnecting(true);
    setState((prev) => ({ ...prev, status: "initializing", qr: null }));

    try {
      const res = await fetch("/api/dashboard/whatsapp", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to start WhatsApp");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not start WhatsApp");
      setState((prev) => ({ ...prev, status: "disconnected" }));
      setConnecting(false);
    }
  }, []);

  // ── Disconnect handler ──────────────────────────────────────────────────────
  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/dashboard/whatsapp", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      setState({ status: "disconnected", qr: null, phoneNumber: null, connectedAt: null });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not disconnect");
      setDisconnecting(false);
    }
  }, []);

  // ── Derived booleans ────────────────────────────────────────────────────────
  const isReady = state.status === "ready";
  const isQr = state.status === "qr";
  const isLoading = state.status === "initializing" || connecting;
  const isIdle = state.status === "idle" || state.status === "disconnected" || state.status === "auth_failure";

  const formattedDate = state.connectedAt
    ? new Date(state.connectedAt).toLocaleString()
    : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                WhatsApp Business
              </CardTitle>
              <CardDescription className="mt-1">
                Scan once to connect your gyms WhatsApp for automated messages
              </CardDescription>
            </div>
            <StatusBadge status={state.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Connected state */}
          {isReady && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    WhatsApp Connected
                  </p>
                  {state.phoneNumber && (
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      {state.phoneNumber}
                    </p>
                  )}
                  {formattedDate && (
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                      Connected since {formattedDate}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Your gym can now send welcome messages, expiry reminders, and custom
                notifications via WhatsApp automatically.
              </p>
            </div>
          )}

          {/* Initializing state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Starting WhatsApp…</p>
                <p className="text-sm mt-1">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* QR code state */}
          {isQr && state.qr && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-white p-5 shadow-inner">
                <QRCode value={state.qr} size={220} />
              </div>
              <div className="text-center space-y-1 max-w-sm">
                <p className="font-semibold text-foreground">Scan with WhatsApp</p>
                <p className="text-sm text-muted-foreground">
                  Open WhatsApp → Linked Devices → Link a Device, then scan this code.
                  The code refreshes automatically.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleConnect}
                className="gap-2 text-muted-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh QR
              </Button>
            </div>
          )}

          {/* Idle / disconnected state */}
          {isIdle && !isLoading && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              {state.status === "auth_failure" && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive max-w-sm">
                  Authentication failed. Please try connecting again.
                </div>
              )}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No WhatsApp connected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click below to generate a QR code and link your WhatsApp Business account.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            {/* Connect / Reconnect */}
            {!isReady && !isLoading && (
              <Button onClick={handleConnect} disabled={connecting} className="gap-2">
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    {isQr ? "Reconnect" : "Connect WhatsApp"}
                  </>
                )}
              </Button>
            )}

            {/* Disconnect */}
            {(isReady || isQr) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
                    <Unplug className="h-4 w-4" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect WhatsApp?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will log out your WhatsApp session and stop all automated
                      messages. You will need to scan the QR code again to reconnect.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {disconnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Disconnect"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-dashed">
        <CardContent className="pt-5">
          <div className="grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="text-base">📱</span>
              <div>
                <p className="font-medium text-foreground">One device only</p>
                <p>Each gym links a single WhatsApp Business number.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-base">🔒</span>
              <div>
                <p className="font-medium text-foreground">Session persisted</p>
                <p>You wont need to scan again after server restarts.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-base">⚡</span>
              <div>
                <p className="font-medium text-foreground">Real-time QR</p>
                <p>QR refreshes automatically if it expires.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}