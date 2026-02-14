// // "use client";

// // import { useEffect, useState } from "react";
// // import { useSession } from "next-auth/react";
// // import { useRouter } from "next/navigation";
// // import {
// //     Users,
// //     TrendingUp,
// //     DollarSign,
// //     AlertCircle,
// //     ArrowUpRight,
// //     ArrowDownRight,
// // } from "lucide-react";
// // import {
// //     BarChart,
// //     Bar,
// //     XAxis,
// //     YAxis,
// //     CartesianGrid,
// //     Tooltip,
// //     ResponsiveContainer,
// //     PieChart,
// //     Pie,
// //     Cell,
// //     LineChart,
// //     Line,
// // } from "recharts";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Skeleton } from "@/components/ui/skeleton";
// // import { toast } from "sonner";
// // import { DashboardLayout } from "@/components/DashboardLayout";
// // import { format, subMonths } from "date-fns";

// // type Stat = {
// //     label: string;
// //     value: string | number;
// //     icon: React.ComponentType<{ className?: string }>;
// //     color: string;
// //     change: string;
// // };

// // type IncomeData = { name: string; income: number };
// // type GrowthData = { name: string; students: number };
// // type PieData = { name: string; value: number };

// // type RecentMember = {
// //     id: string;
// //     name: string;
// //     mobile: string;
// //     joiningDate: string;
// //     plan?: { name: string };
// // };

// // export default function GymAdminDashboard() {
// //     const { data: session, status } = useSession();
// //     const router = useRouter();

// //     const [stats, setStats] = useState<Stat[]>([]);
// //     const [incomeData, setIncomeData] = useState<IncomeData[]>([]);
// //     const [growthData, setGrowthData] = useState<GrowthData[]>([]);
// //     const [pieData, setPieData] = useState<PieData[]>([]);
// //     const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);

// //     // Handle authentication redirect
// //     useEffect(() => {
// //         if (status === "unauthenticated") {
// //             router.replace("/login");
// //         }
// //     }, [status, router]);

// //     // Load data when authenticated
// //     useEffect(() => {
// //         console.log("Session status:", status);

// //         if (status !== "authenticated") return;

// //         if (!session) {
// //             setError("Session not available");
// //             setLoading(false);
// //             return;
// //         }
// //         console.log("User session:", session);

// //         if (!session.user?.gymId) {
// //             setError("No gym associated with this account");
// //             toast.error("No gym found. Contact super admin.");
// //             setLoading(false);
// //             return;
// //         }

// //         const loadDashboard = async () => {
// //             setLoading(true);
// //             setError(null);

// //             try {
// //                 console.log("Fetching dashboard for gym:", session.user.gymId);

// //                 const res = await fetch("/api/dashboard/gym-admin", {
// //                     credentials: "include",
// //                     cache: "no-store",
// //                 });

// //                 console.log("API response status:", res.status);

// //                 if (!res.ok) {
// //                     const errorText = await res.text();
// //                     throw new Error(`API error ${res.status}: ${errorText}`);
// //                 }

// //                 const data = await res.json();
// //                 console.log("Dashboard data loaded:", data);

// //                 setStats(data.stats || []);
// //                 setIncomeData(data.incomeData || []);
// //                 setGrowthData(data.growthData || []);
// //                 setPieData(data.pieData || []);
// //                 setRecentMembers(data.recentMembers || []);
// //             } catch (err: unknown) {
// //                 console.error("Dashboard loading failed:", err);
// //                 setError(err instanceof Error ? err.message : "Failed to load dashboard");
// //                 toast.error("Could not load dashboard data");
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };

// //         loadDashboard();
// //     }, [status, session]);

// //     const COLORS = ["#10b981", "#f43f5e", "#3b82f6"];

// //     // ────────────────────────────────────────────────
// //     // Render
// //     // ────────────────────────────────────────────────

// //     if (status === "loading" || loading) {
// //         return (
// //             <DashboardLayout>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //                     {Array.from({ length: 4 }).map((_, i) => (
// //                         <Skeleton key={i} className="h-40 w-full rounded-2xl" />
// //                     ))}
// //                 </div>
// //             </DashboardLayout>
// //         );
// //     }

// //     if (error) {
// //         return (
// //             <DashboardLayout>
// //                 <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
// //                     <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
// //                     <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
// //                     <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
// //                     <p className="text-sm text-muted-foreground">
// //                         Please try refreshing the page or contact support if the issue persists.
// //                     </p>
// //                 </div>
// //             </DashboardLayout>
// //         );
// //     }

// //     const hasNoData =
// //         stats.length === 0 &&
// //         incomeData.length === 0 &&
// //         growthData.length === 0 &&
// //         pieData.length === 0 &&
// //         recentMembers.length === 0;

// //     return (
// //         <DashboardLayout activePath="dashboard">
// //             {hasNoData ? (
// //                 <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
// //                     <Users className="h-16 w-16 text-muted-foreground mb-6 opacity-70" />
// //                     <h2 className="text-2xl font-semibold mb-3">Welcome to your Gym Dashboard</h2>
// //                     <p className="text-muted-foreground mb-8 max-w-lg">
// //                         No data available yet. Add some members, plans and payments to see statistics, charts and recent activity here.
// //                     </p>
// //                     <div className="flex gap-4">
// //                         <button
// //                             onClick={() => router.push("/dashboard/gym-admin/members")}
// //                             className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
// //                         >
// //                             Add First Member
// //                         </button>
// //                         <button
// //                             onClick={() => router.push("/dashboard/gym-admin/plans")}
// //                             className="px-6 py-3 border rounded-lg hover:bg-accent transition"
// //                         >
// //                             Create Plan
// //                         </button>
// //                     </div>
// //                 </div>
// //             ) : (
// //                 <div className="space-y-8 pb-10">
// //                     {/* Stats Cards */}
// //                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //                         {stats.map((stat, i) => (
// //                             <Card key={i} className="border-none shadow-sm hover:shadow transition-all duration-200">
// //                                 <CardContent className="p-6">
// //                                     <div className="flex justify-between items-start">
// //                                         <div className={`p-3 rounded-xl bg-${stat.color}-50/50`}>
// //                                             {(() => {
// //                                                 const Icon = stat.icon;

// //                                                 return (
// //                                                     <div className={`p-3 rounded-xl bg-${stat.color}-50/50`}>
// //                                                         <Icon className={`h-6 w-6 text-${stat.color}-600`} />
// //                                                     </div>
// //                                                 );
// //                                             })()}

// //                                         </div>
// //                                         <Badge
// //                                             variant="outline"
// //                                             className={`${stat.change.startsWith("+") ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50"
// //                                                 }`}
// //                                         >
// //                                             {stat.change.startsWith("+") ? (
// //                                                 <ArrowUpRight className="h-3 w-3 mr-1" />
// //                                             ) : (
// //                                                 <ArrowDownRight className="h-3 w-3 mr-1" />
// //                                             )}
// //                                             {stat.change}
// //                                         </Badge>
// //                                     </div>
// //                                     <p className="mt-4 text-sm text-muted-foreground">{stat.label}</p>
// //                                     <p className="text-2xl font-bold mt-1">{stat.value}</p>
// //                                 </CardContent>
// //                             </Card>
// //                         ))}
// //                     </div>

// //                     {/* Charts */}
// //                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //                         <Card className="lg:col-span-2 border-none shadow-sm">
// //                             <CardHeader className="pb-3">
// //                                 <CardTitle>Revenue (Last 6 Months)</CardTitle>
// //                             </CardHeader>
// //                             <CardContent>
// //                                 <div className="h-80">
// //                                     <ResponsiveContainer width="100%" height="100%">
// //                                         <BarChart data={incomeData}>
// //                                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
// //                                             <XAxis dataKey="name" axisLine={false} tickLine={false} />
// //                                             <YAxis axisLine={false} tickLine={false} />
// //                                             <Tooltip />
// //                                             <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
// //                                         </BarChart>
// //                                     </ResponsiveContainer>
// //                                 </div>
// //                             </CardContent>
// //                         </Card>

// //                         <Card className="border-none shadow-sm">
// //                             <CardHeader className="pb-3">
// //                                 <CardTitle>Member Status</CardTitle>
// //                             </CardHeader>
// //                             <CardContent>
// //                                 <div className="h-64 relative">
// //                                     <ResponsiveContainer width="100%" height="100%">
// //                                         <PieChart>
// //                                             <Pie
// //                                                 data={pieData}
// //                                                 cx="50%"
// //                                                 cy="50%"
// //                                                 innerRadius={60}
// //                                                 outerRadius={80}
// //                                                 paddingAngle={5}
// //                                                 dataKey="value"
// //                                             >
// //                                                 {pieData.map((entry, index) => (
// //                                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// //                                                 ))}
// //                                             </Pie>
// //                                             <Tooltip />
// //                                         </PieChart>
// //                                     </ResponsiveContainer>
// //                                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
// //                                         <span className="text-3xl font-bold">
// //                                             {pieData.reduce((acc, curr) => acc + curr.value, 0)}
// //                                         </span>
// //                                         <span className="text-xs text-muted-foreground mt-1">Total Members</span>
// //                                     </div>
// //                                 </div>

// //                                 <div className="mt-6 space-y-3">
// //                                     {pieData.map((item, i) => (
// //                                         <div key={i} className="flex items-center justify-between text-sm">
// //                                             <div className="flex items-center gap-2">
// //                                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
// //                                                 {item.name}
// //                                             </div>
// //                                             <span className="font-medium">{item.value}</span>
// //                                         </div>
// //                                     ))}
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                     </div>

// //                     {/* Bottom row */}
// //                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //                         <Card className="border-none shadow-sm">
// //                             <CardHeader className="pb-3">
// //                                 <CardTitle>Recent Members</CardTitle>
// //                             </CardHeader>
// //                             <CardContent>
// //                                 <div className="space-y-4">
// //                                     {recentMembers.length === 0 ? (
// //                                         <p className="text-center text-muted-foreground py-8">No recent members yet</p>
// //                                     ) : (
// //                                         recentMembers.map((member) => (
// //                                             <div
// //                                                 key={member.id}
// //                                                 className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors"
// //                                             >
// //                                                 <div className="flex items-center gap-3">
// //                                                     <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
// //                                                         {member.name?.[0]?.toUpperCase() || "?"}
// //                                                     </div>
// //                                                     <div>
// //                                                         <p className="font-medium">{member.name}</p>
// //                                                         <p className="text-xs text-muted-foreground">{member.mobile}</p>
// //                                                     </div>
// //                                                 </div>
// //                                                 <div className="text-right">
// //                                                     <Badge variant="outline">{member.plan?.name || "Custom"}</Badge>
// //                                                     <p className="text-xs text-muted-foreground mt-1">
// //                                                         {format(new Date(member.joiningDate), "dd MMM yyyy")}
// //                                                     </p>
// //                                                 </div>
// //                                             </div>
// //                                         ))
// //                                     )}
// //                                 </div>
// //                             </CardContent>
// //                         </Card>

// //                         <Card className="border-none shadow-sm">
// //                             <CardHeader className="pb-3">
// //                                 <CardTitle>Member Growth (This Month)</CardTitle>
// //                             </CardHeader>
// //                             <CardContent>
// //                                 <div className="h-80">
// //                                     <ResponsiveContainer width="100%" height="100%">
// //                                         <LineChart data={growthData}>
// //                                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
// //                                             <XAxis dataKey="name" axisLine={false} tickLine={false} />
// //                                             <YAxis axisLine={false} tickLine={false} />
// //                                             <Tooltip />
// //                                             <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
// //                                         </LineChart>
// //                                     </ResponsiveContainer>
// //                                 </div>
// //                             </CardContent>
// //                         </Card>
// //                     </div>
// //                 </div>
// //             )}
// //         </DashboardLayout>
// //     );
// // }

// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import {
//   Users,
//   TrendingUp,
//   DollarSign,
//   AlertCircle,
//   ArrowUpRight,
//   ArrowDownRight,
// } from "lucide-react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
// } from "recharts";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import { DashboardLayout } from "@/components/DashboardLayout";
// import { format, subMonths } from "date-fns";

// type Stat = {
//   label: string;
//   value: string | number;
//   icon: React.ComponentType<{ className?: string }>;
//   color: string;
//   change: string;
// };

// type IncomeData = { name: string; income: number };
// type GrowthData = { name: string; students: number };
// type PieData = { name: string; value: number };

// type RecentMember = {
//   id: string;
//   name: string;
//   mobile: string;
//   joiningDate: string;
//   plan?: { name: string };
// };

// export default function GymAdminDashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [stats, setStats] = useState<Stat[]>([]);
//   const [incomeData, setIncomeData] = useState<IncomeData[]>([]);
//   const [growthData, setGrowthData] = useState<GrowthData[]>([]);
//   const [pieData, setPieData] = useState<PieData[]>([]);
//   const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Handle authentication redirect
//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.replace("/login");
//     }
//   }, [status, router]);

//   // Load data when authenticated
//   useEffect(() => {
//     console.log("Session status:", status);

//     if (status !== "authenticated") return;

//     if (!session) {
//       setError("Session not available");
//       setLoading(false);
//       return;
//     }

//     console.log("User session:", session);

//     if (!session.user?.gymId) {
//       setError("No gym associated with this account");
//       toast.error("No gym found. Contact super admin.");
//       setLoading(false);
//       return;
//     }

//     const loadDashboard = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         console.log("Fetching dashboard for gym:", session.user.gymId);

//         const res = await fetch("/api/dashboard/gym-admin", {
//           credentials: "include",
//           cache: "no-store",
//         });

//         console.log("API response status:", res.status);

//         if (!res.ok) {
//           const errorText = await res.text();
//           throw new Error(`API error ${res.status}: ${errorText}`);
//         }

//         const data = await res.json();
//         console.log("Dashboard data loaded:", data);

//         setStats(data.stats || []);
//         setIncomeData(data.incomeData || []);
//         setGrowthData(data.growthData || []);
//         setPieData(data.pieData || []);
//         setRecentMembers(data.recentMembers || []);
//       } catch (err: unknown) {
//         console.error("Dashboard loading failed:", err);
//         setError(err instanceof Error ? err.message : "Failed to load dashboard");
//         toast.error("Could not load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, [status, session]);

//   const COLORS = ["#10b981", "#f43f5e", "#3b82f6"];

//   if (status === "loading" || loading) {
//     return (
//       <DashboardLayout>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <Skeleton key={i} className="h-40 w-full rounded-2xl" />
//           ))}
//         </div>
//       </DashboardLayout>
//     );
//   }

//   if (error) {
//     return (
//       <DashboardLayout>
//         <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
//           <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
//           <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
//           <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
//           <p className="text-sm text-muted-foreground">
//             Please try refreshing the page or contact support if the issue persists.
//           </p>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   const hasNoData =
//     stats.length === 0 &&
//     incomeData.length === 0 &&
//     growthData.length === 0 &&
//     pieData.length === 0 &&
//     recentMembers.length === 0;

//   return (
//     <DashboardLayout activePath="dashboard">
//       {hasNoData ? (
//         <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
//           <Users className="h-16 w-16 text-muted-foreground mb-6 opacity-70" />
//           <h2 className="text-2xl font-semibold mb-3">Welcome to your Gym Dashboard</h2>
//           <p className="text-muted-foreground mb-8 max-w-lg">
//             No data available yet. Add some members, plans and payments to see statistics, charts and recent activity here.
//           </p>
//           <div className="flex gap-4">
//             <button
//               onClick={() => router.push("/dashboard/gym-admin/members")}
//               className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
//             >
//               Add First Member
//             </button>
//             <button
//               onClick={() => router.push("/dashboard/gym-admin/plans")}
//               className="px-6 py-3 border rounded-lg hover:bg-accent transition"
//             >
//               Create Plan
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-8 pb-10">
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {stats.map((stat, i) => (
//               <Card key={i} className="border-none shadow-sm hover:shadow transition-all duration-200">
//                 <CardContent className="p-6">
//                   <div className="flex justify-between items-start">
//                     <div className={`p-3 rounded-xl bg-${stat.color}-50/50`}>
//                       {/* FIXED: direct usage of stat.icon (PascalCase component) */}
//                       <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
//                     </div>
//                     <Badge
//                       variant="outline"
//                       className={`${
//                         stat.change.startsWith("+") ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50"
//                       }`}
//                     >
//                       {stat.change.startsWith("+") ? (
//                         <ArrowUpRight className="h-3 w-3 mr-1" />
//                       ) : (
//                         <ArrowDownRight className="h-3 w-3 mr-1" />
//                       )}
//                       {stat.change}
//                     </Badge>
//                   </div>
//                   <p className="mt-4 text-sm text-muted-foreground">{stat.label}</p>
//                   <p className="text-2xl font-bold mt-1">{stat.value}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <Card className="lg:col-span-2 border-none shadow-sm">
//               <CardHeader className="pb-3">
//                 <CardTitle>Revenue (Last 6 Months)</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={incomeData}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                       <XAxis dataKey="name" axisLine={false} tickLine={false} />
//                       <YAxis axisLine={false} tickLine={false} />
//                       <Tooltip />
//                       <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-none shadow-sm">
//               <CardHeader className="pb-3">
//                 <CardTitle>Member Status</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-64 relative">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={pieData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={60}
//                         outerRadius={80}
//                         paddingAngle={5}
//                         dataKey="value"
//                       >
//                         {pieData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                     </PieChart>
//                   </ResponsiveContainer>
//                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                     <span className="text-3xl font-bold">
//                       {pieData.reduce((acc, curr) => acc + curr.value, 0)}
//                     </span>
//                     <span className="text-xs text-muted-foreground mt-1">Total Members</span>
//                   </div>
//                 </div>

//                 <div className="mt-6 space-y-3">
//                   {pieData.map((item, i) => (
//                     <div key={i} className="flex items-center justify-between text-sm">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
//                         {item.name}
//                       </div>
//                       <span className="font-medium">{item.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Bottom row */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card className="border-none shadow-sm">
//               <CardHeader className="pb-3">
//                 <CardTitle>Recent Members</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {recentMembers.length === 0 ? (
//                     <p className="text-center text-muted-foreground py-8">No recent members yet</p>
//                   ) : (
//                     recentMembers.map((member) => (
//                       <div
//                         key={member.id}
//                         className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
//                             {member.name?.[0]?.toUpperCase() || "?"}
//                           </div>
//                           <div>
//                             <p className="font-medium">{member.name}</p>
//                             <p className="text-xs text-muted-foreground">{member.mobile}</p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <Badge variant="outline">{member.plan?.name || "Custom"}</Badge>
//                           <p className="text-xs text-muted-foreground mt-1">
//                             {format(new Date(member.joiningDate), "dd MMM yyyy")}
//                           </p>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-none shadow-sm">
//               <CardHeader className="pb-3">
//                 <CardTitle>Member Growth (This Month)</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={growthData}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                       <XAxis dataKey="name" axisLine={false} tickLine={false} />
//                       <YAxis axisLine={false} tickLine={false} />
//                       <Tooltip />
//                       <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}
//     </DashboardLayout>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { format } from "date-fns";

// ────────────────────────────────────────────────
// Icon Map – prevents dynamic component errors
// ────────────────────────────────────────────────
const iconMap = {
  Users: Users,
  TrendingUp: TrendingUp,
  DollarSign: DollarSign,
  AlertCircle: AlertCircle,
  // Add more icons here when you expand stats
} as const;

type IconName = keyof typeof iconMap;

type Stat = {
  label: string;
  value: string | number;
  icon: IconName;           // now type-safe
  color: string;
  change: string;
};

type IncomeData = { name: string; income: number };
type GrowthData = { name: string; students: number };
type PieData = { name: string; value: number };

type RecentMember = {
  id: string;
  name: string;
  mobile: string;
  joiningDate: string;
  plan?: { name: string };
};

export default function GymAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stat[]>([]);
  const [incomeData, setIncomeData] = useState<IncomeData[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Load dashboard data
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    if (!session.user?.gymId) {
      setError("No gym associated with this account");
      toast.error("No gym found. Contact super admin.");
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/dashboard/gym-admin", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API error ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        // Optional: validate icon names
        const validatedStats = (data.stats || []).map((stat: unknown) => ({
          ...(typeof stat === "object" && stat !== null ? stat : {}),
          icon: typeof stat === "object" && stat !== null && "icon" in stat && iconMap[(stat as { icon: IconName }).icon]
            ? (stat as { icon: IconName }).icon
            : "Users", // fallback
        }));

        setStats(validatedStats);
        setIncomeData(data.incomeData || []);
        setGrowthData(data.growthData || []);
        setPieData(data.pieData || []);
        setRecentMembers(data.recentMembers || []);
      } catch (err: unknown) {
        console.error("Dashboard loading failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        toast.error("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [status, session, router]);

  const COLORS = ["#10b981", "#f43f5e", "#3b82f6"];

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const hasNoData =
    stats.length === 0 &&
    incomeData.length === 0 &&
    growthData.length === 0 &&
    pieData.length === 0 &&
    recentMembers.length === 0;

  return (
    <DashboardLayout activePath="dashboard">
      {hasNoData ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <Users className="h-16 w-16 text-muted-foreground mb-6 opacity-70" />
          <h2 className="text-2xl font-semibold mb-3">Welcome to your Gym Dashboard</h2>
          <p className="text-muted-foreground mb-8 max-w-lg">
            No data available yet. Add some members, plans and payments to see statistics, charts and recent activity here.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard/gym-admin/members")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
            >
              Add First Member
            </button>
            <button
              onClick={() => router.push("/dashboard/gym-admin/plans")}
              className="px-6 py-3 border border-input rounded-lg hover:bg-accent transition font-medium"
            >
              Create Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const IconComponent = iconMap[stat.icon];

              return (
                <Card
                  key={i}
                  className="border-none shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl bg-${stat.color}-50/50`}>
                        {IconComponent ? (
                          <IconComponent
                            className={`h-6 w-6 text-${stat.color}-600`}
                          />
                        ) : (
                          <Users className={`h-6 w-6 text-${stat.color}-600`} />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          stat.change.startsWith("+")
                            ? "text-green-600 bg-green-50 border-green-200"
                            : "text-rose-600 bg-rose-50 border-rose-200"
                        }`}
                      >
                        {stat.change.startsWith("+") ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts - Revenue + Member Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Revenue (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Member Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold">
                      {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Total Members</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        {item.name}
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom row - Recent Members + Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Recent Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMembers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No recent members yet</p>
                  ) : (
                    recentMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                            {member.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.mobile}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{member.plan?.name || "Custom"}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(member.joiningDate), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Member Growth (This Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="students"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}