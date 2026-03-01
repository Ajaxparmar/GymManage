"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format, differenceInDays, isPast } from "date-fns";
import { toast } from "sonner";
import {
  Crown, Zap, Shield, Star, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, Users, Building2, Loader2, Send, ChevronRight, Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/DashboardLayout";

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  maxStudents: number;
  maxEmployees: number;
  features: string[];
  isActive: boolean;
};

type Subscription = {
  id: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "TRIAL" | "CANCELLED";
  autoRenewal: boolean;
  amountPaid: number;
  plan: Plan;
};

// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig = {
  ACTIVE: { label: "Active", color: "bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
  TRIAL: { label: "Trial", color: "bg-blue-500", textColor: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800" },
  EXPIRED: { label: "Expired", color: "bg-red-500", textColor: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
  SUSPENDED: { label: "Suspended", color: "bg-amber-500", textColor: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-400", textColor: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700" },
};

const planIcons: Record<string, React.ReactNode> = {
  Basic: <Shield className="h-5 w-5" />,
  Pro: <Zap className="h-5 w-5" />,
  Enterprise: <Crown className="h-5 w-5" />,
};

const planGradients: Record<string, string> = {
  Basic: "from-slate-500 to-slate-700",
  Pro: "from-blue-500 to-violet-600",
  Enterprise: "from-amber-500 to-orange-600",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [upgradeNote, setUpgradeNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/subscription", { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSubscription(data.subscription);
        setPlans(data.plans);
      } catch {
        toast.error("Failed to load subscription details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status]);

  // Derived values
  const daysLeft = subscription
    ? Math.max(0, differenceInDays(new Date(subscription.endDate), new Date()))
    : 0;

  const totalDays = subscription
    ? differenceInDays(new Date(subscription.endDate), new Date(subscription.startDate))
    : 0;

  const progressPct = totalDays > 0
    ? Math.max(0, Math.min(100, (daysLeft / totalDays) * 100))
    : 0;

  const isExpired = subscription ? isPast(new Date(subscription.endDate)) : false;
  const isCurrent = (planId: string) => subscription?.plan.id === planId;

  const openUpgradeDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setUpgradeNote("");
    setUpgradeDialogOpen(true);
  };

  const handleUpgradeRequest = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId: selectedPlan.id, message: upgradeNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      toast.success(data.message);
      setUpgradeDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <DashboardLayout activePath="subscription">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const cfg = subscription ? statusConfig[subscription.status] : statusConfig.EXPIRED;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout activePath="subscription">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-1.5">
            Manage your gym s plan and view available upgrades
          </p>
        </div>

        {/* ── Current Subscription Card ── */}
        {subscription ? (
          <Card className={`border-2 ${cfg.bg}`}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${planGradients[subscription.plan.name] ?? "from-slate-500 to-slate-700"} text-white shadow-lg`}>
                    {planIcons[subscription.plan.name] ?? <Star className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{subscription.plan.name} Plan</CardTitle>
                    <CardDescription className="mt-0.5">Current subscription</CardDescription>
                  </div>
                </div>
                <Badge
                  className={`${cfg.textColor} border font-semibold px-3 py-1 text-sm`}
                  variant="outline"
                >
                  <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${cfg.color}`} />
                  {cfg.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isExpired ? "Expired" : `${daysLeft} days remaining`}
                  </span>
                  <span className="text-muted-foreground">
                    {format(new Date(subscription.startDate), "dd MMM yyyy")} →{" "}
                    {format(new Date(subscription.endDate), "dd MMM yyyy")}
                  </span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>

              <Separator />

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Duration
                  </p>
                  <p className="font-semibold">{subscription.plan.duration} days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Max Members
                  </p>
                  <p className="font-semibold">
                    {subscription.plan.maxStudents === -1 ? "Unlimited" : subscription.plan.maxStudents}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Max Staff
                  </p>
                  <p className="font-semibold">
                    {subscription.plan.maxEmployees === -1 ? "Unlimited" : subscription.plan.maxEmployees}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Amount Paid
                  </p>
                  <p className="font-semibold">₹{subscription.amountPaid.toLocaleString()}</p>
                </div>
              </div>

              {/* Features */}
              {subscription.plan.features.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3">Included Features</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subscription.plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Expiry warning */}
              {(daysLeft <= 7 && !isExpired) && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Your subscription expires in <strong>{daysLeft} days</strong>. Contact us to renew or upgrade.
                  </p>
                </div>
              )}

              {isExpired && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-4 py-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Your subscription has expired. Please renew to continue using all features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Crown className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">No Active Subscription</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Choose a plan below to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Available Plans ── */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Available Plans
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Request an upgrade and our team will reach out within 24 hours
            </p>
          </div>

          {plans.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                No plans available at the moment. Please contact support.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isCurrentPlan = isCurrent(plan.id);
                const gradient = planGradients[plan.name] ?? "from-slate-500 to-slate-700";
                const icon = planIcons[plan.name] ?? <Star className="h-5 w-5" />;

                return (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden transition-all duration-200 ${
                      isCurrentPlan
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-3 right-3">
                        <Badge className="text-xs bg-primary text-primary-foreground">
                          Current Plan
                        </Badge>
                      </div>
                    )}

                    {/* Gradient header */}
                    <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                          {icon}
                        </div>
                        <span className="font-bold text-lg">{plan.name}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">₹{plan.price.toLocaleString()}</span>
                        <span className="text-white/70 text-sm">/ {plan.duration} days</span>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* Limits */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">Members</p>
                          <p className="font-bold text-sm mt-0.5">
                            {plan.maxStudents === -1 ? "∞" : plan.maxStudents}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">Staff</p>
                          <p className="font-bold text-sm mt-0.5">
                            {plan.maxEmployees === -1 ? "∞" : plan.maxEmployees}
                          </p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-1.5">
                        {plan.features.slice(0, 4).map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-muted-foreground">{f}</span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <p className="text-xs text-muted-foreground pl-5">
                            +{plan.features.length - 4} more features
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        className="w-full gap-2"
                        variant={isCurrentPlan ? "outline" : "default"}
                        disabled={isCurrentPlan}
                        onClick={() => !isCurrentPlan && openUpgradeDialog(plan)}
                      >
                        {isCurrentPlan ? (
                          <><CheckCircle2 className="h-4 w-4" />Current Plan</>
                        ) : (
                          <><ChevronRight className="h-4 w-4" />Request Upgrade</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Info strip ── */}
        <Card className="border-dashed">
          <CardContent className="pt-5">
            <div className="grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-base">📞</span>
                <div>
                  <p className="font-medium text-foreground">Human review</p>
                  <p>All upgrade requests are reviewed manually by our team.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-base">⚡</span>
                <div>
                  <p className="font-medium text-foreground">Fast activation</p>
                  <p>Plans are activated within 24 hours of payment confirmation.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-base">🔒</span>
                <div>
                  <p className="font-medium text-foreground">Data preserved</p>
                  <p>All your member data is safe when switching plans.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Upgrade Request Dialog ── */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Request Upgrade to {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>
              Our team will review your request and contact you within 24 hours to complete the upgrade.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              {/* Plan summary */}
              <div className={`rounded-xl bg-gradient-to-br ${planGradients[selectedPlan.name] ?? "from-slate-500 to-slate-700"} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {planIcons[selectedPlan.name] ?? <Star className="h-4 w-4" />}
                    <span className="font-semibold">{selectedPlan.name} Plan</span>
                  </div>
                  <span className="text-xl font-bold">
                    ₹{selectedPlan.price.toLocaleString()}
                    <span className="text-sm font-normal text-white/70 ml-1">
                      / {selectedPlan.duration}d
                    </span>
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-sm text-white/80">
                  <span>👥 {selectedPlan.maxStudents === -1 ? "Unlimited" : selectedPlan.maxStudents} members</span>
                  <span>🏢 {selectedPlan.maxEmployees === -1 ? "Unlimited" : selectedPlan.maxEmployees} staff</span>
                </div>
              </div>

              {/* Optional note */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Additional Note (optional)</label>
                <Textarea
                  placeholder="E.g. We need this by next week, preferred payment method is UPI..."
                  value={upgradeNote}
                  onChange={(e) => setUpgradeNote(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpgradeRequest} disabled={submitting} className="gap-2">
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
                : <><Send className="h-4 w-4" />Send Request</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}