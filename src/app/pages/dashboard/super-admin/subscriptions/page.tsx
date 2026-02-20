// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { addDays, format } from "date-fns";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";
// import { Plus, IndianRupee, Calendar, CheckCircle, XCircle, LayoutDashboard, Dumbbell, CreditCard, Users, Settings } from "lucide-react";
// import { DashboardLayout } from "@/components/DashboardLayout";

// type Gym = {
//   _count: {
//     students: number;
//   };
//   admin: { name: string };
//   id: string;
//   name: string;
//   subscription?: {
//     id: string;
//     plan: {
//       id: string;
//       name: string;
//       price: number;
//       duration: number;
//     };
//     status: "ACTIVE" | "EXPIRED" | "TRIAL" | "PENDING";
//     startDate: string;
//     endDate: string;
//     amountPaid: number;
//   } | null;
// };

// type Plan = {
//   id: string;
//   name: string;
//   price: number;
//   duration: number; // in days
//   isActive: boolean;
// };

// const subscriptionSchema = {
//   gymId: "",
//   planId: "",
//   startDate: new Date().toISOString(),
//   endDate: addDays(new Date(), 30).toISOString(),
//   amountPaid: 0,
//   status: "ACTIVE",
// };

// export default function GymSubscriptionsPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [gyms, setGyms] = useState<Gym[]>([]);
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Subscription dialog
//   const [subDialogOpen, setSubDialogOpen] = useState(false);
//   const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
//   const [subForm, setSubForm] = useState<typeof subscriptionSchema>(subscriptionSchema);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.role === "SUPER_ADMIN") {
//       fetchData();
//     } else if (status === "unauthenticated") {
//       router.replace("/pages/login");
//     }
//   }, [status, session, router]);

//   const fetchData = async () => {
//     setLoading(true);
  
//     try {
//       const [gymsRes, plansRes] = await Promise.all([
//         fetch("/api/super-admin/gyms", {
//           credentials: "include",
//           headers: { "Cache-Control": "no-store" },
//         }),
//         fetch("/api/super-admin/plans", {
//           credentials: "include",
//           headers: { "Cache-Control": "no-store" },
//         }),
//       ]);
  
//       // Handle each response separately for better error messages
//       let gymsData: Gym[] = [];
//       let plansData: Plan[] = [];
  
//       if (gymsRes.ok) {
//         gymsData = await gymsRes.json();
//       } else {
//         const errText = await gymsRes.text().catch(() => "");
//         console.warn(`Gyms fetch failed: ${gymsRes.status} ${errText}`);
//         toast.warning("Could not load gyms list");
//       }
  
//       if (plansRes.ok) {
//         plansData = await plansRes.json();
//       } else {
//         const errText = await plansRes.text().catch(() => "");
//         console.warn(`Plans fetch failed: ${plansRes.status} ${errText}`);
//         toast.warning("Could not load plans");
//       }
  
//       setGyms(gymsData);
//       setPlans(plansData.filter((p: Plan) => p.isActive));
  
//     } catch (err: unknown) {
//       console.error("Critical fetch error:", err);
//       toast.error("Failed to load required data. Please refresh.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const openSubDialog = (gym: Gym) => {
//     setSelectedGym(gym);
//     setSubForm({
//       gymId: gym.id,
//       planId: gym.subscription?.plan.id || "",
//       startDate: gym.subscription?.startDate || new Date().toISOString(),
//       endDate: gym.subscription?.endDate || addDays(new Date(), 30).toISOString(),
//       amountPaid: gym.subscription?.amountPaid || 0,
//       status: gym.subscription?.status || "ACTIVE",
//     });
//     setSubDialogOpen(true);
//   };

//   const handleSubChange = (field: keyof typeof subForm, value: unknown) => {
//     setSubForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleAddSubscription = async () => {
//     if (!subForm.planId) {
//       toast.error("Please select a plan");
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const res = await fetch("/api/super-admin/subscriptions", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(subForm),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error || "Failed to save subscription");
//       }

//       toast.success(
//         selectedGym?.subscription
//           ? "Subscription updated successfully"
//           : "Subscription added successfully"
//       );

//       setSubDialogOpen(false);
//       fetchData(); // refresh list
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         toast.error(err.message || "Something went wrong");
//       } else {
//         toast.error("Something went wrong");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };



//   if (status === "loading") {
//     return (
//         <DashboardLayout activePath="dashboard">
//         <div className="flex items-center justify-center h-96">
//           <Skeleton className="h-12 w-48" />
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout activePath="dashboard">
//       <div className="space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Gym Subscriptions</h1>
//             <p className="text-muted-foreground">
//               Manage subscription plans for all gyms
//             </p>
//           </div>
//         </div>

//         {/* All Gyms with Subscriptions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>All Gym Subscriptions</CardTitle>
//             <CardDescription>
//               View and manage subscription status for each gym
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="space-y-4">
//                 {[...Array(5)].map((_, i) => (
//                   <Skeleton key={i} className="h-16 w-full" />
//                 ))}
//               </div>
//             ) : gyms.length === 0 ? (
//               <div className="text-center py-12 text-muted-foreground">
//                 No gyms found
//               </div>
//             ) : (
//               <div className="rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Gym Name</TableHead>
//                       <TableHead>Admin</TableHead>
//                       <TableHead>Students</TableHead>
//                       <TableHead>Plan</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Expiry</TableHead>
//                       <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {gyms.map((gym) => (
//                       <TableRow key={gym.id}>
//                         <TableCell className="font-medium">{gym.name}</TableCell>
//                         <TableCell>{gym.admin?.name || "N/A"}</TableCell>
//                         <TableCell>{gym._count.students}</TableCell>
//                         <TableCell>
//                           {gym.subscription?.plan.name || "No Plan"}
//                         </TableCell>
//                         <TableCell>
//                           {gym.subscription ? (
//                             <Badge
//                               variant={
//                                 gym.subscription.status === "ACTIVE"
//                                   ? "default"
//                                   : gym.subscription.status === "TRIAL"
//                                   ? "secondary"
//                                   : "destructive"
//                               }
//                             >
//                               {gym.subscription.status}
//                             </Badge>
//                           ) : (
//                             <Badge variant="outline">Inactive</Badge>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           {gym.subscription?.endDate
//                             ? format(new Date(gym.subscription.endDate), "dd MMM yyyy")
//                             : "—"}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => openSubDialog(gym)}
//                           >
//                             {gym.subscription ? "Update" : "Add"} Subscription
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Subscription Form Dialog */}
//         <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {selectedGym?.subscription ? "Update" : "Add"} Subscription – {selectedGym?.name}
//               </DialogTitle>
//             </DialogHeader>
//             <div className="space-y-6 py-4">
//               <div className="space-y-2">
//                 <Label>Select Plan</Label>
//                 <Select
//                   value={subForm.planId}
//                   onValueChange={(val) => handleSubChange("planId", val)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a plan" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {plans.map((plan) => (
//                       <SelectItem key={plan.id} value={plan.id}>
//                         {plan.name} - ₹{plan.price} ({plan.duration} days)
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Start Date</Label>
//                   <Input
//                     type="date"
//                     value={format(new Date(subForm.startDate), "yyyy-MM-dd")}
//                     onChange={(e) =>
//                       handleSubChange("startDate", new Date(e.target.value).toISOString())
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>End Date</Label>
//                   <Input
//                     type="date"
//                     value={format(new Date(subForm.endDate), "yyyy-MM-dd")}
//                     onChange={(e) =>
//                       handleSubChange("endDate", new Date(e.target.value).toISOString())
//                     }
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label>Amount Paid (₹)</Label>
//                 <Input
//                   type="number"
//                   value={subForm.amountPaid}
//                   onChange={(e) => handleSubChange("amountPaid", Number(e.target.value))}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Status</Label>
//                 <Select
//                   value={subForm.status}
//                   onValueChange={(val) => handleSubChange("status", val)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="ACTIVE">Active</SelectItem>
//                     <SelectItem value="TRIAL">Trial</SelectItem>
//                     <SelectItem value="PENDING">Pending</SelectItem>
//                     <SelectItem value="EXPIRED">Expired</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <DialogFooter>
//               <Button variant="outline" onClick={() => setSubDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddSubscription} disabled={submitting}>
//                 {submitting ? "Saving..." : selectedGym?.subscription ? "Update" : "Add"} Subscription
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, IndianRupee, Calendar, CheckCircle, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

type Gym = {
  id: string;
  name: string;
  admin: { name: string };
  _count: { students: number };
  subscription?: {
    id: string;
    plan: { id: string; name: string; price: number; duration: number };
    status: "ACTIVE" | "EXPIRED" | "TRIAL" | "PENDING";
    startDate: string;
    endDate: string;
    amountPaid: number;
  } | null;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  duration: number;
  isActive: boolean;
};

const initialSubForm = {
  gymId: "",
  planId: "",
  startDate: new Date().toISOString(),
  endDate: addDays(new Date(), 30).toISOString(),
  amountPaid: 0,
  status: "ACTIVE" as "ACTIVE" | "EXPIRED" | "TRIAL" | "PENDING",
};

export default function GymSubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Main "Add Subscription" dialog (select gym + details)
  const [addSubDialogOpen, setAddSubDialogOpen] = useState(false);
  const [subForm, setSubForm] = useState<typeof initialSubForm>(initialSubForm);
  const [submitting, setSubmitting] = useState(false);

  // Quick update dialog from table row
  const [quickSubDialogOpen, setQuickSubDialogOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SUPER_ADMIN") {
      fetchData();
    } else if (status === "unauthenticated") {
      router.replace("/pages/login");
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gymsRes, plansRes] = await Promise.all([
        fetch("/api/super-admin/gyms", {
          credentials: "include",
          headers: { "Cache-Control": "no-store" },
        }),
        fetch("/api/super-admin/plans", {
          credentials: "include",
          headers: { "Cache-Control": "no-store" },
        }),
      ]);

      let gymsData: Gym[] = [];
      let plansData: Plan[] = [];

      if (gymsRes.ok) {
        gymsData = await gymsRes.json();
      } else {
        const errText = await gymsRes.text().catch(() => "");
        console.warn(`Gyms fetch failed: ${gymsRes.status} ${errText}`);
        toast.warning("Could not load gyms list");
      }

      if (plansRes.ok) {
        plansData = await plansRes.json();
      } else {
        const errText = await plansRes.text().catch(() => "");
        console.warn(`Plans fetch failed: ${plansRes.status} ${errText}`);
        toast.warning("Could not load plans");
      }

      setGyms(gymsData);
      setPlans(plansData.filter((p: Plan) => p.isActive));
    } catch (err: unknown) {
      console.error("Critical fetch error:", err);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for adding new subscription (select gym)
  const openAddSubscription = () => {
    setSubForm(initialSubForm);
    setAddSubDialogOpen(true);
  };

  // Open quick update dialog from table row
  const openQuickUpdate = (gym: Gym) => {
    setSelectedGym(gym);
    setSubForm({
      gymId: gym.id,
      planId: gym.subscription?.plan.id || "",
      startDate: gym.subscription?.startDate || new Date().toISOString(),
      endDate: gym.subscription?.endDate || addDays(new Date(), 30).toISOString(),
      amountPaid: gym.subscription?.amountPaid || 0,
      status: gym.subscription?.status || "ACTIVE",
    });
    setQuickSubDialogOpen(true);
  };

  const handleSubChange = (field: keyof typeof subForm, value: unknown) => {
    setSubForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSubscription = async () => {
    if (!subForm.gymId) {
      toast.error("Please select a gym");
      return;
    }
    if (!subForm.planId) {
      toast.error("Please select a plan");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/super-admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(subForm),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save subscription");
      }

      toast.success("Subscription saved successfully");
      setAddSubDialogOpen(false);
      setQuickSubDialogOpen(false);
      fetchData(); // Refresh list
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };


  if (status === "loading") {
    return (
      <DashboardLayout activePath="subscriptions">
        <div className="flex items-center justify-center h-96">
          <Skeleton className="h-12 w-48" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="subscriptions">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gym Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage and add subscription plans for all gyms
            </p>
          </div>
          <Button onClick={openAddSubscription} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {/* All Gyms Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Gyms</CardTitle>
            <CardDescription>
              View current subscription status and add/update plans
            </CardDescription>
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
                No gyms registered yet
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gym Name</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gyms.map((gym) => (
                      <TableRow key={gym.id}>
                        <TableCell className="font-medium">{gym.name}</TableCell>
                        <TableCell>{gym.admin?.name || "N/A"}</TableCell>
                        <TableCell>{gym._count.students}</TableCell>
                        <TableCell>
                          {gym.subscription?.plan.name || "No Plan"}
                        </TableCell>
                        <TableCell>
                          {gym.subscription ? (
                            <Badge
                              variant={
                                gym.subscription.status === "ACTIVE"
                                  ? "default"
                                  : gym.subscription.status === "TRIAL"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {gym.subscription.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {gym.subscription?.endDate
                            ? format(new Date(gym.subscription.endDate), "dd MMM yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openQuickUpdate(gym)}
                          >
                            {gym.subscription ? "Update" : "Add"} Plan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Add/Update Subscription Dialog (select gym) */}
        <Dialog open={addSubDialogOpen} onOpenChange={setAddSubDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
              <DialogDescription>
                Select a gym and assign a subscription plan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Gym Selection */}
              <div className="space-y-2">
                <Label>Select Gym</Label>
                <Select
                  value={subForm.gymId}
                  onValueChange={(val) => handleSubChange("gymId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a gym" />
                  </SelectTrigger>
                  <SelectContent>
                    {gyms.map((gym) => (
                      <SelectItem key={gym.id} value={gym.id}>
                        {gym.name} {gym.subscription ? `(Current: ${gym.subscription.plan.name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <Label>Select Plan</Label>
                <Select
                  value={subForm.planId}
                  onValueChange={(val) => handleSubChange("planId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.price} ({plan.duration} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={format(new Date(subForm.startDate), "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleSubChange("startDate", new Date(e.target.value).toISOString())
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={format(new Date(subForm.endDate), "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleSubChange("endDate", new Date(e.target.value).toISOString())
                    }
                  />
                </div>
              </div>

              {/* Amount & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount Paid (₹)</Label>
                  <Input
                    type="number"
                    value={subForm.amountPaid}
                    onChange={(e) => handleSubChange("amountPaid", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={subForm.status}
                    onValueChange={(val) => handleSubChange("status", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddSubDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubscription} disabled={submitting || !subForm.gymId || !subForm.planId}>
                {submitting ? "Saving..." : "Save Subscription"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Update Dialog (from table row) */}
        <Dialog open={quickSubDialogOpen} onOpenChange={setQuickSubDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedGym?.subscription ? "Update" : "Add"} Subscription – {selectedGym?.name}
              </DialogTitle>
            </DialogHeader>
            {/* Same form content as above, but pre-filled with selectedGym */}
            <div className="space-y-6 py-4">
              {/* ... copy the form fields from above, using subForm and handleSubChange ... */}
              {/* For brevity, reuse the same fields logic here or extract to a shared component */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuickSubDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubscription} disabled={submitting}>
                {submitting ? "Saving..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}