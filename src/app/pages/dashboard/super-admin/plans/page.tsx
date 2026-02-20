"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

type GymSubscriptionPlan = {
  id: string;
  name: string;
  duration: number; // days
  price: number;
  maxStudents: number;
  maxEmployees: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function GymPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plans, setPlans] = useState<GymSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GymSubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    duration: 30,
    price: 0,
    maxStudents: 100,
    maxEmployees: 5,
    features: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SUPER_ADMIN") {
      fetchPlans();
    } else if (status === "unauthenticated") {
      router.replace("/pages/login");
    }
  }, [status, session, router]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/plans", {
        credentials: "include",
        headers: { "Cache-Control": "no-store" },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch plans");
      }

      const data = await res.json();
      setPlans(data);
    } catch (err: unknown) {
      console.error("Fetch plans error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      duration: 30,
      price: 0,
      maxStudents: 100,
      maxEmployees: 5,
      features: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: GymSubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      duration: plan.duration,
      price: plan.price,
      maxStudents: plan.maxStudents,
      maxEmployees: plan.maxEmployees,
      features: plan.features.join(", "),
      isActive: plan.isActive,
    });
    setDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (formData.duration <= 0) {
      toast.error("Duration must be greater than 0 days");
      return;
    }
    if (formData.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingPlan ? `/api/super-admin/plans?id=${editingPlan.id}` : "/api/super-admin/plans";
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          features: formData.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Failed to ${editingPlan ? "update" : "create"} plan`);
      }

      toast.success(`Plan ${editingPlan ? "updated" : "created"} successfully`);
      setDialogOpen(false);
      fetchPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this plan? Gyms won't be able to select it anymore.")) return;

    try {
      const res = await fetch(`/api/super-admin/plans?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to deactivate plan");

      toast.success("Plan deactivated");
      fetchPlans();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate plan");
    }
  };



  if (status === "loading") {
    return (
      <DashboardLayout activePath="plans">
        <div className="flex items-center justify-center h-96">
          <Skeleton className="h-12 w-48" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="plans">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gym Subscription Plans</h1>
            <p className="text-muted-foreground">
              Manage SaaS pricing tiers that gyms subscribe to
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Plan
          </Button>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Plans</CardTitle>
            <CardDescription>
              Define pricing tiers for gyms (Basic, Pro, Enterprise, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No subscription plans created yet
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Max Students</TableHead>
                      <TableHead>Max Employees</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.duration} days</TableCell>
                        <TableCell>₹{plan.price.toLocaleString()}</TableCell>
                        <TableCell>
                          {plan.maxStudents === -1 ? "Unlimited" : plan.maxStudents}
                        </TableCell>
                        <TableCell>
                          {plan.maxEmployees === -1 ? "Unlimited" : plan.maxEmployees}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {plan.features.map((f) => (
                              <Badge key={f} variant="secondary" className="text-xs">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {plan.isActive && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeactivate(plan.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit Plan Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit" : "Create New"} Subscription Plan
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={formData.name}
                    onChange={handleChange}
                    name="name"
                    placeholder="e.g. Pro Monthly"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={handleChange}
                    name="duration"
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    name="price"
                    min={0}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Students</Label>
                  <Input
                    type="number"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    name="maxStudents"
                    min={-1}
                    placeholder="-1 = unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Employees</Label>
                  <Input
                    type="number"
                    value={formData.maxEmployees}
                    onChange={handleChange}
                    name="maxEmployees"
                    min={-1}
                    placeholder="-1 = unlimited"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Features (comma separated)</Label>
                  <Input
                    value={formData.features}
                    onChange={handleChange}
                    name="features"
                    placeholder="WhatsApp, SMS, Analytics, Priority Support"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Active (visible to gyms)</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}