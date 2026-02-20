// // // components/DashboardLayout.tsx (updated for role-based sidebar)
// // "use client";

// // import { useState } from "react";
// // import { useSession, signOut } from "next-auth/react";
// // import { useRouter } from "next/navigation";
// // import Link from "next/link";
// // import {
// //   LayoutDashboard,
// //   Dumbbell,
// //   Users,
// //   CreditCard,
// //   Settings,
// //   LogOut,
// //   Menu,
// //   X,
// //   AlertCircle,
// // } from "lucide-react";

// // import { Button } from "@/components/ui/button";
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// // import { cn } from "@/lib/utils";

// // interface DashboardLayoutProps {
// //   children: React.ReactNode;
// //   activePath?: string;
// // }

// // export function DashboardLayout({ children, activePath }: DashboardLayoutProps) {
// //   const { data: session, status } = useSession();
// //   const router = useRouter();
// //   const [sidebarOpen, setSidebarOpen] = useState(false);

// //   if (status === "loading") {
// //     return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
// //   }

// //   if (status === "unauthenticated") {
// //     router.push("/login");
// //     return null;
// //   }

// //   const user = session?.user;
// //   const role = user?.role as string | undefined;

// //   const isSuperAdmin = role === "SUPER_ADMIN";
// //   const isGymAdmin = role === "GYM_ADMIN";

// //   const navItems = isSuperAdmin
// //     ? [
// //         { name: "Dashboard", href: "/pages/dashboard/super-admin", icon: LayoutDashboard },
// //         { name: "Gyms", href: "/pages/dashboard/super-admin/gyms", icon: Dumbbell },
// //         { name: "Users", href: "#", icon: Users },
// //         { name: "Settings", href: "#", icon: Settings },
// //       ]
// //     : isGymAdmin
// //     ? [
// //         { name: "Dashboard", href: "/pages/dashboard/gym-admin", icon: LayoutDashboard },
// //         { name: "All Members", href: "/pages/dashboard/gym-admin/allmembers", icon: Users },
// //         { name: "Add Members", href: "/pages/dashboard/gym-admin/addmembers", icon: Users },
// //         { name: "Plans", href: "/pages/dashboard/gym-admin/plans", icon: CreditCard },
// //         { name: "Pending Fees", href: "/pages/dashboard/gym-admin/pending-fees", icon: AlertCircle },
// //         { name: "Settings", href: "#", icon: Settings },
// //       ]
// //     : [];

// //   return (
// //     <div className="flex min-h-screen bg-background">
// //       {/* Sidebar */}
// //       <aside
// //         className={cn(
// //           "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r shadow-sm transition-transform duration-300 lg:translate-x-0",
// //           sidebarOpen ? "translate-x-0" : "-translate-x-full"
// //         )}
// //       >
// //         <div className="flex h-full flex-col">
// //           <div className="flex h-16 items-center border-b px-6">
// //             <Dumbbell className="h-8 w-8 text-primary mr-3" />
// //             <span className="text-xl font-bold">GymFlow</span>
// //           </div>
// //           <nav className="flex-1 px-3 py-6">
// //             <ul className="space-y-1">
// //               {navItems.map((item) => (
// //                 <li key={item.name}>
// //                   <Link
// //                     href={item.href}
// //                     className={cn(
// //                       "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
// //                       activePath === item.name.toLowerCase()
// //                         ? "bg-accent text-accent-foreground font-medium"
// //                         : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
// //                     )}
// //                     onClick={() => setSidebarOpen(false)}
// //                   >
// //                     <item.icon className="h-5 w-5" />
// //                     {item.name}
// //                   </Link>
// //                 </li>
// //               ))}
// //             </ul>
// //           </nav>
// //           <div className="border-t p-4">
// //             <div className="flex items-center gap-3">
// //               <Avatar>
// //                 <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
// //                 <AvatarFallback>
// //                   {user?.name?.[0]?.toUpperCase() ?? "U"}
// //                 </AvatarFallback>
// //               </Avatar>
// //               <div className="flex-1 min-w-0">
// //                 <p className="text-sm font-medium truncate">{user?.name}</p>
// //                 <p className="text-xs text-muted-foreground truncate">
// //                   {user?.email}
// //                 </p>
// //               </div>
// //             </div>
// //             <Button
// //               variant="ghost"
// //               className="mt-4 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
// //               onClick={() => signOut({ callbackUrl: "/login" })}
// //             >
// //               <LogOut className="mr-2 h-4 w-4" />
// //               Logout
// //             </Button>
// //           </div>
// //         </div>
// //       </aside>

// //       <div className="flex-1 lg:ml-64">
// //         <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6 lg:hidden">
// //           <Button
// //             variant="ghost"
// //             size="icon"
// //             onClick={() => setSidebarOpen(!sidebarOpen)}
// //           >
// //             {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
// //           </Button>
// //           <div className="flex-1">
// //             <h1 className="text-lg font-semibold">{role} Dashboard</h1>
// //           </div>
// //         </header>
// //         <main className="p-6">{children}</main>
// //       </div>

// //       {sidebarOpen && (
// //         <div
// //           className="fixed inset-0 z-40 bg-black/50 lg:hidden"
// //           onClick={() => setSidebarOpen(false)}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// // components/DashboardLayout.tsx (updated with top bar)
// "use client";

// import { useState } from "react";
// import { useSession, signOut } from "next-auth/react";
// import { useRouter, usePathname } from "next/navigation";
// import Link from "next/link";
// import {
//   LayoutDashboard,
//   Dumbbell,
//   Users,
//   CreditCard,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   AlertCircle,
//   Bell,
//   Search,
//   ChevronDown,
//   UserPlus,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface DashboardLayoutProps {
//   children: React.ReactNode;
//   activePath?: string;
// }

// export function DashboardLayout({ children, activePath }: DashboardLayoutProps) {
//   const { data: session, status } = useSession();
//   const router = useRouter();
//   const pathname = usePathname();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   if (status === "loading") {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center space-y-3">
//           <Dumbbell className="h-12 w-12 animate-pulse mx-auto text-primary" />
//           <p className="text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (status === "unauthenticated") {
//     router.push("/login");
//     return null;
//   }

//   const user = session?.user;
//   const role = user?.role as string | undefined;

//   const isSuperAdmin = role === "SUPER_ADMIN";
//   const isGymAdmin = role === "GYM_ADMIN";

//   const navItems = isSuperAdmin
//     ? [
//         { name: "Dashboard", href: "/pages/dashboard/super-admin", icon: LayoutDashboard, path: "dashboard" },
//         { name: "Gyms", href: "/pages/dashboard/super-admin/gyms", icon: Dumbbell, path: "gyms" },
//         { name: "Users", href: "/pages/dashboard/super-admin/users", icon: Users, path: "users" },
//         { name: "Settings", href: "/pages/dashboard/super-admin/settings", icon: Settings, path: "settings" },
//       ]
//     : isGymAdmin
//     ? [
//         { name: "Dashboard", href: "/pages/dashboard/gym-admin", icon: LayoutDashboard, path: "dashboard" },
//         { name: "All Members", href: "/pages/dashboard/gym-admin/allmembers", icon: Users, path: "allmembers" },
//         { name: "Add Members", href: "/pages/dashboard/gym-admin/addmembers", icon: UserPlus, path: "addmembers" },
//         { name: "Plans", href: "/pages/dashboard/gym-admin/plans", icon: CreditCard, path: "plans" },
//         { name: "Pending Fees", href: "/pages/dashboard/gym-admin/pending-fees", icon: AlertCircle, path: "pending-fees" },
//         { name: "Settings", href: "/pages/dashboard/gym-admin/settings", icon: Settings, path: "settings" },
//       ]
//     : [];

//   // Get current page title
//   const currentPage = navItems.find(item => pathname?.includes(item.path))?.name || "Dashboard";

//   return (
//     <div className="flex min-h-screen bg-background">
//       {/* Sidebar */}
//       <aside
//         className={cn(
//           "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r shadow-sm transition-transform duration-300 lg:translate-x-0",
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         )}
//       >
//         <div className="flex h-full flex-col">
//           {/* Logo */}
//           <div className="flex h-16 items-center border-b px-6">
//             <Dumbbell className="h-8 w-8 text-primary mr-3" />
//             <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
//               GymFlow
//             </span>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-3 py-6 overflow-y-auto">
//             <ul className="space-y-1">
//               {navItems.map((item) => {
//                 const isActive = activePath === item.path || pathname?.includes(item.path);
//                 return (
//                   <li key={item.name}>
//                     <Link
//                       href={item.href}
//                       className={cn(
//                         "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
//                         isActive
//                           ? "bg-primary text-primary-foreground font-medium shadow-sm"
//                           : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
//                       )}
//                       onClick={() => setSidebarOpen(false)}
//                     >
//                       <item.icon className="h-5 w-5" />
//                       {item.name}
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>
//           </nav>

//           {/* User Profile */}
//           <div className="border-t p-4">
//             <div className="flex items-center gap-3 mb-3">
//               <Avatar className="h-10 w-10">
//                 <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
//                 <AvatarFallback className="bg-primary text-primary-foreground">
//                   {user?.name?.[0]?.toUpperCase() ?? "U"}
//                 </AvatarFallback>
//               </Avatar>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium truncate">{user?.name}</p>
//                 <p className="text-xs text-muted-foreground truncate">
//                   {user?.email}
//                 </p>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
//               onClick={() => signOut({ callbackUrl: "/login" })}
//             >
//               <LogOut className="mr-2 h-4 w-4" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <div className="flex-1 lg:ml-64">
//         {/* Top Bar */}
//         <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
//           {/* Mobile Menu Button */}
//           <Button
//             variant="ghost"
//             size="icon"
//             className="lg:hidden"
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//           >
//             <Menu className="h-6 w-6" />
//           </Button>

//           {/* Page Title */}
//           <div className="flex-1">
//             <h1 className="text-lg font-semibold">{currentPage}</h1>
//             <p className="text-xs text-muted-foreground hidden sm:block">
//               {isGymAdmin ? "Gym Admin Panel" : isSuperAdmin ? "Super Admin Panel" : "Dashboard"}
//             </p>
//           </div>

//           {/* Search Bar (Desktop) */}
//           <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
//             <div className="relative w-full">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search members, plans..."
//                 className="pl-10 bg-muted/50"
//               />
//             </div>
//           </div>

//           {/* Right Side Actions */}
//           <div className="flex items-center gap-2">
//             {/* Search Button (Mobile) */}
//             <Button variant="ghost" size="icon" className="md:hidden">
//               <Search className="h-5 w-5" />
//             </Button>

//             {/* Notifications */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="relative">
//                   <Bell className="h-5 w-5" />
//                   <Badge 
//                     className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
//                     variant="destructive"
//                   >
//                     3
//                   </Badge>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-80">
//                 <DropdownMenuLabel>Notifications</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <div className="space-y-1">
//                   <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
//                     <div className="flex items-center gap-2 w-full">
//                       <div className="h-2 w-2 rounded-full bg-blue-500" />
//                       <p className="text-sm font-medium">New Member Joined</p>
//                       <span className="ml-auto text-xs text-muted-foreground">5m ago</span>
//                     </div>
//                     <p className="text-xs text-muted-foreground">John Doe joined with Monthly Plan</p>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
//                     <div className="flex items-center gap-2 w-full">
//                       <div className="h-2 w-2 rounded-full bg-amber-500" />
//                       <p className="text-sm font-medium">Payment Received</p>
//                       <span className="ml-auto text-xs text-muted-foreground">1h ago</span>
//                     </div>
//                     <p className="text-xs text-muted-foreground">₹5,000 received from Jane Smith</p>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
//                     <div className="flex items-center gap-2 w-full">
//                       <div className="h-2 w-2 rounded-full bg-red-500" />
//                       <p className="text-sm font-medium">Membership Expiring</p>
//                       <span className="ml-auto text-xs text-muted-foreground">2h ago</span>
//                     </div>
//                     <p className="text-xs text-muted-foreground">3 memberships expiring tomorrow</p>
//                   </DropdownMenuItem>
//                 </div>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem className="justify-center text-primary">
//                   View all notifications
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             {/* User Menu */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="gap-2 hidden sm:flex">
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
//                     <AvatarFallback className="bg-primary text-primary-foreground text-xs">
//                       {user?.name?.[0]?.toUpperCase() ?? "U"}
//                     </AvatarFallback>
//                   </Avatar>
//                   <div className="flex flex-col items-start text-left">
//                     <p className="text-sm font-medium leading-none">{user?.name}</p>
//                     <p className="text-xs text-muted-foreground mt-0.5 capitalize">
//                       {role?.toLowerCase().replace("_", " ")}
//                     </p>
//                   </div>
//                   <ChevronDown className="h-4 w-4 text-muted-foreground" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-56">
//                 <DropdownMenuLabel>
//                   <div className="flex flex-col space-y-1">
//                     <p className="text-sm font-medium">{user?.name}</p>
//                     <p className="text-xs text-muted-foreground">{user?.email}</p>
//                   </div>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                   <Settings className="mr-2 h-4 w-4" />
//                   Settings
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Users className="mr-2 h-4 w-4" />
//                   Profile
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem 
//                   className="text-red-600 focus:text-red-600"
//                   onClick={() => signOut({ callbackUrl: "/login" })}
//                 >
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Logout
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="p-6">{children}</main>
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// }

// components/DashboardLayout.tsx (with fixed header and scrollable content)
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Bell,
  Search,
  ChevronDown,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export function DashboardLayout({ children, activePath }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <Dumbbell className="h-12 w-12 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/pages/login");
    return null;
  }

  const user = session?.user;
  const role = user?.role as string | undefined;

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isGymAdmin = role === "GYM_ADMIN";

  const navItems = isSuperAdmin
    ? [
        { name: "Dashboard", href: "/pages/dashboard/super-admin", icon: LayoutDashboard, path: "dashboard" },
        { name: "Gyms", href: "/pages/dashboard/super-admin/gyms", icon: Dumbbell, path: "gyms" },   
        { name: "Plans", href: "/pages/dashboard/super-admin/plans", icon: CreditCard, path: "plans" },
        { name: "subscriptions", href: "/pages/dashboard/super-admin/subscriptions", icon: Users, path: "subscriptions" },
        { name: "Settings", href: "/pages/dashboard/super-admin/settings", icon: Settings, path: "settings" },
      ]
    : isGymAdmin
    ? [
        { name: "Dashboard", href: "/pages/dashboard/gym-admin", icon: LayoutDashboard, path: "dashboard" },
        { name: "All Members", href: "/pages/dashboard/gym-admin/allmembers", icon: Users, path: "allmembers" },
        { name: "Add Members", href: "/pages/dashboard/gym-admin/addmembers", icon: UserPlus, path: "addmembers" },
        { name: "Plans", href: "/pages/dashboard/gym-admin/plans", icon: CreditCard, path: "plans" },
        { name: "Pending Fees", href: "/pages/dashboard/gym-admin/pending-fees", icon: AlertCircle, path: "pending-fees" },
        { name: "Settings", href: "/pages/dashboard/gym-admin/settings", icon: Settings, path: "settings" },
      ]
    : [];

  // Get current page title
  const currentPage = navItems.find(item => pathname?.includes(item.path))?.name || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r shadow-sm transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6 shrink-0">
            <Dumbbell className="h-8 w-8 text-primary mr-3" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              GymFlow
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = activePath === item.path || pathname?.includes(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="border-t p-4 shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:ml-64 h-screen overflow-hidden">
        {/* Top Bar - Fixed */}
        <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 shrink-0 z-30">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{currentPage}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block truncate">
              {isGymAdmin ? "Gym Admin Panel" : isSuperAdmin ? "Super Admin Panel" : "Dashboard"}
            </p>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members, plans..."
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Button (Mobile) */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                  <div className="space-y-1">
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                      <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <p className="text-sm font-medium">New Member Joined</p>
                        <span className="ml-auto text-xs text-muted-foreground shrink-0">5m ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">John Doe joined with Monthly Plan</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                      <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <p className="text-sm font-medium">Payment Received</p>
                        <span className="ml-auto text-xs text-muted-foreground shrink-0">1h ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">₹5,000 received from Jane Smith</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                      <div className="flex items-center gap-2 w-full">
                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        <p className="text-sm font-medium">Membership Expiring</p>
                        <span className="ml-auto text-xs text-muted-foreground shrink-0">2h ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">3 memberships expiring tomorrow</p>
                    </DropdownMenuItem>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hidden sm:flex">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left max-w-[150px]">
                    <p className="text-sm font-medium leading-none truncate w-full">{user?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize truncate w-full">
                      {role?.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: "/pages/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="p-6 min-w-max">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}