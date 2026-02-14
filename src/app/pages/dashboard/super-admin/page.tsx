// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { GymForm } from "@/components/GymForm";
// import { DataTable } from "@/components/DataTable";
// import { ColumnDef } from "@tanstack/react-table";
// import { DashboardLayout } from "@/components/DashboardLayout";
// import { PlanForm } from "@/components/PlanForm";

// type Gym = {
//   id: string;
//   name: string;
//   address?: string;
//   mobile?: string;
//   email?: string;
// };

// const columns: ColumnDef<Gym>[] = [
//   { accessorKey: "name", header: "Name" },
//   { accessorKey: "address", header: "Address" },
//   { accessorKey: "mobile", header: "Mobile" },
//   { accessorKey: "email", header: "Email" },
//   {
//     id: "actions",
//     cell: ({ row }) => (
//       <div className="flex gap-2">
//         <Button variant="ghost" size="sm">Edit</Button>
//         <Button variant="ghost" size="sm">Delete</Button>
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button variant="outline" size="sm">Add Plan</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add Plan for {row.original.name}</DialogTitle>
//             </DialogHeader>
//             <PlanForm gymId={row.original.id} onClose={() => {}} />
//           </DialogContent>
//         </Dialog>
//       </div>
//     ),
//   },
// ];

// export default function SuperAdminDashboard() {
//   const [gyms, setGyms] = useState<Gym[]>([]);

//   useEffect(() => {
//     fetch("/api/gyms")
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch gyms");
//         return res.json();
//       })
//       .then(setGyms)
//       .catch((err) => console.error(err));
//   }, []);

//   return (
//     <DashboardLayout activePath="dashboard">
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button>Add New Gym</Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>Add New Gym</DialogTitle>
//               </DialogHeader>
//               <GymForm onClose={() => { /* optional: refresh gyms list */ }} />
//             </DialogContent>
//           </Dialog>
//         </div>

//         <DataTable columns={columns} data={gyms} />
//       </div>
//     </DashboardLayout>
//   );
// }

// app/dashboard/super-admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Building2,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

type Gym = {
  id: string;
  name: string;
  address?: string;
  mobile?: string;
  email?: string;
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
  };
  _count: {
    students: number;
    employees: number;
  };
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

const iconMap = {
  Building2,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
};

export default function SuperAdminDashboard() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gymsRes, dashboardRes] = await Promise.all([
        fetch("/api/admin/gyms"),
        fetch("/api/dashboard"),
      ]);

      if (!gymsRes.ok || !dashboardRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const gymsData = await gymsRes.json();
      const dashData = await dashboardRes.json();

      setGyms(gymsData);
      setDashboardData(dashData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Gym>[] = [
    { accessorKey: "name", header: "Gym Name" },
    {
      accessorKey: "admin.name",
      header: "Admin",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.admin.name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.admin.email}
          </div>
        </div>
      ),
    },
    { accessorKey: "mobile", header: "Mobile" },
    {
      accessorKey: "_count.students",
      header: "Students",
      cell: ({ row }) => row.original._count.students,
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
          <div>
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

  if (loading) {
    return (
      <DashboardLayout activePath="dashboard">
        <div className="flex items-center justify-center h-96">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage all gyms and subscriptions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Gym</Button>
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
                    className="flex items-center justify-between"
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
            <DataTable columns={columns} data={gyms} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}