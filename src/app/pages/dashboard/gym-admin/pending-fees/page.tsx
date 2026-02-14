// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
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
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { DashboardLayout } from "@/components/DashboardLayout";
// import { IndianRupee, ArrowRight, Search, Loader2 } from "lucide-react";
// import { format, differenceInDays } from "date-fns";

// type MemberWithPending = {
//   id: string;
//   name: string;
//   mobile: string;
//   plan: { name: string };
//   expiryDate: string;
//   totalFees: number;
//   paidAmount: number;
//   pendingAmount: number;
//   status: string;
// };

// export default function PendingFeesPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [members, setMembers] = useState<MemberWithPending[]>([]);
//   const [filteredMembers, setFilteredMembers] = useState<MemberWithPending[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   // Dialog state
//   const [selectedMember, setSelectedMember] = useState<MemberWithPending | null>(null);
//   const [payAmount, setPayAmount] = useState<number>(0);
//   const [payLoading, setPayLoading] = useState(false);

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.replace("/login");
//       return;
//     }
//     if (status === "authenticated" && session?.user?.gymId) {
//       fetchPendingMembers();
//     }
//   }, [status, session?.user?.gymId, router]);

//   const fetchPendingMembers = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/dashboard/pending-fees", {
//         credentials: "include",
//         cache: "no-store",
//       });

//       if (!res.ok) throw new Error(await res.text());

//       const data: MemberWithPending[] = await res.json();
//       setMembers(data);
//       setFilteredMembers(data);
//     } catch (err: unknown) {
//       console.error(err);
//       toast.error("Could not load pending dues");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Search filter
//   useEffect(() => {
//     if (!search.trim()) {
//       setFilteredMembers(members);
//       return;
//     }
//     const term = search.toLowerCase();
//     setFilteredMembers(
//       members.filter(
//         (m) =>
//           m.name.toLowerCase().includes(term) ||
//           m.mobile.includes(term)
//       )
//     );
//   }, [search, members]);

//   const totalPending = members.reduce((sum, m) => sum + m.pendingAmount, 0);

//   const openPayDialog = (member: MemberWithPending) => {
//     setSelectedMember(member);
//     setPayAmount(member.pendingAmount); // pre-fill with full pending
//   };

//   const handlePayFee = async () => {
//     if (!selectedMember || payAmount <= 0 || payAmount > selectedMember.pendingAmount) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     setPayLoading(true);

//     try {
//       const res = await fetch("/api/dashboard/payments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           studentId: selectedMember.id,
//           amount: payAmount,
//           paymentMethod: "CASH", // you can make this selectable later
//           remarks: `Fee payment on ${new Date().toISOString()}`,
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Payment failed");
//       }

//       toast.success(`₹${payAmount.toLocaleString()} paid successfully!`);

//       // Optimistic update: reduce pending amount
//       setMembers((prev) =>
//         prev.map((m) =>
//           m.id === selectedMember.id
//             ? {
//                 ...m,
//                 paidAmount: m.paidAmount + payAmount,
//                 pendingAmount: m.pendingAmount - payAmount,
//               }
//             : m
//         )
//       );

//       // Remove from list if fully paid
//       if (selectedMember.pendingAmount - payAmount <= 0) {
//         setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
//         setFilteredMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
//       }

//       setSelectedMember(null);
//       setPayAmount(0);
//     } catch (err: string | unknown) {
//       if (err instanceof Error) {
//         toast.error(err.message || "Failed to record payment");
//       } else {
//         toast.error("Failed to record payment");
//       }
//     } finally {
//       setPayLoading(false);
//     }
//   };

//   if (status === "loading" || loading) {
//     return (
//       <DashboardLayout activePath="pending-fees">
//         <div className="space-y-6">
//           <Skeleton className="h-10 w-64" />
//           <Skeleton className="h-8 w-48" />
//           <Skeleton className="h-12 w-full" />
//           {Array.from({ length: 6 }).map((_, i) => (
//             <Skeleton key={i} className="h-16 w-full" />
//           ))}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout activePath="pending-fees">
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Pending Fees</h1>
//             <p className="text-muted-foreground mt-1.5">
//               Track and collect outstanding dues
//             </p>
//           </div>

//           <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100 shadow-sm">
//             <CardHeader className="pb-2">
//               <CardTitle className="text-lg text-red-800 flex items-center gap-2">
//                 <IndianRupee className="h-5 w-5" />
//                 Total Pending
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-4xl font-bold text-red-700">
//                 ₹{totalPending.toLocaleString()}
//               </div>
//               <p className="text-sm text-red-600/80 mt-1">
//                 {members.length} member{members.length !== 1 ? "s" : ""} with dues
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Search */}
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search name or mobile..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-10 bg-white"
//           />
//         </div>

//         {/* Table */}
//         <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/50">
//                 <TableHead className="font-semibold">Member</TableHead>
//                 <TableHead>Mobile</TableHead>
//                 <TableHead>Plan</TableHead>
//                 <TableHead>Expiry</TableHead>
//                 <TableHead>Total</TableHead>
//                 <TableHead>Paid</TableHead>
//                 <TableHead className="text-right">Pending</TableHead>
//                 <TableHead className="text-right pr-6">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredMembers.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
//                     {search
//                       ? "No matching members with pending fees"
//                       : "Great job! No pending dues right now."}
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredMembers.map((member) => (
//                   <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
//                     <TableCell className="font-medium">{member.name}</TableCell>
//                     <TableCell>{member.mobile}</TableCell>
//                     <TableCell className="text-muted-foreground">
//                       {member.plan?.name || "—"}
//                     </TableCell>
//                     <TableCell>
//                       {format(new Date(member.expiryDate), "dd MMM yyyy")}
//                       {differenceInDays(new Date(member.expiryDate), new Date()) <= 7 && (
//                         <Badge variant="outline" className="ml-2 border-amber-400 text-amber-700">
//                           Soon
//                         </Badge>
//                       )}
//                     </TableCell>
//                     <TableCell>₹{member.totalFees.toLocaleString()}</TableCell>
//                     <TableCell>₹{member.paidAmount.toLocaleString()}</TableCell>
//                     <TableCell className="text-right font-semibold text-red-600">
//                       ₹{member.pendingAmount.toLocaleString()}
//                     </TableCell>
//                     <TableCell className="text-right pr-6">
//                       <Dialog>
//                         <DialogTrigger asChild>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="gap-1.5"
//                             onClick={() => openPayDialog(member)}
//                           >
//                             <IndianRupee className="h-3.5 w-3.5" />
//                             Collect
//                           </Button>
//                         </DialogTrigger>

//                         <DialogContent className="sm:max-w-md">
//                           <DialogHeader>
//                             <DialogTitle>Collect Fee – {member.name}</DialogTitle>
//                             <DialogDescription>
//                               Pending amount: <strong>₹{member.pendingAmount.toLocaleString()}</strong>
//                             </DialogDescription>
//                           </DialogHeader>

//                           <div className="space-y-6 py-4">
//                             <div className="space-y-2">
//                               <Label htmlFor="payAmount">Amount to Collect (₹)</Label>
//                               <Input
//                                 id="payAmount"
//                                 type="number"
//                                 min={1}
//                                 max={member.pendingAmount}
//                                 value={payAmount}
//                                 onChange={(e) => setPayAmount(Number(e.target.value))}
//                                 className="text-lg"
//                               />
//                               <p className="text-sm text-muted-foreground">
//                                 Remaining after payment:{" "}
//                                 <span className="font-medium">
//                                   ₹{(member.pendingAmount - payAmount).toLocaleString()}
//                                 </span>
//                               </p>
//                             </div>
//                           </div>

//                           <DialogFooter>
//                             <Button
//                               variant="outline"
//                               onClick={() => setSelectedMember(null)}
//                               disabled={payLoading}
//                             >
//                               Cancel
//                             </Button>
//                             <Button
//                               onClick={handlePayFee}
//                               disabled={payLoading || payAmount <= 0 || payAmount > member.pendingAmount}
//                             >
//                               {payLoading ? (
//                                 <>
//                                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                   Processing...
//                                 </>
//                               ) : (
//                                 `Collect ₹${payAmount.toLocaleString()}`
//                               )}
//                             </Button>
//                           </DialogFooter>
//                         </DialogContent>
//                       </Dialog>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { IndianRupee, ArrowRight, Search, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

type MemberWithPending = {
  id: string;
  name: string;
  mobile: string;
  plan: { name: string };
  expiryDate: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
};

export default function PendingFeesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<MemberWithPending[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberWithPending[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog state - FIXED: Added dialogOpen state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithPending | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.gymId) {
      fetchPendingMembers();
    }
  }, [status, session?.user?.gymId, router]);

  const fetchPendingMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/pending-fees", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await res.text());

      const data: MemberWithPending[] = await res.json();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Could not load pending dues");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredMembers(members);
      return;
    }
    const term = search.toLowerCase();
    setFilteredMembers(
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.mobile.includes(term)
      )
    );
  }, [search, members]);

  const totalPending = members.reduce((sum, m) => sum + m.pendingAmount, 0);

  const openPayDialog = (member: MemberWithPending) => {
    setSelectedMember(member);
    setPayAmount(member.pendingAmount); // pre-fill with full pending
    setDialogOpen(true);
  };

  // FIXED: Close dialog properly
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMember(null);
    setPayAmount(0);
  };

  const handlePayFee = async () => {
    if (!selectedMember || payAmount <= 0 || payAmount > selectedMember.pendingAmount) {
      toast.error("Please enter a valid amount");
      return;
    }

    setPayLoading(true);

    try {
      const res = await fetch("/api/dashboard/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: selectedMember.id,
          amount: payAmount,
          paymentMethod: "CASH", // you can make this selectable later
          remarks: `Fee payment on ${new Date().toISOString()}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Payment failed");
      }

      toast.success(`₹${payAmount.toLocaleString()} paid successfully!`);

      // Optimistic update: reduce pending amount
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id
            ? {
                ...m,
                paidAmount: m.paidAmount + payAmount,
                pendingAmount: m.pendingAmount - payAmount,
              }
            : m
        )
      );

      // Remove from list if fully paid
      if (selectedMember.pendingAmount - payAmount <= 0) {
        setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
        setFilteredMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      }

      // FIXED: Close dialog after successful payment
      closeDialog();
    } catch (err: string | unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to record payment");
      } else {
        toast.error("Failed to record payment");
      }
    } finally {
      setPayLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout activePath="pending-fees">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="pending-fees">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Fees</h1>
            <p className="text-muted-foreground mt-1.5">
              Track and collect outstanding dues
            </p>
          </div>

          <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Total Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-700">
                ₹{totalPending.toLocaleString()}
              </div>
              <p className="text-sm text-red-600/80 mt-1">
                {members.length} member{members.length !== 1 ? "s" : ""} with dues
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Member</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    {search
                      ? "No matching members with pending fees"
                      : "Great job! No pending dues right now."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.mobile}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.plan?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(member.expiryDate), "dd MMM yyyy")}
                      {differenceInDays(new Date(member.expiryDate), new Date()) <= 7 && (
                        <Badge variant="outline" className="ml-2 border-amber-400 text-amber-700">
                          Soon
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>₹{member.totalFees.toLocaleString()}</TableCell>
                    <TableCell>₹{member.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      ₹{member.pendingAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openPayDialog(member)}
                      >
                        <IndianRupee className="h-3.5 w-3.5" />
                        Collect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* FIXED: Dialog moved outside of table, controlled by dialogOpen state */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Fee – {selectedMember?.name}</DialogTitle>
            <DialogDescription>
              Pending amount: <strong>₹{selectedMember?.pendingAmount.toLocaleString()}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="payAmount">Amount to Collect (₹)</Label>
              <Input
                id="payAmount"
                type="number"
                min={1}
                max={selectedMember?.pendingAmount || 0}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Remaining after payment:{" "}
                <span className="font-medium">
                  ₹{((selectedMember?.pendingAmount || 0) - payAmount).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={payLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayFee}
              disabled={
                payLoading || 
                payAmount <= 0 || 
                payAmount > (selectedMember?.pendingAmount || 0)
              }
            >
              {payLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Collect ₹${payAmount.toLocaleString()}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}