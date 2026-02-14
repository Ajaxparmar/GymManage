"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { DialogFooter } from "@/components/ui/dialog";

import { useSession } from "next-auth/react";

import { toast } from "sonner";

/* ---------------- Schema ---------------- */

const formSchema = z.object({
  name: z.string().min(1, "Gym name is required"),

  address: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  logo: z.string().optional(),

  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Invalid email"),
  adminPassword: z.string().min(6, "Min 6 characters"),
  adminMobile: z.string().optional(),
});

type GymFormValues = z.infer<typeof formSchema>;

/* ---------------- Component ---------------- */

export function GymForm({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();

  const form = useForm<GymFormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: "",
      address: "",
      mobile: "",
      email: "",
      logo: "",

      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminMobile: "",
    },
  });

  /* ---------------- Submit ---------------- */

  async function onSubmit(values: GymFormValues) {
    try {
      const res = await fetch("/api/gyms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to create gym");
      }

      toast.success("Gym added successfully");

      form.reset();
      onClose();

    } catch (error) {
      toast.error("Failed to add gym");
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Gym Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gym Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter gym name" {...field} />
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

        {/* Mobile */}
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile</FormLabel>
              <FormControl>
                <Input placeholder="Enter mobile number" {...field} />
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
              <FormLabel>Gym Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admin Name */}
        <FormField
          control={form.control}
          name="adminName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter admin name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admin Email */}
        <FormField
          control={form.control}
          name="adminEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter admin email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admin Password */}
        <FormField
          control={form.control}
          name="adminPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Admin Mobile */}
        <FormField
          control={form.control}
          name="adminMobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Mobile</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter admin mobile"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <DialogFooter>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Saving..." : "Add Gym"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
