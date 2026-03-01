"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
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
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, IndianRupee, Loader2, Edit, Eye, Filter, Download, CalendarIcon } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Member = {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    photo?: string | null;
    plan: { name: string; duration: number; price: number };
    planId: string;
    status: string;
    joiningDate: string;
    expiryDate: string;
    totalFees: number;
    paidAmount: number;
    pendingAmount: number;
};

type Plan = {
    id: string;
    name: string;
    duration: number;
    price: number;
    isActive: boolean;
};

type Payment = {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    remarks?: string | null;
    collectedBy: { name: string };
};

type MemberDetails = Member & {
    payments: Payment[];
};

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

    // Payment dialog
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [selectedMemberForPay, setSelectedMemberForPay] = useState<Member | null>(null);
    const [payAmount, setPayAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const [payLoading, setPayLoading] = useState(false);

    // Edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<Member | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    // View Details dialog
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedMemberForView, setSelectedMemberForView] = useState<MemberDetails | null>(null);
    const [viewLoading, setViewLoading] = useState(false);

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
            checkAndRenewExpiredMembers();
        }
    }, [status, router]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/dashboard/members", {
                credentials: "include",
                cache: "no-store",
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setMembers(data);
        } catch (err) {
            console.error("Failed to fetch members:", err);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch("/api/dashboard/plans", {
                credentials: "include",
                cache: "no-store",
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPlans(data.filter((p: Plan) => p.isActive !== false));
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        }
    };

    const checkAndRenewExpiredMembers = async () => {
        try {
            const res = await fetch("/api/dashboard/members/expiry-check", {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                if (data.updated?.length > 0) {
                    toast.info(`Updated ${data.updated.length} expired memberships`);
                    fetchMembers();
                }
            }
        } catch (err) {
            console.error("Expiry auto-check failed:", err);
        }
    };

    // Auto-update expiry & fees in edit form
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

    // Payment Functions
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
              paymentMethod,
              remarks: `Payment collected on ${new Date().toISOString()}`,
            }),
          });
      
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Payment failed");
          }
      
          const data = await res.json();
          toast.success(data.message || `₹${payAmount.toLocaleString()} collected!`);
          closePayDialog();
          await fetchMembers(); // ✅ refetch instead of optimistic update — gets accurate server state
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to record payment");
        } finally {
          setPayLoading(false);
        }
      };

    // View Details
    const openViewDialog = async (member: Member) => {
        setSelectedMemberForView(null);
        setViewLoading(true);
        setViewDialogOpen(true);

        try {
            const res = await fetch(`/api/dashboard/members/${member.id}/`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error(await res.text());
            const data: MemberDetails = await res.json();
            setSelectedMemberForView(data);
        } catch (err) {
            console.error("Failed to load member details:", err);
            toast.error("Failed to load member details");
        } finally {
            setViewLoading(false);
        }
    };

    // Edit Functions
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
                    joiningDate: values.joiningDate.toISOString(),
                    expiryDate: values.expiryDate.toISOString(),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to update member");
            }

            toast.success("Member updated successfully!");

            const newPlan = plans.find((p) => p.id === values.planId);

            setMembers((prev) =>
                prev.map((m) =>
                    m.id === selectedMemberForEdit.id
                        ? {
                            ...m,
                            ...values,
                            joiningDate: values.joiningDate.toISOString(),
                            expiryDate: values.expiryDate.toISOString(),
                            plan: newPlan || m.plan,
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
        { label: "Total Members", value: members.length, color: "text-foreground" },
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
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">All Members</h1>
                        <p className="text-muted-foreground mt-1.5">Manage your gym members</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={() => router.push("/pages/dashboard/gym-admin/addmembers")} className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Member
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search name or mobile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="min-w-[70px]">Image</TableHead>
                                <TableHead className="min-w-[180px]">Name</TableHead>
                                <TableHead className="min-w-[130px]">Mobile</TableHead>
                                <TableHead className="min-w-[120px]">Plan</TableHead>
                                <TableHead className="min-w-[100px]">Status</TableHead>
                                <TableHead className="min-w-[130px]">Joining</TableHead>
                                <TableHead className="min-w-[130px]">Expiry</TableHead>
                                <TableHead className="min-w-[100px]">Total</TableHead>
                                <TableHead className="min-w-[100px]">Paid</TableHead>
                                <TableHead className="min-w-[100px]">Pending</TableHead>
                                <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                                        {search ? "No matching members" : "No members yet"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member) => (
                                    <TableRow key={member.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={member.photo || ""} alt={member.name} />
                                                <AvatarFallback>{member.name?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.mobile}</TableCell>
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
                                        <TableCell>{format(new Date(member.joiningDate), "dd MMM yyyy")}</TableCell>
                                        <TableCell>{format(new Date(member.expiryDate), "dd MMM yyyy")}</TableCell>
                                        <TableCell>₹{member.totalFees.toLocaleString()}</TableCell>
                                        <TableCell>₹{member.paidAmount.toLocaleString()}</TableCell>
                                        <TableCell className="font-semibold text-amber-600">
                                            ₹{member.pendingAmount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right min-w-[180px]">
                                            <div className="flex justify-end items-center gap-2 min-w-[160px]">

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0"
                                                    title="View"
                                                    onClick={() => openViewDialog(member)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0"
                                                    title="Edit"
                                                    onClick={() => openEditDialog(member)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                {member.pendingAmount > 0 ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 gap-1 border-red-600 text-red-500"
                                                        onClick={() => openPayDialog(member)}
                                                    >
                                                        <IndianRupee className="h-4 w-4" />
                                                        Pay...
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        className="text-green-600 px-3 py-1 h-9 flex items-center"
                                                    >
                                                        <IndianRupee className="h-4 w-4" />
                                                        Paid
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

                {/* Pay Fee Dialog */}
                <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Collect Fee – {selectedMemberForPay?.name}</DialogTitle>
                            <DialogDescription>
                                Pending: <strong>₹{selectedMemberForPay?.pendingAmount.toLocaleString()}</strong>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="payAmount">Amount (₹)</Label>
                                <Input
                                    id="payAmount"
                                    type="number"
                                    min={1}
                                    max={selectedMemberForPay?.pendingAmount || 0}
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(Number(e.target.value))}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Remaining: ₹{((selectedMemberForPay?.pendingAmount || 0) - payAmount).toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="CARD">Card</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
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
                                disabled={payLoading || payAmount <= 0 || payAmount > (selectedMemberForPay?.pendingAmount || 0)}
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

                {/* View Member Details Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Member Details – {selectedMemberForView?.name || "Loading..."}</DialogTitle>
                            <DialogDescription>
                                Full information and payment history
                            </DialogDescription>
                        </DialogHeader>

                        {viewLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        ) : !selectedMemberForView ? (
                            <div className="text-center py-10 text-muted-foreground">
                                Failed to load member details
                            </div>
                        ) : (
                            <div className="space-y-8 py-4">
                                {/* Personal & Membership Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal & Membership Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 md:grid-cols-2">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={selectedMemberForView.photo || ""} alt={selectedMemberForView.name} />
                                                <AvatarFallback className="text-2xl">
                                                    {selectedMemberForView.name?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-xl font-semibold">{selectedMemberForView.name}</h3>
                                                <p className="text-muted-foreground">{selectedMemberForView.mobile}</p>
                                                {selectedMemberForView.email && (
                                                    <p className="text-muted-foreground">{selectedMemberForView.email}</p>
                                                )}
                                                {selectedMemberForView.address && (
                                                    <p className="text-muted-foreground mt-1">{selectedMemberForView.address}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Status:</span>
                                                <Badge
                                                    variant={
                                                        selectedMemberForView.status === "ACTIVE" ? "default" : "destructive"
                                                    }
                                                >
                                                    {selectedMemberForView.status}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Plan:</span>
                                                <span className="font-medium">{selectedMemberForView.plan.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Joining Date:</span>
                                                <span>{format(new Date(selectedMemberForView.joiningDate), "dd MMM yyyy")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Expiry Date:</span>
                                                <span>{format(new Date(selectedMemberForView.expiryDate), "dd MMM yyyy")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Fees:</span>
                                                <span>₹{selectedMemberForView.totalFees.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Paid:</span>
                                                <span className="text-green-600">₹{selectedMemberForView.paidAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold">
                                                <span>Pending:</span>
                                                <span className={selectedMemberForView.pendingAmount > 0 ? "text-red-600" : "text-green-600"}>
                                                    ₹{selectedMemberForView.pendingAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment History */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payment History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedMemberForView.payments.length === 0 ? (
                                            <div className="text-center py-10 text-muted-foreground">
                                                No payments recorded yet
                                            </div>
                                        ) : (
                                            <div className="rounded-md border overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/50">
                                                            <TableHead>Date</TableHead>
                                                            <TableHead>Amount</TableHead>
                                                            <TableHead>Method</TableHead>
                                                            {/* <TableHead>Remarks</TableHead> */}
                                                            <TableHead>Collected By</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedMemberForView.payments.map((payment) => (
                                                            <TableRow key={payment.id}>
                                                                <TableCell>
                                                                    {format(new Date(payment.paymentDate), "dd MMM yyyy • hh:mm a")}
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    ₹{payment.amount.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{payment.paymentMethod}</Badge>
                                                                </TableCell>
                                                                {/* <TableCell className="text-muted-foreground">
                                  {payment.remarks || "—"}
                                </TableCell> */}
                                                                <TableCell>{payment.collectedBy.name}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                                Close
                            </Button>
                            {(selectedMemberForView?.pendingAmount ?? 0) > 0 && (
                                <Button
                                    onClick={() => {
                                        setViewDialogOpen(false);
                                        openPayDialog(selectedMemberForView as Member);
                                    }}
                                >
                                    Collect Pending Fee
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Pay Fee Dialog */}
                <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Collect Fee – {selectedMemberForPay?.name}</DialogTitle>
                            <DialogDescription>
                                Pending: <strong>₹{selectedMemberForPay?.pendingAmount.toLocaleString()}</strong>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="payAmount">Amount (₹)</Label>
                                <Input
                                    id="payAmount"
                                    type="number"
                                    min={1}
                                    max={selectedMemberForPay?.pendingAmount || 0}
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(Number(e.target.value))}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Remaining: ₹{((selectedMemberForPay?.pendingAmount || 0) - payAmount).toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="CARD">Card</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
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
                                disabled={payLoading || payAmount <= 0 || payAmount > (selectedMemberForPay?.pendingAmount || 0)}
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
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleEditMember)} className="space-y-6 py-4">
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
            </div>
        </DashboardLayout>
    );
}