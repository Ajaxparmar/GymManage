// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Skeleton } from "@/components/ui/skeleton";
// import { DashboardLayout } from "@/components/DashboardLayout";
// import { Loader2, Save, Palette, MessageSquare, ShieldCheck } from "lucide-react";

// const formSchema = z.object({
//   name: z.string().min(2, "Gym name must be at least 2 characters"),
//   whatsappEnabled: z.boolean(),
//   whatsappApiKey: z.string().optional(),
//   whatsappPhoneNumber: z.string().optional(),
//   whatsappProvider: z.string().optional(),
//   primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
//   accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
//   darkModeEnabled: z.boolean(),
//   sendExpiryReminder: z.boolean(),
//   reminderDaysBefore: z.number().min(1).max(30),
//   sendWelcomeMessage: z.boolean(),
// });

// type FormValues = z.infer<typeof formSchema>;

// export default function GymSettingsPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       whatsappEnabled: false,
//       whatsappApiKey: "",
//       whatsappPhoneNumber: "",
//       whatsappProvider: "twilio",
//       primaryColor: "#3b82f6",
//       accentColor: "#10b981",
//       darkModeEnabled: false,
//       sendExpiryReminder: true,
//       reminderDaysBefore: 3,
//       sendWelcomeMessage: true,
//     },
//   });

//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user?.gymId) return;

//     const fetchSettings = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch("/api/dashboard/settings", { credentials: "include" });
//         console.log("Fetch settings response:", res);

//         if (!res.ok) throw new Error();
//         const data = await res.json();


//         form.reset({
//           name: data.name || "",
//           whatsappEnabled: data.whatsappEnabled || false,
//           whatsappApiKey: data.whatsappApiKey || "",
//           whatsappPhoneNumber: data.whatsappPhoneNumber || "",
//           whatsappProvider: data.whatsappProvider || "twilio",
//           primaryColor: data.primaryColor || "#3b82f6",
//           accentColor: data.accentColor || "#10b981",
//           darkModeEnabled: data.darkModeEnabled || false,
//           sendExpiryReminder: data.sendExpiryReminder ?? true,
//           reminderDaysBefore: data.reminderDaysBefore ?? 3,
//           sendWelcomeMessage: data.sendWelcomeMessage ?? true,
//         });
//       } catch (err) {
//         toast.error("Failed to load settings");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSettings();
//   }, [status, session?.user?.gymId, form]);

//   const onSubmit = async (values: FormValues) => {
//     setSaving(true);
//     try {
//       const res = await fetch("/api/dashboard/settings", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Failed to save settings");
//       }

//       toast.success("Settings updated successfully");
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         toast.error(err.message || "Could not save settings");
//       } else {
//         toast.error("Could not save settings");
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (status === "loading" || loading) {
//     return (
//       <DashboardLayout activePath="settings">
//         <div className="max-w-4xl mx-auto space-y-8">
//           <Skeleton className="h-10 w-64" />
//           <Card>
//             <CardHeader>
//               <Skeleton className="h-8 w-48" />
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {Array.from({ length: 6 }).map((_, i) => (
//                 <div key={i} className="space-y-2">
//                   <Skeleton className="h-4 w-32" />
//                   <Skeleton className="h-10 w-full" />
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout activePath="settings">
//       <div className="max-w-4xl mx-auto space-y-8 pb-12">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Gym Settings</h1>
//           <p className="text-muted-foreground mt-2">
//             Manage WhatsApp integration, theme, notifications and more
//           </p>
//         </div>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
//             {/* Tabs for better organization */}
//             <Tabs defaultValue="general" className="space-y-6">
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="general">General</TabsTrigger>
//                 <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
//                 <TabsTrigger value="appearance">Appearance</TabsTrigger>
//               </TabsList>

//               {/* General Tab */}
//               <TabsContent value="general" className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Gym Information</CardTitle>
//                     <CardDescription>Basic gym details</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <FormField
//                       control={form.control}
//                       name="name"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Gym Name</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Notifications</CardTitle>
//                     <CardDescription>Control automatic messages</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     <FormField
//                       control={form.control}
//                       name="sendWelcomeMessage"
//                       render={({ field }) => (
//                         <FormItem className="flex items-center justify-between">
//                           <div>
//                             <FormLabel>Send Welcome Message</FormLabel>
//                             <FormDescription>
//                               Send WhatsApp welcome message on new member registration
//                             </FormDescription>
//                           </div>
//                           <FormControl>
//                             <Switch checked={field.value} onCheckedChange={field.onChange} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="sendExpiryReminder"
//                       render={({ field }) => (
//                         <FormItem className="flex items-center justify-between">
//                           <div>
//                             <FormLabel>Send Expiry Reminders</FormLabel>
//                             <FormDescription>
//                               Notify members before membership expires
//                             </FormDescription>
//                           </div>
//                           <FormControl>
//                             <Switch checked={field.value} onCheckedChange={field.onChange} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="reminderDaysBefore"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Reminder Days Before Expiry</FormLabel>
//                           <FormControl>
//                             <Input
//                               type="number"
//                               min={1}
//                               max={30}
//                               {...field}
//                               onChange={(e) => field.onChange(Number(e.target.value))}
//                             />
//                           </FormControl>
//                           <FormDescription>
//                             Send reminder X days before membership expires
//                           </FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               {/* WhatsApp Tab */}
//               <TabsContent value="whatsapp" className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>WhatsApp Integration</CardTitle>
//                     <CardDescription>
//                       Connect WhatsApp Business API for automated messages
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     <FormField
//                       control={form.control}
//                       name="whatsappEnabled"
//                       render={({ field }) => (
//                         <FormItem className="flex items-center justify-between">
//                           <div>
//                             <FormLabel>Enable WhatsApp Messages</FormLabel>
//                             <FormDescription>
//                               Turn on/off all WhatsApp notifications
//                             </FormDescription>
//                           </div>
//                           <FormControl>
//                             <Switch checked={field.value} onCheckedChange={field.onChange} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />

//                     <div className="grid gap-6 md:grid-cols-2">
//                       <FormField
//                         control={form.control}
//                         name="whatsappPhoneNumber"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>WhatsApp Business Number</FormLabel>
//                             <FormControl>
//                               <Input placeholder="+919876543210" {...field} />
//                             </FormControl>
//                             <FormDescription>
//                               Include country code (+91)
//                             </FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="whatsappProvider"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Provider</FormLabel>
//                             <FormControl>
//                               <Input placeholder="twilio / green-api / 360dialog" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="whatsappApiKey"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>API Key / Auth Token</FormLabel>
//                           <FormControl>
//                             <Input type="password" placeholder="••••••••••••••••" {...field} />
//                           </FormControl>
//                           <FormDescription>
//                             Never share this key. It will be stored encrypted.
//                           </FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               {/* Appearance Tab */}
//               <TabsContent value="appearance" className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Theme & Colors</CardTitle>
//                     <CardDescription>Customize your gym dashboard appearance</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-6">
//                     <div className="grid gap-6 md:grid-cols-2">
//                       <FormField
//                         control={form.control}
//                         name="primaryColor"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Primary Color</FormLabel>
//                             <div className="flex items-center gap-3">
//                               <div
//                                 className="w-10 h-10 rounded-md border shadow-sm"
//                                 style={{ backgroundColor: field.value }}
//                               />
//                               <FormControl>
//                                 <Input type="color" {...field} className="w-32 p-1 h-10" />
//                               </FormControl>
//                             </div>
//                             <FormDescription>Main buttons & accents</FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />

//                       <FormField
//                         control={form.control}
//                         name="accentColor"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Accent Color</FormLabel>
//                             <div className="flex items-center gap-3">
//                               <div
//                                 className="w-10 h-10 rounded-md border shadow-sm"
//                                 style={{ backgroundColor: field.value }}
//                               />
//                               <FormControl>
//                                 <Input type="color" {...field} className="w-32 p-1 h-10" />
//                               </FormControl>
//                             </div>
//                             <FormDescription>Success & highlight colors</FormDescription>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>

//                     <FormField
//                       control={form.control}
//                       name="darkModeEnabled"
//                       render={({ field }) => (
//                         <FormItem className="flex items-center justify-between">
//                           <div>
//                             <FormLabel>Dark Mode (Gym-wide)</FormLabel>
//                             <FormDescription>
//                               Enable dark theme for all admins of this gym
//                             </FormDescription>
//                           </div>
//                           <FormControl>
//                             <Switch checked={field.value} onCheckedChange={field.onChange} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//             </Tabs>

//             {/* Save Button */}
//             <div className="flex justify-end pt-6">
//               <Button type="submit" disabled={saving} className="gap-2">
//                 {saving ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     Save Settings
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>
//     </DashboardLayout>
//   );
// }



"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      gymId?: string | null; // Ensure gymId is included here
    };
  }
}

interface CustomUser {
  gymId?: string;
}
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { io as ioClient, Socket } from "socket.io-client";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Loader2,
  Save,
  CheckCircle2,
  QrCode,
  RefreshCw,
  Smartphone,
  Unplug,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

// ─── Form schema (WhatsApp fields removed — handled via QR now) ───────────────

const formSchema = z.object({
  name: z.string().min(2, "Gym name must be at least 2 characters"),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  darkModeEnabled: z.boolean(),
  sendExpiryReminder: z.boolean(),
  reminderDaysBefore: z.number().min(1).max(30),
  sendWelcomeMessage: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── WhatsApp types ───────────────────────────────────────────────────────────

type WAStatus = "idle" | "initializing" | "qr" | "ready" | "disconnected" | "auth_failure";

interface WAState {
  status: WAStatus;
  phoneNumber?: string | null;
  connectedAt?: string | null;
  qr?: string | null;
}

// ─── WhatsApp status badge ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WAStatus }) {
  const map: Record<
    WAStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
  > = {
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

// Remove this redundant declaration of gymId

export default function GymSettingsPage() {
  const { data: session, status } = useSession();
  const gymId = session?.user?.gymId as string | undefined;

  // ── Form state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      primaryColor: "#3b82f6",
      accentColor: "#10b981",
      darkModeEnabled: false,
      sendExpiryReminder: true,
      reminderDaysBefore: 3,
      sendWelcomeMessage: true,
    },
  });

  // ── WhatsApp state ──────────────────────────────────────────────────────────
  const socketRef = useRef<Socket | null>(null);
  const [wa, setWa] = useState<WAState>({ status: "idle" });
  const [waConnecting, setWaConnecting] = useState(false);
  const [waDisconnecting, setWaDisconnecting] = useState(false);

  // ── Fetch gym settings ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated" || !gymId) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/settings", { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        form.reset({
          name: data.name || "",
          primaryColor: data.primaryColor || "#3b82f6",
          accentColor: data.accentColor || "#10b981",
          darkModeEnabled: data.darkModeEnabled || false,
          sendExpiryReminder: data.sendExpiryReminder ?? true,
          reminderDaysBefore: data.reminderDaysBefore ?? 3,
          sendWelcomeMessage: data.sendWelcomeMessage ?? true,
        });
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [status, gymId, form]);

  // ── Fetch WhatsApp status from DB on mount ──────────────────────────────────
  useEffect(() => {
    if (!gymId) return;
    fetch("/api/dashboard/whatsapp", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setWa({
          status: data.status ?? "disconnected",
          phoneNumber: data.phoneNumber ?? null,
          connectedAt: data.connectedAt ?? null,
        });
      })
      .catch(() => { });
  }, [gymId]);

  // ── Socket.IO — real-time QR & status ──────────────────────────────────────
  useEffect(() => {
    if (!gymId) return;

    const socket = ioClient(window.location.origin, {
      path: "/api/socket.io",
      query: { gymId },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("wa:qr", (qr: string) => {
      setWa((prev) => ({ ...prev, status: "qr", qr }));
      setWaConnecting(false);
    });

    socket.on(
      "wa:status",
      (payload: { status: WAStatus; phoneNumber?: string; connectedAt?: string; reason?: string }) => {
        setWa((prev) => ({
          ...prev,
          status: payload.status,
          phoneNumber: payload.phoneNumber ?? prev.phoneNumber,
          connectedAt: payload.connectedAt ?? prev.connectedAt,
          qr: payload.status === "ready" ? null : prev.qr,
        }));
        setWaConnecting(false);
        setWaDisconnecting(false);

        if (payload.status === "ready") toast.success("WhatsApp connected!");
        else if (payload.status === "auth_failure") toast.error("WhatsApp auth failed. Please scan again.");
        else if (payload.status === "disconnected") toast.info("WhatsApp disconnected.");
      }
    );

    return () => { socket.disconnect(); };
  }, [gymId]);

  // ── WhatsApp connect ────────────────────────────────────────────────────────
  const handleWaConnect = useCallback(async () => {
    setWaConnecting(true);
    setWa((prev) => ({ ...prev, status: "initializing", qr: null }));
    try {
      const res = await fetch("/api/dashboard/whatsapp", { method: "POST", credentials: "include" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to start WhatsApp");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not start WhatsApp");
      setWa((prev) => ({ ...prev, status: "disconnected" }));
      setWaConnecting(false);
    }
  }, []);

  // ── WhatsApp disconnect ─────────────────────────────────────────────────────
  const handleWaDisconnect = useCallback(async () => {
    setWaDisconnecting(true);
    try {
      const res = await fetch("/api/dashboard/whatsapp", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setWa({ status: "disconnected", qr: null, phoneNumber: null, connectedAt: null });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not disconnect");
      setWaDisconnecting(false);
    }
  }, []);

  // ── Form submit ─────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to save settings");
      }
      toast.success("Settings updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived WA booleans ─────────────────────────────────────────────────────
  const waReady = wa.status === "ready";
  const waQr = wa.status === "qr";
  const waLoading = wa.status === "initializing" || waConnecting;
  const waIdle = wa.status === "idle" || wa.status === "disconnected" || wa.status === "auth_failure";
  const formattedDate = wa.connectedAt ? new Date(wa.connectedAt).toLocaleString() : null;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <DashboardLayout activePath="settings">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gym Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage WhatsApp integration, theme, notifications and more
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* ── General + Appearance tabs share the form ── */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gym Information</CardTitle>
                    <CardDescription>Basic gym details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gym Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Control automatic messages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="sendWelcomeMessage"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Send Welcome Message</FormLabel>
                            <FormDescription>
                              Send WhatsApp welcome message on new member registration
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sendExpiryReminder"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Send Expiry Reminders</FormLabel>
                            <FormDescription>Notify members before membership expires</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reminderDaysBefore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reminder Days Before Expiry</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={30}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Send reminder X days before membership expires</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Settings</>}
                  </Button>
                </div>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme & Colors</CardTitle>
                    <CardDescription>Customize your gym dashboard appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md border shadow-sm" style={{ backgroundColor: field.value }} />
                              <FormControl>
                                <Input type="color" {...field} className="w-32 p-1 h-10" />
                              </FormControl>
                            </div>
                            <FormDescription>Main buttons & accents</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color</FormLabel>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md border shadow-sm" style={{ backgroundColor: field.value }} />
                              <FormControl>
                                <Input type="color" {...field} className="w-32 p-1 h-10" />
                              </FormControl>
                            </div>
                            <FormDescription>Success & highlight colors</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="darkModeEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Dark Mode (Gym-wide)</FormLabel>
                            <FormDescription>Enable dark theme for all admins of this gym</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Settings</>}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Form>

          {/* ── WhatsApp Tab — self-contained, no form submit ── */}
          <TabsContent value="whatsapp" className="space-y-6">

            {/* Status card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      WhatsApp Business
                    </CardTitle>
                    <Button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/dashboard/send-msg", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              to: "917201000220", // your test number
                              message: "Hello from gym dashboard!",
                            }),
                          });
                          const data = await res.json();
                          if (data.success) toast.success("Message sent!");
                          else toast.error(data.error || "Failed to send");
                        } catch (err) {
                          toast.error("Network error");
                        }
                      }}
                    >
                      Send Test Message
                    </Button>
                    <CardDescription className="mt-1">
                      Scan once to connect your gyms WhatsApp for automated messages
                    </CardDescription>
                  </div>
                  <StatusBadge status={wa.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">

                {/* Connected */}
                {waReady && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300">WhatsApp Connected</p>
                        {wa.phoneNumber && (
                          <p className="text-sm text-emerald-700 dark:text-emerald-400">{wa.phoneNumber}</p>
                        )}
                        {formattedDate && (
                          <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                            Connected since {formattedDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Your gym can now send welcome messages, expiry reminders, and custom notifications automatically.
                    </p>
                  </div>
                )}

                {/* Initializing */}
                {waLoading && (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="font-medium">Starting WhatsApp…</p>
                      <p className="text-sm mt-1">This may take a few seconds</p>
                    </div>
                  </div>
                )}

                {/* QR code */}
                {waQr && wa.qr && (
                  <div className="flex flex-col items-center gap-6 py-4">
                    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-white p-5 shadow-inner">
                      <QRCode value={wa.qr} size={220} />
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
                      onClick={handleWaConnect}
                      className="gap-2 text-muted-foreground"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh QR
                    </Button>
                  </div>
                )}

                {/* Idle / disconnected */}
                {waIdle && !waLoading && (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    {wa.status === "auth_failure" && (
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
                  {!waReady && !waLoading && (
                    <Button onClick={handleWaConnect} disabled={waConnecting} className="gap-2">
                      {waConnecting
                        ? <><Loader2 className="h-4 w-4 animate-spin" />Connecting…</>
                        : <><QrCode className="h-4 w-4" />{waQr ? "Reconnect" : "Connect WhatsApp"}</>
                      }
                    </Button>
                  )}

                  {(waReady || waQr) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                        >
                          <Unplug className="h-4 w-4" />
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect WhatsApp?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will log out your WhatsApp session and stop all automated messages.
                            You will need to scan the QR code again to reconnect.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleWaDisconnect}
                            disabled={waDisconnecting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {waDisconnecting
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : "Disconnect"
                            }
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}