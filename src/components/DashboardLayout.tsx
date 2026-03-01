"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Dumbbell, Users, CreditCard, Settings,
  LogOut, Menu, AlertCircle, Bell, Search, ChevronDown, UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
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
        { name: "Subscriptions", href: "/pages/dashboard/super-admin/subscriptions", icon: Users, path: "subscriptions" },
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
        { name: "Subscription", href: "/pages/dashboard/gym-admin/subscription", icon: CreditCard, path: "subscriptions" },
      ]
    : [];

  const currentPage = navItems.find(item => pathname?.includes(item.path))?.name || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r shadow-sm transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6 shrink-0">
            <Dumbbell className="h-8 w-8 text-primary mr-3" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              GymFlow
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = activePath === item.path || pathname?.includes(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User profile */}
          <div className="border-t p-4 shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => signOut({ callbackUrl: "/pages/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 lg:ml-64 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex h-16 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shrink-0 z-30">
          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">{currentPage}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {isGymAdmin ? "Gym Admin Panel" : isSuperAdmin ? "Super Admin Panel" : "Dashboard"}
            </p>
          </div>

          {/* Search — desktop only */}
          <div className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 bg-muted/50 h-9" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]" variant="destructive">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-72 overflow-y-auto">
                  {[
                    { color: "bg-blue-500", title: "New Member Joined", desc: "John Doe joined with Monthly Plan", time: "5m ago" },
                    { color: "bg-amber-500", title: "Payment Received", desc: "₹5,000 received from Jane Smith", time: "1h ago" },
                    { color: "bg-red-500", title: "Membership Expiring", desc: "3 memberships expiring tomorrow", time: "2h ago" },
                  ].map((n) => (
                    <DropdownMenuItem key={n.title} className="flex flex-col items-start gap-1 p-3">
                      <div className="flex items-center gap-2 w-full">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${n.color}`} />
                        <p className="text-sm font-medium flex-1 truncate">{n.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">{n.desc}</p>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary text-sm">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu — hidden on very small screens, shown sm+ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/pages/login" })} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu — desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden sm:flex gap-2 h-9 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[100px] truncate hidden md:block">{user?.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: "/pages/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Page content — THIS IS THE KEY FIX ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          <div className="p-4 sm:p-6 w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}