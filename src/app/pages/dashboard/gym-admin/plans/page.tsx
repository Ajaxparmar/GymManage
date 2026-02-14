// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { DataTable } from "@/components/DataTable";
// import { ColumnDef } from "@tanstack/react-table";
// import { PlanForm, type Plan } from "@/components/PlanForm";
// import { Badge } from "@/components/ui/badge";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Switch } from "@/components/ui/switch";
// import { Skeleton } from "@/components/ui/skeleton";
// import { DashboardLayout } from "@/components/DashboardLayout";
// import { toast } from "sonner";
// import { Lock, Edit, Trash2 } from "lucide-react";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// export default function PlansPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [addOpen, setAddOpen] = useState(false);
//   const [editOpen, setEditOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

//   const gymId = session?.user?.gymId as string | undefined;

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.replace("/login");
//       return;
//     }
//     if (status === "authenticated" && gymId) {
//       fetchPlans();
//     }
//   }, [status, gymId, router]);

//   const fetchPlans = async (silent = false) => {
//     if (!gymId) return;
//     if (!silent) setLoading(true);
//     try {
//       const res = await fetch("/api/dashboard/plans", { credentials: "include" });
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Failed to load plans");
//       }
//       const data: Plan[] = await res.json();
//       setPlans(data);
//     } catch (err: unknown) {
//       if (!silent) {
//         toast.error("Could not load membership plans");
//       }
//       console.error("fetchPlans error:", err);
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   const toggleActive = async (plan: Plan) => {
//     const newActive = !plan.isActive;
//     try {
//       const res = await fetch("/api/dashboard/plans", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ id: plan.id, isActive: newActive }),
//       });

//       if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(errText || "Failed to update status");
//       }

//       toast.success(`Plan ${newActive ? "activated" : "deactivated"} successfully`);
//       setPlans(prev =>
//         prev.map(p => p.id === plan.id ? { ...p, isActive: newActive } : p)
//       );
//     } catch (err: unknown) {
//       toast.error("Failed to update plan status");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       const res = await fetch(`/api/dashboard/plans?id=${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         throw new Error(err.message || "Delete failed");
//       }

//       toast.success("Plan deleted successfully");
//       setPlans(prev => prev.filter(p => p.id !== id));
//     } catch (err: unknown) {
//       toast.error("Could not delete plan");
//     }
//   };

//   const columns: ColumnDef<Plan>[] = [
//     {
//       accessorKey: "name",
//       header: "Plan Name",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-2">
//           {row.original.isDefault && (
//             <Lock className="h-4 w-4 text-amber-600" />
//           )}
//           <span className="font-medium">{row.original.name}</span>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "duration",
//       header: "Duration",
//       cell: ({ row }) => `${row.original.duration} days`,
//     },
//     {
//       accessorKey: "price",
//       header: "Price",
//       cell: ({ row }) => `₹${row.original.price.toLocaleString()}`,
//     },
//     {
//       accessorKey: "isDefault",
//       header: "Type",
//       cell: ({ row }) => (
//         <Badge variant={row.original.isDefault ? "default" : "outline"}>
//           {row.original.isDefault ? "Default" : "Custom"}
//         </Badge>
//       ),
//     },
//     {
//       accessorKey: "isActive",
//       header: "Status",
//       cell: ({ row }) => (
//         <Badge variant={row.original.isActive ? "default" : "secondary"}>
//           {row.original.isActive ? "Active" : "Inactive"}
//         </Badge>
//       ),
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => {
//         const plan = row.original;
//         const isDefault = plan.isDefault;

//         return (
//           <div className="flex items-center gap-1.5">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Switch
//                     checked={plan.isActive}
//                     onCheckedChange={() => toggleActive(plan)}
//                     disabled={isDefault}
//                   />
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   {plan.isActive ? "Deactivate plan" : "Activate plan"}
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>

//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => {
//                 setSelectedPlan(plan);
//                 setEditOpen(true);
//               }}
//             >
//               <Edit className="h-4 w-4" />
//             </Button>

//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="text-destructive hover:text-destructive/90"
//                   disabled={isDefault}
//                 >
//                   {isDefault ? (
//                     <Lock className="h-4 w-4 opacity-50" />
//                   ) : (
//                     <Trash2 className="h-4 w-4" />
//                   )}
//                 </Button>
//               </AlertDialogTrigger>
//               {!isDefault && (
//                 <AlertDialogContent>
//                   <AlertDialogHeader>
//                     <AlertDialogTitle>Delete Plan</AlertDialogTitle>
//                     <AlertDialogDescription>
//                       Are you sure you want to delete <strong>{plan.name}</strong>?<br />
//                       This cannot be undone. If members are using this plan, deletion will be blocked.
//                     </AlertDialogDescription>
//                   </AlertDialogHeader>
//                   <AlertDialogFooter>
//                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                     <AlertDialogAction
//                       onClick={() => handleDelete(plan.id)}
//                       className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                     >
//                       Delete
//                     </AlertDialogAction>
//                   </AlertDialogFooter>
//                 </AlertDialogContent>
//               )}
//             </AlertDialog>
//           </div>
//         );
//       },
//     },
//   ];

//   if (status === "loading" || loading) {
//     return (
//       <DashboardLayout activePath="plans">
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <Skeleton className="h-10 w-64" />
//               <Skeleton className="h-5 w-80 mt-2" />
//             </div>
//             <Skeleton className="h-10 w-32" />
//           </div>
//           <Skeleton className="h-[500px] w-full rounded-xl" />
//         </div>
//       </DashboardLayout>
//     );
//   }

//   if (!gymId) {
//     return (
//       <DashboardLayout activePath="plans">
//         <div className="flex flex-col items-center justify-center min-h-[60vh]">
//           <p className="text-lg text-muted-foreground">No gym associated with this account.</p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout activePath="plans">
//       <div className="space-y-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Membership Plans</h1>
//             <p className="text-muted-foreground mt-1.5">
//               Create and manage pricing plans for your gym members
//             </p>
//           </div>
//           <Button onClick={() => setAddOpen(true)}>
//             Add New Plan
//           </Button>
//         </div>

//         <DataTable
//           columns={columns}
//           data={plans}
    
//         />
//       </div>

//       {/* Add Dialog */}
//       <Dialog open={addOpen} onOpenChange={setAddOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Create Membership Plan</DialogTitle>
//           </DialogHeader>
//           <PlanForm
//             gymId={gymId}
//             onClose={() => {
//               setAddOpen(false);
//               fetchPlans(true); // silent refresh
//             }}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Edit Dialog */}
//       <Dialog open={editOpen} onOpenChange={setEditOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Edit Membership Plan</DialogTitle>
//           </DialogHeader>
//           {selectedPlan && (
//             <PlanForm
//               plan={selectedPlan}
//               gymId={gymId}
//               onClose={() => {
//                 setEditOpen(false);
//                 setSelectedPlan(null);
//                 fetchPlans(true); // silent refresh
//               }}
//             />
//           )}
//         </DialogContent>
//       </Dialog>
//     </DashboardLayout>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { PlanForm, type Plan } from "@/components/PlanForm";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Lock, Edit, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const gymId = session?.user?.gymId as string | undefined;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && gymId) {
      fetchPlans();
    }
  }, [status, gymId, router]);

  const fetchPlans = async (silent = false) => {
    if (!gymId) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/dashboard/plans", { credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load plans");
      }
      const data: Plan[] = await res.json();
      setPlans(data);
    } catch (err: unknown) {
      if (!silent) {
        toast.error("Could not load membership plans");
      }
      console.error("fetchPlans error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const toggleActive = async (plan: Plan) => {
    const newActive = !plan.isActive;
    try {
      const res = await fetch("/api/dashboard/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: plan.id, isActive: newActive }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to update status");
      }

      toast.success(`Plan ${newActive ? "activated" : "deactivated"} successfully`);
      setPlans(prev =>
        prev.map(p => p.id === plan.id ? { ...p, isActive: newActive } : p)
      );
    } catch (err: unknown) {
      toast.error("Failed to update plan status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/plans?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Delete failed");
      }

      toast.success("Plan deleted successfully");
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err: unknown) {
      toast.error("Could not delete plan");
    }
  };

  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isDefault && (
            <Lock className="h-4 w-4 text-amber-600" />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => `${row.original.duration} days`,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `₹${row.original.price.toLocaleString()}`,
    },
    {
      accessorKey: "isDefault",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.isDefault ? "default" : "outline"}>
          {row.original.isDefault ? "Default" : "Custom"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const plan = row.original;
        const isDefault = plan.isDefault;

        return (
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Switch
                    checked={plan.isActive}
                    onCheckedChange={() => toggleActive(plan)}
                    disabled={isDefault}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {plan.isActive ? "Deactivate plan" : "Activate plan"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedPlan(plan);
                setEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/90"
                  disabled={isDefault}
                >
                  {isDefault ? (
                    <Lock className="h-4 w-4 opacity-50" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              {!isDefault && (
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong>{plan.name}</strong>?<br />
                      This cannot be undone. If members are using this plan, deletion will be blocked.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(plan.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              )}
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  if (status === "loading" || loading) {
    return (
      <DashboardLayout activePath="plans">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-80 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!gymId) {
    return (
      <DashboardLayout activePath="plans">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg text-muted-foreground">No gym associated with this account.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="plans">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Membership Plans</h1>
            <p className="text-muted-foreground mt-1.5">
              Create and manage pricing plans for your gym members
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            Add New Plan
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={plans}
        />
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Membership Plan</DialogTitle>
          </DialogHeader>
          <PlanForm
            gymId={gymId}
            onClose={() => {
              setAddOpen(false);
              fetchPlans(true); // silent refresh
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Membership Plan</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <PlanForm
              plan={selectedPlan}
              gymId={gymId}
              onClose={() => {
                setEditOpen(false);
                setSelectedPlan(null);
                fetchPlans(true); // silent refresh
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}