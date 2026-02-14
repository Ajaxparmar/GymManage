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
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { DashboardLayout } from "@/components/DashboardLayout";
// import { Edit, Trash2, IndianRupee, Plus } from "lucide-react";
// import { format, differenceInDays } from "date-fns";
// import Link from "next/link";

// type Member = {
//   id: string;
//   name: string;
//   mobile: string;
//   email?: string | null;
//   joiningDate: string;
//   expiryDate: string;
//   status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
//   totalFees: number;
//   paidAmount: number;
//   pendingAmount: number;
//   plan: { name: string; duration: number };
// };

// export default function MembersPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [members, setMembers] = useState<Member[]>([]);
//   const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.replace("/login");
//       return;
//     }
//     if (status === "authenticated" && session?.user?.gymId) {
//       fetchMembers();
//     }
//   }, [status, session?.user?.gymId, router]);

//   const fetchMembers = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/members", { credentials: "include" });
//       if (!res.ok) throw new Error(await res.text());
//       const data = await res.json();
//       setMembers(data);
//       setFilteredMembers(data);
//     } catch (err: unknown) {
//       toast.error("Failed to load members");
//       console.error(err);
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
//     const filtered = members.filter(
//       (m) =>
//         m.name.toLowerCase().includes(term) ||
//         m.mobile.includes(term) ||
//         (m.email && m.email.toLowerCase().includes(term))
//     );
//     setFilteredMembers(filtered);
//   }, [search, members]);

//   const handleDelete = async (id: string) => {
//     try {
//       const res = await fetch(`/api/members?id=${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Delete failed");
//       }
//       toast.success("Member deleted successfully");
//       setMembers((prev) => prev.filter((m) => m.id !== id));
//       setFilteredMembers((prev) => prev.filter((m) => m.id !== id));
//     } catch (err: unknown) {
//       toast.error("Could not delete member");
//     }
//   };

//   const getStatusBadge = (member: Member) => {
//     const daysLeft = differenceInDays(new Date(member.expiryDate), new Date());
//     if (member.status !== "ACTIVE") {
//       return <Badge variant="destructive">Inactive</Badge>;
//     }
//     if (daysLeft <= 0) {
//       return <Badge variant="destructive">Expired</Badge>;
//     }
//     if (daysLeft <= 7) {
//       return <Badge variant="secondary">Expiring soon ({daysLeft}d)</Badge>;
//     }
//     return <Badge variant="default">Active ({daysLeft}d left)</Badge>;
//   };

//   if (status === "loading" || loading) {
//     return (
//       <DashboardLayout activePath="members">
//         <div className="space-y-6">
//           <div className="flex justify-between items-center">
//             <Skeleton className="h-10 w-64" />
//             <Skeleton className="h-10 w-40" />
//           </div>
//           <Skeleton className="h-12 w-full" />
//           {Array.from({ length: 8 }).map((_, i) => (
//             <Skeleton key={i} className="h-16 w-full" />
//           ))}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout activePath="members">
//       <div className="space-y-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Gym Members</h1>
//             <p className="text-muted-foreground mt-1.5">
//               Manage all your gym members and their memberships
//             </p>
//           </div>
//           <Button asChild>
//             <Link href="/dashboard/gym-admin/members/new">
//               <Plus className="mr-2 h-4 w-4" />
//               Add New Member
//             </Link>
//           </Button>
//         </div>

//         <div className="flex items-center gap-4">
//           <Input
//             placeholder="Search by name, mobile or email..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="max-w-sm"
//           />
//         </div>

//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Mobile</TableHead>
//                 <TableHead>Plan</TableHead>
//                 <TableHead>Expiry</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="text-right">Pending</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredMembers.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
//                     {search ? "No members match your search" : "No members yet. Add your first member."}
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredMembers.map((member) => (
//                   <TableRow key={member.id} className="hover:bg-muted/50">
//                     <TableCell className="font-medium">{member.name}</TableCell>
//                     <TableCell>{member.mobile}</TableCell>
//                     <TableCell>{member.plan?.name || "—"}</TableCell>
//                     <TableCell>
//                       {format(new Date(member.expiryDate), "dd MMM yyyy")}
//                     </TableCell>
//                     <TableCell>{getStatusBadge(member)}</TableCell>
//                     <TableCell className="text-right font-medium">
//                       {member.pendingAmount > 0 ? (
//                         <span className="text-red-600">
//                           ₹{member.pendingAmount.toLocaleString()}
//                         </span>
//                       ) : (
//                         <span className="text-green-600">₹0</span>
//                       )}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-1">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           asChild
//                         >
//                           <Link href={`/dashboard/gym-admin/members/${member.id}/edit`}>
//                             <Edit className="h-4 w-4" />
//                           </Link>
//                         </Button>

//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           asChild
//                         >
//                           <Link href={`/dashboard/gym-admin/members/${member.id}/pay`}>
//                             <IndianRupee className="h-4 w-4" />
//                           </Link>
//                         </Button>

//                         <AlertDialog>
//                           <AlertDialogTrigger asChild>
//                             <Button variant="ghost" size="icon" className="text-destructive">
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </AlertDialogTrigger>
//                           <AlertDialogContent>
//                             <AlertDialogHeader>
//                               <AlertDialogTitle>Delete Member</AlertDialogTitle>
//                               <AlertDialogDescription>
//                                 Are you sure you want to delete <strong>{member.name}</strong>?<br />
//                                 This action cannot be undone.
//                               </AlertDialogDescription>
//                             </AlertDialogHeader>
//                             <AlertDialogFooter>
//                               <AlertDialogCancel>Cancel</AlertDialogCancel>
//                               <AlertDialogAction
//                                 onClick={() => handleDelete(member.id)}
//                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                               >
//                                 Delete
//                               </AlertDialogAction>
//                             </AlertDialogFooter>
//                           </AlertDialogContent>
//                         </AlertDialog>
//                       </div>
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, Download, UserPlus, IndianRupee, Loader2, Eye, Edit, CalendarIcon } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar";
  

type Member = {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    photo?: string | null;
    plan: { name: string };
    planId: string;
    status: string;
    joiningDate: string;
    expiryDate: string;
    totalFees: number;
    paidAmount: number;
    pendingAmount: number;
};

type Plan = {
    isActive: boolean;
    id: string;
    name: string;
    duration: number;
    price: number;
};

// Edit form schema
const editMemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z.string().regex(/^[0-9]{10,15}$/, "Mobile number should be 10-15 digits"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    address: z.string().optional(),
    planId: z.string().min(1, "Select a plan"),
    joiningDate: z.date(),
    expiryDate: z.date(),
    totalFees: z.number().min(0),
    paidAmount: z.number().min(0),
    pendingAmount: z.number().min(0),
});

type EditMemberFormValues = z.infer<typeof editMemberSchema>;

export default function AllMembersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Payment dialog state
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [selectedMemberForPay, setSelectedMemberForPay] = useState<Member | null>(null);
    const [payAmount, setPayAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const [payLoading, setPayLoading] = useState(false);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<Member | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    const form = useForm<EditMemberFormValues>({
        resolver: zodResolver(editMemberSchema),
        defaultValues: {
            name: "",
            mobile: "",
            email: "",
            address: "",
            planId: "",
            joiningDate: new Date(),
            expiryDate: new Date(),
            totalFees: 0,
            paidAmount: 0,
            pendingAmount: 0,
        },
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }
        if (status === "authenticated") {
            fetchMembers();
            fetchPlans();
        }
    }, [status, router]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/dashboard/members", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/dashboard/plans", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setPlans(data.filter((p: Plan) => p.isActive !== false));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Auto-update expiry & fees when plan changes
    const selectedPlanId = form.watch("planId");
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);

    useEffect(() => {
        if (!selectedPlan) return;

        const durationDays = Number(selectedPlan.duration) || 30;
        const joining = form.getValues("joiningDate") || new Date();
        const expiry = new Date(joining);
        expiry.setDate(expiry.getDate() + durationDays);

        const planPrice = Number(selectedPlan.price) || 0;
        const paid = Number(form.getValues("paidAmount")) || 0;

        form.setValue("expiryDate", expiry);
        form.setValue("totalFees", planPrice);
        form.setValue("pendingAmount", Math.max(0, planPrice - paid));
    }, [selectedPlan, form.watch("joiningDate"), form.watch("paidAmount")]);

    // Payment Dialog Functions
    const openPayDialog = (member: Member) => {
        setSelectedMemberForPay(member);
        setPayAmount(member.pendingAmount);
        setPaymentMethod("CASH");
        setPayDialogOpen(true);
    };

    const closePayDialog = () => {
        setPayDialogOpen(false);
        setSelectedMemberForPay(null);
        setPayAmount(0);
        setPaymentMethod("CASH");
    };

    const handlePayFee = async () => {
        if (!selectedMemberForPay || payAmount <= 0 || payAmount > selectedMemberForPay.pendingAmount) {
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
                    studentId: selectedMemberForPay.id,
                    amount: payAmount,
                    paymentMethod: paymentMethod,
                    remarks: `Payment collected on ${new Date().toISOString()}`,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Payment failed");
            }

            toast.success(`₹${payAmount.toLocaleString()} collected successfully!`);

            setMembers((prev) =>
                prev.map((m) =>
                    m.id === selectedMemberForPay.id
                        ? {
                            ...m,
                            paidAmount: m.paidAmount + payAmount,
                            pendingAmount: m.pendingAmount - payAmount,
                        }
                        : m
                )
            );

            closePayDialog();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to record payment");
            }
        } finally {
            setPayLoading(false);
        }
    };

    // Edit Dialog Functions
    const openEditDialog = (member: Member) => {
        setSelectedMemberForEdit(member);
        form.reset({
            name: member.name,
            mobile: member.mobile,
            email: member.email || "",
            address: member.address || "",
            planId: member.planId,
            joiningDate: new Date(member.joiningDate),
            expiryDate: new Date(member.expiryDate),
            totalFees: member.totalFees,
            paidAmount: member.paidAmount,
            pendingAmount: member.pendingAmount,
        });
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setSelectedMemberForEdit(null);
        form.reset();
    };

    const handleEditMember = async (values: EditMemberFormValues) => {
        if (!selectedMemberForEdit) return;

        setEditLoading(true);

        try {
            const res = await fetch("/api/dashboard/members", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: selectedMemberForEdit.id,
                    ...values,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to update member");
            }

            const updatedMember = await res.json();
            toast.success("Member updated successfully!");

            // Update local state
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === selectedMemberForEdit.id
                        ? {
                            ...m,
                            ...values,
                            joiningDate: values.joiningDate.toISOString(),
                            expiryDate: values.expiryDate.toISOString(),
                            plan: { name: selectedPlan?.name || m.plan.name },
                        }
                        : m
                )
            );

            closeEditDialog();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Failed to update member");
            }
        } finally {
            setEditLoading(false);
        }
    };

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.mobile.includes(search)
    );

    const stats = [
        {
            label: "Total Members",
            value: members.length,
            color: "text-foreground",
        },
        {
            label: "Active",
            value: members.filter((m) => m.status === "ACTIVE").length,
            color: "text-green-600",
        },
        {
            label: "Expired",
            value: members.filter((m) => m.status === "EXPIRED").length,
            color: "text-red-600",
        },
        {
            label: "Pending Fees",
            value: `₹${members.reduce((sum, m) => sum + m.pendingAmount, 0).toLocaleString()}`,
            color: "text-amber-600",
        },
    ];

    if (status === "loading" || loading) {
        return (
            <DashboardLayout activePath="allmembers">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-[500px] w-full" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activePath="allmembers">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">All Members</h1>
                        <p className="text-muted-foreground mt-1.5">
                            Manage and view all gym members
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button onClick={() => router.push("/pages/dashboard/gym-admin/addmembers")} className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Member</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards - Horizontal scroll on mobile */}
                <div className="relative">
                    <div className="overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0">
                        <div className="flex md:grid md:grid-cols-4 gap-4 min-w-max md:min-w-0">
                            {stats.map((stat, index) => (
                                <Card key={index} className="p-4 min-w-[160px] md:min-w-0">
                                    <p className="text-sm text-muted-foreground whitespace-nowrap">{stat.label}</p>
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div className="md:hidden absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or mobile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table Container */}
                <div className="w-full rounded-xl border bg-card shadow-sm overflow-x-auto">
                    <div className="min-w-max w-full">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">


                                    <TableHead className="min-w-[70px]">Image</TableHead>
                                    <TableHead className="font-semibold min-w-[180px]">Name</TableHead>
                                    <TableHead className="min-w-[130px]">Mobile</TableHead>
                                    {/* <TableHead className="min-w-[200px]">Email</TableHead> */}
                                    <TableHead className="min-w-[120px]">Plan</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="min-w-[130px]">Joining Date</TableHead>
                                    <TableHead className="min-w-[130px]">Expiry Date</TableHead>
                                    <TableHead className="min-w-[100px]">Total Fees</TableHead>
                                    <TableHead className="min-w-[100px]">Paid</TableHead>
                                    <TableHead className="min-w-[100px]">Pending</TableHead>
                                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                                            {search ? "No members found" : "No members yet. Add your first member!"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <TableRow key={member.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={member.photo || ""} alt={member.name} />
                                                    <AvatarFallback>
                                                        {member.name?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>

                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell>{member.mobile}</TableCell>
                                            {/* <TableCell className="text-muted-foreground">
                                                {member.email || "—"}
                                            </TableCell> */}
                                            <TableCell>{member.plan.name}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        member.status === "ACTIVE"
                                                            ? "default"
                                                            : member.status === "EXPIRED"
                                                                ? "destructive"
                                                                : "secondary"
                                                    }
                                                >
                                                    {member.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(member.joiningDate), "dd MMM yyyy")}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(member.expiryDate), "dd MMM yyyy")}
                                            </TableCell>
                                            <TableCell>₹{member.totalFees.toLocaleString()}</TableCell>
                                            <TableCell>₹{member.paidAmount.toLocaleString()}</TableCell>
                                            <TableCell className="font-semibold text-amber-600">
                                                ₹{member.pendingAmount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* <Button variant="ghost" size="sm" className="gap-1.5">
                                                        <Eye className="h-4 w-4" />
                                                        <span className="hidden lg:inline">View</span>
                                                    </Button> */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1.5"
                                                        onClick={() => openEditDialog(member)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="hidden lg:inline">Edit</span>
                                                    </Button>
                                                    {member.pendingAmount > 0 ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1.5 border-red-600 text-red-500 hover:bg-red-50"
                                                            onClick={() => openPayDialog(member)}
                                                        >
                                                            <IndianRupee className="h-4 w-4" />
                                                            <span className="hidden lg:inline">Pay Fee</span>
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" className="text-sm font-medium text-green-600">
                                                            <IndianRupee className="h-4 w-4" />  Paid ✅
                                                        </Button>
                                                    )}

                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredMembers.length} of {members.length} members
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Pay Fee Dialog */}
            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Collect Fee – {selectedMemberForPay?.name}</DialogTitle>
                        <DialogDescription>
                            Pending amount: <strong>₹{selectedMemberForPay?.pendingAmount.toLocaleString()}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="payAmount">Amount to Collect (₹) *</Label>
                            <Input
                                id="payAmount"
                                type="number"
                                min={1}
                                max={selectedMemberForPay?.pendingAmount || 0}
                                value={payAmount}
                                onChange={(e) => setPayAmount(Number(e.target.value))}
                                className="text-lg"
                            />
                            <p className="text-sm text-muted-foreground">
                                Remaining after payment:{" "}
                                <span className="font-medium">
                                    ₹{((selectedMemberForPay?.pendingAmount || 0) - payAmount).toLocaleString()}
                                </span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method *</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger id="paymentMethod">
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="CARD">Card</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={closePayDialog} disabled={payLoading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePayFee}
                            disabled={
                                payLoading ||
                                payAmount <= 0 ||
                                payAmount > (selectedMemberForPay?.pendingAmount || 0)
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

            {/* Edit Member Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Member – {selectedMemberForEdit?.name}</DialogTitle>
                        <DialogDescription>
                            Update member information and membership details
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleEditMember)} className="space-y-6 py-4">
                            {/* Personal Information */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mobile Number *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Textarea className="min-h-[80px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Membership Details */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="planId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Membership Plan *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {plans.map((plan) => (
                                                        <SelectItem key={plan.id} value={plan.id}>
                                                            {plan.name} — ₹{plan.price} ({plan.duration} days)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="joiningDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Joining Date *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Payment Details */}
                            <div className="grid gap-4 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="totalFees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Fees (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" disabled className="bg-muted" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="paidAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Paid Amount (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pendingAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pending Amount (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" disabled className="bg-muted" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEditDialog}
                                    disabled={editLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editLoading}>
                                    {editLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Member"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}