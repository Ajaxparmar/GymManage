// components/MemberForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

/* ---------------- Schema ---------------- */

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(1, "Mobile is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  photo: z.string().optional(),
  planId: z.string().min(1, "Select a plan"),
  feeAmount: z.number().min(0, "Fee must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

/* ---------------- Props ---------------- */

interface MemberFormProps {
  plans: { id: string; name: string; price: number; duration: number }[];
  gymId: string;
  member?: {
    id: string;
    name: string;
    mobile: string;
    email?: string | null;
    address?: string | null;
    photo?: string | null;
    plan: { id: string };
    totalFees: number;
  } | null;
  onClose: () => void;
}

/* ---------------- Component ---------------- */

export function MemberForm({ plans, gymId, member, onClose }: MemberFormProps) {
  const isEditMode = !!member;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || "",
      mobile: member?.mobile || "",
      email: member?.email || "",
      address: member?.address || "",
      photo: member?.photo || "",
      planId: member?.plan?.id || "",
      feeAmount: member?.totalFees || 0,
    },
  });

  /* ---------------- Submit ---------------- */

  async function onSubmit(values: FormValues) {
    try {
      const plan = plans.find((p) => p.id === values.planId);

      if (!plan) {
        toast.error("Invalid plan selected");
        return;
      }

      if (isEditMode) {
        // Update existing member
        const res = await fetch(`/api/members?id=${member.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            mobile: values.mobile,
            email: values.email,
            address: values.address,
            photo: values.photo,
            planId: values.planId,
            // Note: You may want to handle fee updates differently
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.message || "Failed to update member");
        }

        toast.success("Member updated successfully");
      } else {
        // Create new member
        const expiryDate = addDays(new Date(), plan.duration);

        const res = await fetch("/api/members", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            gymId,
            expiryDate,
            totalFees: values.feeAmount,
            paidAmount: 0,
            pendingAmount: values.feeAmount,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.message || "Something went wrong");
        }

        toast.success("Member added successfully");
      }

      form.reset();
      onClose();
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof Error) {
        toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} member`);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'add'} member`);
      }
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mobile */}
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile</FormLabel>
              <FormControl>
                <Input placeholder="Enter mobile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Plan */}
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Membership Plan</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fee - Only show for new members */}
        {!isEditMode && (
          <FormField
            control={form.control}
            name="feeAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee Amount</FormLabel>
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
        )}

        {/* Submit */}
        <DialogFooter>
          <Button type="submit" className="w-full">
            {isEditMode ? "Update Member" : "Add Member"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}