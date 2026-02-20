import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ← this is the key change
) {
  const params = await context.params; // ← await it here
  const memberId = params.id;           // now safe to access

  console.log(`Fetching details for member ${memberId}...`);

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    return NextResponse.json({ error: "No gym associated" }, { status: 400 });
  }

  try {
    const member = await prisma.student.findFirst({
      where: {
        id: memberId,
        gymId,
      },
      include: {
        plan: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
          include: {
            collectedBy: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    console.log(`Fetched details for member ${memberId}:`, {
      id: member.id,
      name: member.name,
      payments: member.payments.length,
    });

    return NextResponse.json(member);
  } catch (err) {
    console.error("[GET /api/dashboard/members/[id]/details]", err);
    return NextResponse.json({ error: "Failed to fetch member details" }, { status: 500 });
  }
}