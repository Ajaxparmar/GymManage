"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { applyGymTheme } from "@/lib/gym-theme";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Loader2, Save, CheckCircle2, Smartphone, Eye, EyeOff, Send, KeyRound, Link2,
} from "lucide-react";

// ── Color pairs ───────────────────────────────────────────────────────────────

const COLOR_PAIRS: Record<string, string> = {
  "#3b82f6": "#10b981",
  "#6366f1": "#06b6d4",
  "#8b5cf6": "#10b981",
  "#ec4899": "#f97316",
  "#ef4444": "#f97316",
  "#f97316": "#eab308",
  "#eab308": "#f97316",
  "#22c55e": "#14b8a6",
  "#14b8a6": "#3b82f6",
  "#0ea5e9": "#6366f1",
  "#64748b": "#3b82f6",
  "#111827": "#6366f1",
};

const PRIMARY_COLORS = [
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#eab308", name: "Yellow" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#0ea5e9", name: "Sky" },
  { hex: "#64748b", name: "Slate" },
  { hex: "#111827", name: "Dark" },
];

const ACCENT_COLORS = [
  { hex: "#10b981", name: "Emerald" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#64748b", name: "Slate" },
];

// ── Schema ────────────────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(2, "Gym name must be at least 2 characters"),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  darkModeEnabled: z.boolean(),
  sendExpiryReminder: z.boolean(),
  reminderDaysBefore: z.number().min(1).max(30),
  sendWelcomeMessage: z.boolean(),
  whatsappEnabled: z.boolean(),
  whatsappInstanceId: z.string().optional(),
  whatsappApiKey: z.string().optional(),
  whatsappEndpoint: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

// ── Color swatch component ────────────────────────────────────────────────────

function ColorSwatch({
  hex, name, selected, onClick,
}: {
  hex: string; name: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={name}
      onClick={onClick}
      className={`relative h-8 w-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        selected ? "border-foreground scale-110 shadow-md" : "border-transparent"
      }`}
      style={{ backgroundColor: hex }}
    >
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-4 w-4 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ── Test message panel ────────────────────────────────────────────────────────

function TestMessagePanel({ onTest, testing }: { onTest: (to: string) => void; testing: boolean }) {
  const [testNumber, setTestNumber] = useState("");
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium">Phone Number</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">+91</span>
          <Input
            placeholder="98765 43210"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value.replace(/[^\d\s\-+().]/g, ""))}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">+91 added automatically if no country code</p>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={testing || !testNumber.trim()}
        onClick={() => onTest(testNumber)}
        className="gap-2"
      >
        {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send Test
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GymSettingsPage() {
  const { data: session, status } = useSession();
  const gymId = session?.user?.gymId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [waConfigured, setWaConfigured] = useState(false);

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
      whatsappEnabled: false,
      whatsappInstanceId: "",
      whatsappApiKey: "",
      whatsappEndpoint: "https://send.fastpaynow.in/api/send",
    },
  });

  const whatsappEnabled = form.watch("whatsappEnabled");
  const primaryColor = form.watch("primaryColor");
  const accentColor = form.watch("accentColor");
  const darkModeEnabled = form.watch("darkModeEnabled");

  // ── Fetch settings ──────────────────────────────────────────────────────────
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
          whatsappEnabled: data.whatsappEnabled ?? false,
          whatsappInstanceId: data.whatsappInstanceId || "",
          whatsappApiKey: data.whatsappApiKey || "",
          whatsappEndpoint: data.whatsappEndpoint || "https://send.fastpaynow.in/api/send",
        });
        setWaConfigured(!!(data.whatsappInstanceId && data.whatsappApiKey));
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [status, gymId, form]);

  // ── Submit ──────────────────────────────────────────────────────────────────
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
      // Apply theme immediately
      applyGymTheme(values.primaryColor, values.accentColor, values.darkModeEnabled);
      // Update localStorage cache
      localStorage.setItem("gym-theme", JSON.stringify({
        primaryColor: values.primaryColor,
        accentColor: values.accentColor,
        darkMode: values.darkModeEnabled,
      }));
      setWaConfigured(!!(values.whatsappInstanceId && values.whatsappApiKey));
      toast.success("Settings saved successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  // ── Test message ────────────────────────────────────────────────────────────
  const handleTestMessage = async (to: string) => {
    setTesting(true);
    let normalized = to.replace(/[\s\-().]/g, "");
    if (!normalized.startsWith("+")) normalized = "+91" + normalized.replace(/^0+/, "");
    try {
      const res = await fetch("/api/dashboard/send-msg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to: normalized, message: "✅ Test message from your Gym Dashboard!" }),
      });
      const data = await res.json();
      if (data.success) toast.success(`Test message sent to ${normalized}!`);
      else toast.error(data.error || "Failed to send test message");
    } catch {
      toast.error("Network error while sending test");
    } finally {
      setTesting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <DashboardLayout activePath="settings">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
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
          <p className="text-muted-foreground mt-2">Manage WhatsApp integration, theme, and notifications</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* ── General ── */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gym Information</CardTitle>
                    <CardDescription>Basic gym details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gym Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Control automatic WhatsApp messages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="sendWelcomeMessage" render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Send Welcome Message</FormLabel>
                          <FormDescription>Send WhatsApp welcome message on new member registration</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sendExpiryReminder" render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Send Expiry Reminders</FormLabel>
                          <FormDescription>Notify members before membership expires</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="reminderDaysBefore" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Days Before Expiry</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={30} {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormDescription>Send reminder X days before membership expires</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Settings</>}
                  </Button>
                </div>
              </TabsContent>

              {/* ── WhatsApp ── */}
              <TabsContent value="whatsapp" className="space-y-6">
                {waConfigured && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">API Configured</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        WhatsApp messages will be sent via your configured API endpoint.
                      </p>
                    </div>
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-xs">Active</Badge>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      WhatsApp API Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your WhatsApp API provider to send automated messages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="whatsappEnabled" render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel className="text-base">Enable WhatsApp Messaging</FormLabel>
                          <FormDescription>Turn on to allow automated WhatsApp messages</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />

                    {whatsappEnabled && (
                      <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                        <FormField control={form.control} name="whatsappInstanceId" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                              Instance ID
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 388342fa-c9dd-4768-b0b3-0bbe34c2d76a" {...field} />
                            </FormControl>
                            <FormDescription>Your WhatsApp API instance identifier</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="whatsappApiKey" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                              API Key
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showApiKey ? "text" : "password"}
                                  placeholder="wag_xxxxxxxxxxxxxxxxxxxx"
                                  className="pr-10"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowApiKey((v) => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormDescription>Keep this secret — it authenticates your API calls</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="whatsappEndpoint" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                              API Endpoint
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://send.fastpaynow.in/api/send" {...field} />
                            </FormControl>
                            <FormDescription>The URL your provider uses to receive message requests</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {waConfigured && whatsappEnabled && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base">Send a Test Message</CardTitle>
                      <CardDescription>Verify your configuration is working</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TestMessagePanel onTest={handleTestMessage} testing={testing} />
                    </CardContent>
                  </Card>
                )}

                <Card className="border-dashed">
                  <CardContent className="pt-5">
                    <div className="grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                      <div className="flex gap-2">
                        <span className="text-base">🔑</span>
                        <div>
                          <p className="font-medium text-foreground">API-based</p>
                          <p>No QR code or browser session needed.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-base">🔒</span>
                        <div>
                          <p className="font-medium text-foreground">Stored securely</p>
                          <p>Credentials are saved per gym and never exposed.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-base">⚡</span>
                        <div>
                          <p className="font-medium text-foreground">Always ready</p>
                          <p>Messages send instantly — no warm-up needed.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save WhatsApp Settings</>}
                  </Button>
                </div>
              </TabsContent>

              {/* ── Appearance ── */}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme & Colors</CardTitle>
                    <CardDescription>Customize your gym dashboard appearance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">

                    {/* Primary Color */}
                    <FormField control={form.control} name="primaryColor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormDescription className="mt-0">Main buttons, links & accents</FormDescription>
                        <div className="mt-3 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {PRIMARY_COLORS.map(({ hex, name }) => (
                              <ColorSwatch
                                key={hex}
                                hex={hex}
                                name={name}
                                selected={field.value === hex}
                                onClick={() => {
                                  field.onChange(hex);
                                  const paired = COLOR_PAIRS[hex];
                                  if (paired) form.setValue("accentColor", paired);
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md border shadow-sm shrink-0" style={{ backgroundColor: field.value }} />
                            <FormControl>
                              <Input type="color" {...field} className="w-24 h-9 p-1 cursor-pointer" />
                            </FormControl>
                            <span className="text-sm text-muted-foreground font-mono">{field.value}</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="border-t" />

                    {/* Accent Color */}
                    <FormField control={form.control} name="accentColor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <FormDescription className="mt-0">
                          Auto-selected based on primary — or pick manually
                        </FormDescription>
                        <div className="mt-3 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {ACCENT_COLORS.map(({ hex, name }) => (
                              <ColorSwatch
                                key={hex}
                                hex={hex}
                                name={name}
                                selected={field.value === hex}
                                onClick={() => field.onChange(hex)}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md border shadow-sm shrink-0" style={{ backgroundColor: field.value }} />
                            <FormControl>
                              <Input type="color" {...field} className="w-24 h-9 p-1 cursor-pointer" />
                            </FormControl>
                            <span className="text-sm text-muted-foreground font-mono">{field.value}</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="border-t" />

                    {/* Live preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Preview</p>
                      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
                        <button
                          type="button"
                          className="rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Primary Button
                        </button>
                        <button
                          type="button"
                          className="rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-opacity hover:opacity-90"
                          style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                          Outline Button
                        </button>
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          Accent Badge
                        </span>
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Primary Badge
                        </span>
                        <span
                          className="rounded-md border px-2 py-1 text-xs font-medium"
                          style={{ borderColor: accentColor, color: accentColor }}
                        >
                          Active Status
                        </span>
                      </div>
                    </div>

                    <div className="border-t" />

                    {/* Dark mode */}
                    <FormField control={form.control} name="darkModeEnabled" render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel className="text-base">Dark Mode</FormLabel>
                          <FormDescription>Enable dark theme gym-wide for all admins</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(val) => {
                              field.onChange(val);
                              // Preview dark mode instantly
                              applyGymTheme(primaryColor, accentColor, val);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )} />

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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}