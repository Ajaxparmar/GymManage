// "use client";

// import { useEffect, useState, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { format } from "date-fns";
// import { CalendarIcon, Loader2, Camera, Upload, X, User, AlertCircle } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Alert,
//   AlertDescription,
//   AlertTitle,
// } from "@/components/ui/alert";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { cn } from "@/lib/utils";
// import { toast } from "sonner";
// import { DashboardLayout } from "@/components/DashboardLayout";

// // ── Schema ────────────────────────────────────────────────────────────────
// const memberSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   mobile: z.string().regex(/^[0-9]{10,15}$/, "Mobile number should be 10-15 digits"),
//   email: z.string().email("Invalid email").optional().or(z.literal("")),
//   address: z.string().optional(),
//   photo: z.string().optional(),
//   joiningDate: z.date(),
//   expiryDate: z.date(),
//   planId: z.string().min(1, "Select a plan"),
//   totalFees: z.number().min(0),
//   paidAmount: z.number().min(0),
//   pendingAmount: z.number().min(0),
// });

// type MemberFormValues = z.infer<typeof memberSchema>;

// type Plan = {
//   id: string;
//   name: string;
//   duration: number;
//   price: number;
//   isDefault?: boolean;
//   isActive?: boolean;
// };

// // ── Component ─────────────────────────────────────────────────────────────
// export default function AddMemberPage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [loadingPlans, setLoadingPlans] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [duplicateError, setDuplicateError] = useState<{
//     name: string;
//     mobile: string;
//     status: string;
//   } | null>(null);
  
//   // Camera states
//   const [showCamera, setShowCamera] = useState(false);
//   const [photoPreview, setPhotoPreview] = useState<string>("");
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   const form = useForm<MemberFormValues>({
//     resolver: zodResolver(memberSchema),
//     defaultValues: {
//       name: "",
//       mobile: "",
//       email: "",
//       address: "",
//       photo: "",
//       joiningDate: new Date(),
//       expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//       planId: "",
//       totalFees: 0,
//       paidAmount: 0,
//       pendingAmount: 0,
//     },
//   });

//   // Clear duplicate error when mobile changes
//   useEffect(() => {
//     const subscription = form.watch((value, { name }) => {
//       if (name === 'mobile') {
//         setDuplicateError(null);
//       }
//     });
//     return () => subscription.unsubscribe();
//   }, [form.watch]);

//   // Fetch plans
//   useEffect(() => {
//     if (status !== "authenticated" || !session?.user?.gymId) return;

//     const fetchPlans = async () => {
//       setLoadingPlans(true);

//       try {
//         const res = await fetch("/api/dashboard/plans", {
//           credentials: "include",
//           cache: "no-store",
//         });

//         if (!res.ok) throw new Error("Failed to load plans");

//         const raw = await res.json();
//         let planArray: Plan[] = Array.isArray(raw) ? raw : [];
//         planArray = planArray.filter((p) => p.isActive !== false);
//         setPlans(planArray);

//         if (planArray.length === 0) {
//           toast.info("No active membership plans found. Please create one first.");
//         }
//       } catch (err: unknown) {
//         console.error("[Plans fetch error]", err);
//         toast.error("Could not load membership plans");
//         setPlans([]);
//       } finally {
//         setLoadingPlans(false);
//       }
//     };

//     fetchPlans();
//   }, [status, session?.user?.gymId]);

//   // Auto-update expiry & fees
//   const selectedPlanId = form.watch("planId");
//   const selectedPlan = plans.find((p) => p.id === selectedPlanId);

//   useEffect(() => {
//     if (!selectedPlan) {
//       form.setValue("totalFees", 0);
//       form.setValue("pendingAmount", 0);
//       return;
//     }

//     const durationDays = Number(selectedPlan.duration) || 30;
//     const joining = form.getValues("joiningDate") || new Date();
//     const expiry = new Date(joining);
//     expiry.setDate(expiry.getDate() + durationDays);

//     const planPrice = Number(selectedPlan.price) || 0;
//     const paid = Number(form.getValues("paidAmount")) || 0;

//     form.setValue("expiryDate", expiry);
//     form.setValue("totalFees", planPrice);
//     form.setValue("pendingAmount", Math.max(0, planPrice - paid));
//   }, [selectedPlan, form.watch("joiningDate"), form.watch("paidAmount")]);

//   // ── Camera Functions ──────────────────────────────────────────────────
//   const startCamera = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user", width: 640, height: 480 },
//         audio: false,
//       });
      
//       setStream(mediaStream);
//       setShowCamera(true);
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//     } catch (err) {
//       console.error("Camera error:", err);
//       toast.error("Could not access camera. Please check permissions.");
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       setStream(null);
//     }
//     setShowCamera(false);
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");

//     if (!context) return;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const photoData = canvas.toDataURL("image/jpeg", 0.8);
    
//     setPhotoPreview(photoData);
//     form.setValue("photo", photoData);
//     stopCamera();
//     toast.success("Photo captured!");
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       toast.error("Please upload an image file");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image size should be less than 5MB");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64 = reader.result as string;
//       setPhotoPreview(base64);
//       form.setValue("photo", base64);
//       toast.success("Photo uploaded!");
//     };
//     reader.readAsDataURL(file);
//   };

//   const removePhoto = () => {
//     setPhotoPreview("");
//     form.setValue("photo", "");
//   };

//   useEffect(() => {
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [stream]);

//   const onSubmit = async (values: MemberFormValues) => {
//     if (!session?.user?.gymId) {
//       toast.error("No gym associated with your account");
//       return;
//     }

//     setSubmitting(true);
//     setDuplicateError(null);

//     try {
//       const res = await fetch("/api/dashboard/members", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           ...values,
//           gymId: session.user.gymId,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         // Handle duplicate member error
//         if (res.status === 409 && data.existingMember) {
//           setDuplicateError(data.existingMember);
//           toast.error(data.message || "Member already exists");
//           // Scroll to mobile field
//           document.getElementById('mobile-field')?.scrollIntoView({ behavior: 'smooth' });
//           return;
//         }

//         throw new Error(data.message || "Failed to add member");
//       }

//       toast.success("Member added successfully! 🎉");
      
//       // Small delay to show success message before navigation
//       setTimeout(() => {
//         router.push("/pages/dashboard/gym-admin/allmembers");
//       }, 1000);
//     } catch (err: unknown) {
//       console.error("Member creation failed:", err);
//       if (err instanceof Error) {
//         toast.error(err.message);
//       } else {
//         toast.error("Failed to add member");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (status === "loading" || loadingPlans) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center min-h-[70vh]">
//           <div className="flex flex-col items-center gap-4">
//             <Loader2 className="h-10 w-10 animate-spin text-primary" />
//             <p className="text-muted-foreground">Loading...</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout activePath="members">
//       <div className="max-w-5xl mx-auto space-y-8 pb-12">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
//             <p className="text-muted-foreground mt-1.5">
//               Register a new gym member and assign membership plan
//             </p>
//           </div>
//         </div>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             {/* Photo Section */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Member Photo</CardTitle>
//                 <CardDescription>
//                   Capture or upload a photo for identification
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-col items-center gap-6">
//                   <div className="relative">
//                     <Avatar className="h-32 w-32 border-4 border-muted">
//                       {photoPreview ? (
//                         <AvatarImage src={photoPreview} alt="Member photo" />
//                       ) : (
//                         <AvatarFallback className="bg-muted">
//                           <User className="h-16 w-16 text-muted-foreground" />
//                         </AvatarFallback>
//                       )}
//                     </Avatar>
                    
//                     {photoPreview && (
//                       <Button
//                         type="button"
//                         variant="destructive"
//                         size="icon"
//                         className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
//                         onClick={removePhoto}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>

//                   <div className="flex flex-wrap gap-3 justify-center">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={startCamera}
//                       className="gap-2"
//                     >
//                       <Camera className="h-4 w-4" />
//                       Open Camera
//                     </Button>

//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => document.getElementById("file-upload")?.click()}
//                       className="gap-2"
//                     >
//                       <Upload className="h-4 w-4" />
//                       Upload Photo
//                     </Button>

//                     <input
//                       id="file-upload"
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={handleFileUpload}
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Personal Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Personal Information</CardTitle>
//                 <CardDescription>Basic details of the member</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid gap-6 md:grid-cols-2">
//                   <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Full Name *</FormLabel>
//                         <FormControl>
//                           <Input placeholder="John Doe" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="mobile"
//                     render={({ field }) => (
//                       <FormItem id="mobile-field">
//                         <FormLabel>Mobile Number *</FormLabel>
//                         <FormControl>
//                           <Input placeholder="9876543210" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 {/* Duplicate Error Alert */}
//                 {duplicateError && (
//                   <Alert variant="destructive">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertTitle>Member Already Exists</AlertTitle>
//                     <AlertDescription>
//                       A member with mobile number <strong>{duplicateError.mobile}</strong> already exists:
//                       <br />
//                       <strong>{duplicateError.name}</strong> (Status: {duplicateError.status})
//                       <br />
//                       <span className="text-sm">Please use a different mobile number or update the existing member.</span>
//                     </AlertDescription>
//                   </Alert>
//                 )}

//                 <div className="grid gap-6 md:grid-cols-2">
//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input type="email" placeholder="example@gmail.com" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="address"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Address</FormLabel>
//                         <FormControl>
//                           <Textarea
//                             placeholder="House no, street, city..."
//                             className="min-h-[80px]"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Membership Details */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Membership Details</CardTitle>
//                 <CardDescription>Select plan and dates</CardDescription>
//               </CardHeader>
//               <CardContent className="grid gap-6 md:grid-cols-2">
//                 <FormField
//                   control={form.control}
//                   name="planId"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Membership Plan *</FormLabel>
//                       <Select
//                         onValueChange={field.onChange}
//                         value={field.value}
//                         disabled={plans.length === 0}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue
//                               placeholder={
//                                 plans.length === 0
//                                   ? "No plans available"
//                                   : "Select a plan"
//                               }
//                             />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {plans.map((plan) => (
//                             <SelectItem key={plan.id} value={plan.id}>
//                               <div className="flex items-center gap-2">
//                                 <span>{plan.name}</span>
//                                 <span className="text-muted-foreground">•</span>
//                                 <span className="font-semibold">₹{plan.price}</span>
//                                 <span className="text-muted-foreground">({plan.duration} days)</span>
//                               </div>
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="joiningDate"
//                   render={({ field }) => (
//                     <FormItem className="flex flex-col">
//                       <FormLabel>Joining Date *</FormLabel>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <FormControl>
//                             <Button
//                               variant="outline"
//                               className={cn(
//                                 "w-full justify-start text-left font-normal",
//                                 !field.value && "text-muted-foreground"
//                               )}
//                             >
//                               {field.value ? format(field.value, "PPP") : "Pick a date"}
//                               <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                             </Button>
//                           </FormControl>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <Calendar
//                             mode="single"
//                             selected={field.value}
//                             onSelect={field.onChange}
//                             disabled={(date) => date > new Date()}
//                             initialFocus
//                           />
//                         </PopoverContent>
//                       </Popover>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <div className="md:col-span-2">
//                   <FormField
//                     control={form.control}
//                     name="expiryDate"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Expiry Date</FormLabel>
//                         <FormControl>
//                           <Input
//                             value={field.value ? format(field.value, "PPP") : ""}
//                             disabled
//                             className="bg-muted"
//                           />
//                         </FormControl>
//                         <FormDescription>
//                           Auto-calculated based on selected plan and joining date
//                         </FormDescription>
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Payment Section */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Payment Details</CardTitle>
//                 <CardDescription>Fee structure and payments</CardDescription>
//               </CardHeader>
//               <CardContent className="grid gap-6 md:grid-cols-3">
//                 <FormField
//                   control={form.control}
//                   name="totalFees"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Total Fees (₹)</FormLabel>
//                       <FormControl>
//                         <Input type="number" disabled className="bg-muted" {...field} />
//                       </FormControl>
//                       <FormDescription>Based on plan</FormDescription>
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="paidAmount"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Paid Amount (₹)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           min={0}
//                           placeholder="0"
//                           {...field}
//                           onChange={(e) => field.onChange(Number(e.target.value))}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="pendingAmount"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Pending Amount (₹)</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           disabled
//                           className="bg-muted"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormDescription>Auto-calculated</FormDescription>
//                     </FormItem>
//                   )}
//                 />
//               </CardContent>
//             </Card>

//             {/* Action Buttons */}
//             <div className="flex justify-end gap-4 pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => router.back()}
//                 disabled={submitting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 disabled={submitting || loadingPlans || plans.length === 0}
//                 className="min-w-[140px]"
//               >
//                 {submitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Adding...
//                   </>
//                 ) : (
//                   "Add Member"
//                 )}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </div>

//       {/* Camera Dialog */}
//       <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
//         <DialogContent className="sm:max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Capture Photo</DialogTitle>
//             <DialogDescription>
//               Position the member in the frame and click capture
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4">
//             <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="flex justify-end gap-3">
//               <Button variant="outline" onClick={stopCamera}>
//                 Cancel
//               </Button>
//               <Button onClick={capturePhoto} className="gap-2">
//                 <Camera className="h-4 w-4" />
//                 Capture Photo
//               </Button>
//             </div>
//           </div>

//           <canvas ref={canvasRef} className="hidden" />
//         </DialogContent>
//       </Dialog>
//     </DashboardLayout>
//   );
// }


"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Camera, Upload, X, User, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";

// ── Schema ────────────────────────────────────────────────────────────────
const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^[0-9]{10,15}$/, "Mobile number should be 10-15 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  photo: z.string().optional(),
  joiningDate: z.date(),
  expiryDate: z.date(),
  planId: z.string().min(1, "Select a plan"),
  totalFees: z.number().min(0),
  paidAmount: z.number().min(0),
  pendingAmount: z.number().min(0),
});

type MemberFormValues = z.infer<typeof memberSchema>;

type Plan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  isDefault?: boolean;
  isActive?: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────
export default function AddMemberPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState<{
    name: string;
    mobile: string;
    status: string;
  } | null>(null);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      address: "",
      photo: "",
      joiningDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      planId: "",
      totalFees: 0,
      paidAmount: 0,
      pendingAmount: 0,
    },
  });

  // Clear duplicate error when mobile changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "mobile") {
        setDuplicateError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Fetch plans
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.gymId) return;

    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await fetch("/api/dashboard/plans", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load plans");
        const raw = await res.json();
        let planArray: Plan[] = Array.isArray(raw) ? raw : [];
        planArray = planArray.filter((p) => p.isActive !== false);
        setPlans(planArray);
        if (planArray.length === 0) {
          toast.info("No active membership plans found. Please create one first.");
        }
      } catch (err: unknown) {
        console.error("[Plans fetch error]", err);
        toast.error("Could not load membership plans");
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [status, session?.user?.gymId]);

  // Auto-update expiry & fees
  const selectedPlanId = form.watch("planId");
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  useEffect(() => {
    if (!selectedPlan) {
      form.setValue("totalFees", 0);
      form.setValue("pendingAmount", 0);
      return;
    }
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

  // ── Camera: attach stream to video AFTER dialog mounts ────────────────
  // This callback ref is called when the video element is actually in the DOM
  const videoCallbackRef = useCallback(
    (node: HTMLVideoElement | null) => {
      if (node && streamRef.current) {
        node.srcObject = streamRef.current;
        // Store ref for capture use
        (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showCamera] // re-run when dialog opens
  );

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = mediaStream;
      setShowCamera(true);
      // videoCallbackRef will attach the stream once the <video> mounts
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL("image/jpeg", 0.8);
    setPhotoPreview(photoData);
    form.setValue("photo", photoData);
    stopCamera();
    toast.success("Photo captured!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      form.setValue("photo", base64);
      toast.success("Photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview("");
    form.setValue("photo", "");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const onSubmit = async (values: MemberFormValues) => {
    if (!session?.user?.gymId) {
      toast.error("No gym associated with your account");
      return;
    }
    setSubmitting(true);
    setDuplicateError(null);
    try {
      const res = await fetch("/api/dashboard/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...values, gymId: session.user.gymId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.existingMember) {
          setDuplicateError(data.existingMember);
          toast.error(data.message || "Member already exists");
          document.getElementById("mobile-field")?.scrollIntoView({ behavior: "smooth" });
          return;
        }
        throw new Error(data.message || "Failed to add member");
      }
      toast.success("Member added successfully! 🎉");
      setTimeout(() => {
        router.push("/pages/dashboard/gym-admin/allmembers");
      }, 1000);
    } catch (err: unknown) {
      console.error("Member creation failed:", err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add member");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loadingPlans) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="members">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
            <p className="text-muted-foreground mt-1.5">
              Register a new gym member and assign membership plan
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Photo Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Member Photo</CardTitle>
                <CardDescription>Capture or upload a photo for identification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-muted">
                      {photoPreview ? (
                        <AvatarImage src={photoPreview} alt="Member photo" />
                      ) : (
                        <AvatarFallback className="bg-muted">
                          <User className="h-16 w-16 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {photoPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button type="button" variant="outline" onClick={startCamera} className="gap-2">
                      <Camera className="h-4 w-4" />
                      Open Camera
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Basic details of the member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem id="mobile-field">
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {duplicateError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Member Already Exists</AlertTitle>
                    <AlertDescription>
                      A member with mobile number <strong>{duplicateError.mobile}</strong> already
                      exists: <br />
                      <strong>{duplicateError.name}</strong> (Status: {duplicateError.status})
                      <br />
                      <span className="text-sm">
                        Please use a different mobile number or update the existing member.
                      </span>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@gmail.com" {...field} />
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
                          <Textarea
                            placeholder="House no, street, city..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Membership Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Membership Details</CardTitle>
                <CardDescription>Select plan and dates</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Plan *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={plans.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                plans.length === 0 ? "No plans available" : "Select a plan"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex items-center gap-2">
                                <span>{plan.name}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="font-semibold">₹{plan.price}</span>
                                <span className="text-muted-foreground">
                                  ({plan.duration} days)
                                </span>
                              </div>
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

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value ? format(field.value, "PPP") : ""}
                            disabled
                            className="bg-muted"
                          />
                        </FormControl>
                        <FormDescription>
                          Auto-calculated based on selected plan and joining date
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
                <CardDescription>Fee structure and payments</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="totalFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Fees (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" disabled className="bg-muted" {...field} />
                      </FormControl>
                      <FormDescription>Based on plan</FormDescription>
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
                          placeholder="0"
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
                      <FormDescription>Auto-calculated</FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || loadingPlans || plans.length === 0}
                className="min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Camera Dialog */}
      <Dialog
        open={showCamera}
        onOpenChange={(open) => {
          if (!open) stopCamera();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Capture Photo</DialogTitle>
            <DialogDescription>
              Position the member in the frame and click capture
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {/* KEY FIX: use callback ref so srcObject is set after DOM mount */}
              <video
                ref={videoCallbackRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
              <Button onClick={capturePhoto} className="gap-2">
                <Camera className="h-4 w-4" />
                Capture Photo
              </Button>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}