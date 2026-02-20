"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GymForm } from "@/components/GymForm";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Building2,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Plus,
  LayoutDashboard,
  Dumbbell,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

type Gym = {
  id: string;
  name: string;
  address?: string | null;
  mobile?: string | null;
  email?: string | null;
  admin: {
    name: string;
    email: string;
  };
  subscription?: {
    plan: {
      name: string;
      price: number;
    };
    status: string;
    endDate: string;
  } | null;
  _count: {
    students: number;
    employees: number;
  };
  createdAt: string;
};

type DashboardStats = {
  stats: Array<{
    label: string;
    value: string | number;
    icon: string;
    color: string;
    change: string;
  }>;
  revenueData: Array<{ name: string; revenue: number }>;
  growthData: Array<{ name: string; gyms: number }>;
  pieData: Array<{ name: string; value: number }>;
  recentGyms: Array<{
    id: string;
    name: string;
    admin: string;
    students: number;
    subscription: string;
    status: string;
  }>;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
};

const columns: ColumnDef<Gym>[] = [
  {
    accessorKey: "name",
    header: "Gym Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "admin.name",
    header: "Admin",
    cell: ({ row }) => {
      const admin = row.original.admin;
      return (
        <div>
          <div className="font-medium">{admin.name}</div>
          <div className="text-sm text-muted-foreground">{admin.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => row.getValue("mobile") || "—",
  },
  {
    accessorKey: "_count.students",
    header: "Students",
    cell: ({ row }) => row.original._count.students.toLocaleString(),
  },
  {
    accessorKey: "subscription",
    header: "Subscription",
    cell: ({ row }) => {
      const sub = row.original.subscription;
      if (!sub) {
        return <Badge variant="destructive">No Plan</Badge>;
      }
      return (
        <div className="space-y-1">
          <div className="font-medium">{sub.plan.name}</div>
          <Badge
            variant={
              sub.status === "ACTIVE"
                ? "default"
                : sub.status === "TRIAL"
                ? "secondary"
                : "destructive"
            }
          >
            {sub.status}
          </Badge>
          <div className="text-xs text-muted-foreground">
            Ends: {format(new Date(sub.endDate), "dd MMM yyyy")}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          View
        </Button>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600">
          Delete
        </Button>
      </div>
    ),
  },
];

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gymsRes, dashboardRes] = await Promise.all([
        fetch("/api/super-admin/gyms", { credentials: "include" }),
        fetch("/api/super-admin/dashboard", { credentials: "include" }),
      ]);

      if (!gymsRes.ok || !dashboardRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const gymsData = await gymsRes.json();
      const dashData = await dashboardRes.json();

      setGyms(gymsData);
      setDashboardData(dashData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };


  if (status === "loading") {
    return (
      <DashboardLayout activePath="dashboard" >
        <div className="flex items-center justify-center h-96">
          <Skeleton className="h-12 w-48" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage all gyms, subscriptions, and users
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Gym
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Gym</DialogTitle>
              </DialogHeader>
              <GymForm
                onClose={() => {
                  setDialogOpen(false);
                  fetchData();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData.stats.map((stat, index) => {
              const Icon = iconMap[stat.icon as keyof typeof iconMap];
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.label}
                    </CardTitle>
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Recent Gyms */}
        {dashboardData && dashboardData.recentGyms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Gyms</CardTitle>
              <CardDescription>Latest registered gyms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentGyms.map((gym) => (
                  <div
                    key={gym.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{gym.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {gym.admin} • {gym.students} students
                      </p>
                    </div>
                    <Badge
                      variant={
                        gym.status === "ACTIVE"
                          ? "default"
                          : gym.status === "TRIAL"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {gym.subscription}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Gyms Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Gyms</CardTitle>
            <CardDescription>Manage all registered gyms</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : gyms.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No gyms registered yet. Add your first gym!
              </div>
            ) : (
              <DataTable columns={columns} data={gyms} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}