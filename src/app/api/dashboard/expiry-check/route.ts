// app/api/members/expiry-check/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const today = new Date();
    const yesterday = subDays(today, 1);

    console.log(`Running expiry check for members expiring on or before ${yesterday.toISOString()}`);
    
    // Find all active members whose expiry is past
    const expiredMembers = await prisma.student.findMany({
      where: {
        status: "ACTIVE",
        expiryDate: { lte: yesterday },
      },
      include: { plan: { select: { price: true, duration: true } } },
    });

    if (expiredMembers.length === 0) {
      return NextResponse.json({ message: "No expired members found" });
    }

    const updates = [];

    for (const member of expiredMembers) {
      const nextMonthFee = member.plan?.price || 0;

      // Update member: expire + add next month pending
      const updated = await prisma.student.update({
        where: { id: member.id },
        data: {
          status: "EXPIRED",
          pendingAmount: { increment: nextMonthFee },
          // Optional: totalFees += nextMonthFee (if you track lifetime)
        },
      });

      updates.push({
        memberId: member.id,
        name: member.name,
        oldExpiry: member.expiryDate,
        newPending: updated.pendingAmount,
        feeAdded: nextMonthFee,
      });
    }

    return NextResponse.json({
      success: true,
      expiredCount: expiredMembers.length,
      updated: updates,
    });
  } catch (err) {
    console.error("[Expiry Check]", err);
    return NextResponse.json({ error: "Failed to process expiry" }, { status: 500 });
  }
}