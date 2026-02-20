import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalGyms = await prisma.gym.count();
    const activeSubs = await prisma.gymSubscription.count({
      where: { status: "ACTIVE" },
    });
    const totalStudents = await prisma.student.count();

    const stats = [
      {
        label: "Total Gyms",
        value: totalGyms,
        icon: "Building2",
        color: "text-blue-600",
        change: "+12%",
      },
      {
        label: "Active Plans",
        value: activeSubs,
        icon: "CheckCircle",
        color: "text-green-600",
        change: "+5%",
      },
      {
        label: "Total Students",
        value: totalStudents,
        icon: "Users",
        color: "text-purple-600",
        change: "+18%",
      },
      {
        label: "Revenue (Month)",
        value: "₹0", // Replace with real calculation
        icon: "DollarSign",
        color: "text-amber-600",
        change: "+22%",
      },
    ];

    // Recent gyms (last 5)
    const recentGyms = await prisma.gym.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        admin: { select: { name: true } },
        subscription: {
          include: { plan: { select: { name: true } } },
        },
        _count: { select: { students: true } },
      },
    });

    const formattedRecent = recentGyms.map((gym) => ({
      id: gym.id,
      name: gym.name,
      admin: gym.admin.name,
      students: gym._count.students,
      subscription: gym.subscription?.plan.name || "No Plan",
      status: gym.subscription?.status || "Inactive",
    }));

    return NextResponse.json({
      stats,
      recentGyms: formattedRecent,
      // Add revenueData, growthData, pieData if needed
    });
  } catch (err) {
    console.error("[GET /api/super-admin/dashboard]", err);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}