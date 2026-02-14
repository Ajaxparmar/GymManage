// "use client";

// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { DialogFooter } from "@/components/ui/dialog";
// import { Checkbox } from "@/components/ui/checkbox";
// import { toast } from "sonner";

// /* ---------------- Types ---------------- */

// export type Plan = {
//   id: string;
//   name: string;
//   duration: number;
//   price: number;
//   description?: string | null;
//   isDefault: boolean;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// };

// /* ---------------- Schema ---------------- */

// const formSchema = z.object({
//   name: z.string().min(1, "Plan name is required"),
//   duration: z.number().min(1, "Duration must be at least 1 day"),
//   price: z.number().min(0, "Price must be 0 or more"),
//   description: z.string().optional(),
//   isDefault: z.boolean(),
//   // Optional: add if you want to manage isActive from form
//   // isActive: z.boolean(),
// });

// type PlanFormValues = z.infer<typeof formSchema>;

// /* ---------------- Props ---------------- */

// interface PlanFormProps {
//   gymId?: string;           // required for create, optional for edit
//   plan?: Plan | null;       // undefined = create mode
//   onClose: () => void;
// }

// /* ---------------- Component ---------------- */

// export function PlanForm({ gymId, plan, onClose }: PlanFormProps) {
//   const isEditMode = !!plan;

//   const form = useForm<PlanFormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: plan?.name || "",
//       duration: plan?.duration || 30,
//       price: plan?.price || 0,
//       description: plan?.description || "",
//       isDefault: plan?.isDefault || false,
//       // isActive: plan?.isActive ?? true,
//     },
//   });

//   // Optional: force reset when plan changes (safety)
//   useEffect(() => {
//     if (plan) {
//       form.reset({
//         name: plan.name,
//         duration: plan.duration,
//         price: plan.price,
//         description: plan.description || "",
//         isDefault: plan.isDefault,
//         // isActive: plan.isActive,
//       });
//     }
//   }, [plan, form]);

//   /* ---------------- Submit ---------------- */

//   async function onSubmit(values: PlanFormValues) {
//     try {
//       const method = isEditMode ? "PATCH" : "POST";
//       const url = "/api/dashboard/plans";

//       const payload = isEditMode
//         ? { id: plan?.id, ...values }
//         : { ...values, gymId };

//       // Remove gymId from edit payload (API uses session)
//       if (isEditMode) {
//         delete (payload as { gymId?: string }).gymId;
//       }

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include", // important for session
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errorData = await res.json().catch(() => ({}));
//         throw new Error(errorData.message || "Failed to save plan");
//       }

//       toast.success(isEditMode ? "Plan updated successfully" : "Plan created successfully");

//       form.reset();
//       onClose();
//     } catch (error: unknown) {
//       console.error("PlanForm submit error:", error);
//       toast.error("Failed to save plan");
//     }
//   }

//   /* ---------------- UI ---------------- */

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//         {/* Plan Name */}
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Plan Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="e.g. Monthly, 3 Months, Annual" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* Duration */}
//         <FormField
//           control={form.control}
//           name="duration"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Duration (in days)</FormLabel>
//               <FormControl>
//                 <Input
//                   type="number"
//                   min={1}
//                   placeholder="30"
//                   {...field}
//                   onChange={(e) => field.onChange(Number(e.target.value))}
//                 />
//               </FormControl>
//               <FormDescription>
//                 Number of days this membership is valid
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* Price */}
//         <FormField
//           control={form.control}
//           name="price"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Price (₹)</FormLabel>
//               <FormControl>
//                 <Input
//                   type="number"
//                   min={0}
//                   step="1"
//                   placeholder="999"
//                   {...field}
//                   onChange={(e) => field.onChange(Number(e.target.value))}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* Description */}
//         <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Description (Optional)</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder="Any special benefits, terms, or notes..."
//                   className="min-h-[80px]"
//                   {...field}
//                   value={field.value ?? ""}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* Is Default */}
//         <FormField
//           control={form.control}
//           name="isDefault"
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
//               <FormControl>
//                 <Checkbox
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               </FormControl>
//               <div className="space-y-1 leading-none">
//                 <FormLabel>Mark as Default Plan</FormLabel>
//                 <FormDescription>
//                   Default plans appear as recommended options when adding members
//                 </FormDescription>
//               </div>
//             </FormItem>
//           )}
//         />

//         {/* Submit Button */}
//         <DialogFooter>
//           <Button
//             type="submit"
//             disabled={form.formState.isSubmitting}
//             className="w-full"
//           >
//             {form.formState.isSubmitting
//               ? "Saving..."
//               : isEditMode
//               ? "Update Plan"
//               : "Create Plan"}
//           </Button>
//         </DialogFooter>
//       </form>
//     </Form>
//   );
// }

"use client";

import { useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

/* ---------------- Types ---------------- */
export type Plan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/* ---------------- Schema ---------------- */
const formSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  price: z.number().min(0, "Price must be 0 or more"),
  description: z.string().optional(),
  isDefault: z.boolean(),
});

type PlanFormValues = z.infer<typeof formSchema>;

/* ---------------- Props ---------------- */
interface PlanFormProps {
  gymId?: string;           // required only for create
  plan?: Plan | null;
  onClose: () => void;
}

/* ---------------- Component ---------------- */
export function PlanForm({ gymId, plan, onClose }: PlanFormProps) {
  const isEditMode = !!plan;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: plan?.name || "",
      duration: plan?.duration || 30,
      price: plan?.price || 0,
      description: plan?.description || "",
      isDefault: plan?.isDefault || false,
    },
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        duration: plan.duration,
        price: plan.price,
        description: plan.description || "",
        isDefault: plan.isDefault,
      });
    }
  }, [plan, form]);

  /* ---------------- Submit ---------------- */
  async function onSubmit(values: PlanFormValues) {
    try {
      const method = isEditMode ? "PATCH" : "POST";
      const url = "/api/dashboard/plans";  // ← use the same endpoint for both

      const payload: unknown = isEditMode
        ? { id: plan?.id, ...values }
        : { ...values, gymId };

      if (isEditMode) {
        delete (payload as { gymId?: string }).gymId;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = isEditMode ? "Failed to update plan" : "Failed to create plan";
        try {
          const errData = await res.json();
          errorMsg = errData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      // Success
      toast.success(
        isEditMode ? "Plan updated successfully" : "Plan created successfully",
        { duration: 4000 }
      );

      form.reset();
      onClose();
    } catch (error: unknown) {
      console.error("PlanForm submit error:", error);
      toast.error("Failed to save plan", {
        duration: 5000,
      });
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Monthly, 3 Months, Annual" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (in days)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="30"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Number of days this membership is valid
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  placeholder="999"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special benefits, terms, or notes..."
                  className="min-h-[80px]"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mark as Default Plan</FormLabel>
                <FormDescription>
                  Default plans appear as recommended options when adding members
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting
              ? "Saving..."
              : isEditMode
              ? "Update Plan"
              : "Create Plan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}