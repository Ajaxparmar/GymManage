import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    return NextResponse.json({ error: "No gym associated" }, { status: 400 });
  }

  try {
    const membersWithPending = await prisma.student.findMany({
      where: {
        gymId,
        pendingAmount: { gt: 0 },        // only pending > 0
        status: "ACTIVE",                // optional: only active members
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        expiryDate: true,
        totalFees: true,
        paidAmount: true,
        pendingAmount: true,
        status: true,
        plan: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { pendingAmount: "desc" },      // highest pending first
        { expiryDate: "asc" },
      ],
    });

    return NextResponse.json(membersWithPending);
  } catch (err) {
    console.error("[GET /api/pending-fees]", err);
    return NextResponse.json(
      { error: "Failed to fetch pending fees" },
      { status: 500 }
    );
  }
}