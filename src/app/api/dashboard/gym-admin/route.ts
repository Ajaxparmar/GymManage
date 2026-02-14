// app/api/dashboard/gym-admin/route.ts
// ──────────────────────────────────────────────────────────────
// GET /api/dashboard/gym-admin
// Returns all data needed for the gym admin dashboard
// ──────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path if needed
import { PrismaClient } from "@prisma/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only gym admins allowed
  if (session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Forbidden — only gym admins allowed" }, { status: 403 });
  }

  const gymId = session.user.gymId;

  if (!gymId) {
    return NextResponse.json(
      { error: "No gym associated with this account" },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5); // last 6 months including current

    // ─── 1. Basic Stats ────────────────────────────────────────────────
    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      totalRevenueThisMonth,
      totalRevenueLastMonth,
      newMembersThisMonth,
      newMembersLastMonth,
    ] = await Promise.all([
      // Total ever registered (you can change logic)
      prisma.student.count({ where: { gymId } }),

      prisma.student.count({
        where: { gymId, status: "ACTIVE" },
      }),

      prisma.student.count({
        where: { gymId, status: { in: ["EXPIRED", "SUSPENDED"] } },
      }),

      // Revenue this month
      prisma.payment.aggregate({
        where: {
          student: { gymId },
          paymentDate: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
        _sum: { amount: true },
      }),

      // Revenue last month
      prisma.payment.aggregate({
        where: {
          student: { gymId },
          paymentDate: {
            gte: startOfMonth(subMonths(now, 1)),
            lte: endOfMonth(subMonths(now, 1)),
          },
        },
        _sum: { amount: true },
      }),

      // New members this month
      prisma.student.count({
        where: {
          gymId,
          joiningDate: {
            gte: startOfMonth(now),
            lte: endOfMonth(now),
          },
        },
      }),

      // New members last month
      prisma.student.count({
        where: {
          gymId,
          joiningDate: {
            gte: startOfMonth(subMonths(now, 1)),
            lte: endOfMonth(subMonths(now, 1)),
          },
        },
      }),
    ]);

    const revenueChangePercent =
      totalRevenueLastMonth._sum.amount && totalRevenueLastMonth._sum.amount > 0
        ? Math.round(
            ((totalRevenueThisMonth._sum.amount || 0) -
              (totalRevenueLastMonth._sum.amount || 0)) /
              totalRevenueLastMonth._sum.amount *
              100
          )
        : (totalRevenueThisMonth._sum.amount ?? 0) > 0
        ? 100
        : 0;

    const memberGrowthPercent =
      newMembersLastMonth > 0
        ? Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100)
        : newMembersThisMonth > 0
        ? 100
        : 0;

    const stats = [
      {
        label: "Total Members",
        value: totalMembers,
        icon: "Users",
        color: "blue",
        change: `+${newMembersThisMonth}`,
      },
      {
        label: "Active Members",
        value: activeMembers,
        icon: "Users",
        color: "emerald",
        change: `+${memberGrowthPercent}%`,
      },
      {
        label: "Monthly Revenue",
        value: `₹${(totalRevenueThisMonth._sum.amount || 0).toLocaleString()}`,
        icon: "DollarSign",
        color: "violet",
        change:
          revenueChangePercent >= 0
            ? `+${revenueChangePercent}%`
            : `${revenueChangePercent}%`,
      },
      {
        label: "Pending Dues",
        value: "₹" + Math.round(await calculateTotalPending(gymId)),
        icon: "AlertCircle",
        color: "amber",
        change: "−2.4%", // you can compute real value later
      },
    ];

    // ─── 2. Revenue last 6 months ──────────────────────────────────────
    const incomeData = await getRevenueLast6Months(gymId, sixMonthsAgo);

    // ─── 3. Member growth (daily this month) ───────────────────────────
    const growthData = await getDailyNewMembersThisMonth(gymId, now);

    // ─── 4. Member status pie chart ────────────────────────────────────
    const pieData = [
      { name: "Active", value: activeMembers },
      { name: "Expired", value: expiredMembers },
      // You can add Suspended if you want
      // { name: "Suspended", value: suspendedCount },
    ];

    // ─── 5. Recent members (last 7) ────────────────────────────────────
    const recentMembers = await prisma.student.findMany({
      where: { gymId },
      orderBy: { joiningDate: "desc" },
      take: 7,
      select: {
        id: true,
        name: true,
        mobile: true,
        joiningDate: true,
        plan: { select: { name: true } },
      },
    });

    return NextResponse.json({
      stats,
      incomeData,
      growthData,
      pieData,
      recentMembers,
    });
  } catch (err) {
    console.error("[DASHBOARD_GYM_ADMIN]", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : undefined },
      { status: 500 }
    );
  }
}

// ───────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────

async function calculateTotalPending(gymId: string): Promise<number> {
  const result = await prisma.student.aggregate({
    where: { gymId },
    _sum: { pendingAmount: true },
  });
  return result._sum.pendingAmount || 0;
}

async function getRevenueLast6Months(gymId: string, fromDate: Date) {
  const payments = await prisma.payment.groupBy({
    by: ["paymentDate"],
    where: {
      student: { gymId },
      paymentDate: { gte: fromDate },
    },
    _sum: { amount: true },
  });

  const months: Record<string, number> = {};

  for (let i = 0; i < 6; i++) {
    const d = subMonths(new Date(), i);
    const key = format(d, "MMM");
    months[key] = 0;
  }

  payments.forEach((p) => {
    const month = format(p.paymentDate!, "MMM");
    if (month in months) {
      months[month] += p._sum.amount || 0;
    }
  });

  return Object.entries(months).map(([name, income]) => ({ name, income }));
}

async function getDailyNewMembersThisMonth(gymId: string, now: Date) {
  const start = startOfMonth(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const students = await prisma.student.findMany({
    where: {
      gymId,
      joiningDate: { gte: start },
    },
    select: { joiningDate: true },
  });

  const dailyCount: Record<string, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyCount[String(d)] = 0;
  }

  students.forEach((s) => {
    const day = s.joiningDate.getDate();
    dailyCount[String(day)]++;
  });

  return Object.entries(dailyCount).map(([name, students]) => ({
    name,
    students,
  }));
}