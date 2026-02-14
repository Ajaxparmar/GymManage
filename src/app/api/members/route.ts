import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.student.findMany({
    where: { gymId: session.user.gymId ?? "" },
    include: { plan: true },
  });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const gymId = body.gymId || session.user.gymId;

  const member = await prisma.student.create({
    data: {
      name: body.name,
      mobile: body.mobile,
      email: body.email,
      address: body.address,
      photo: body.photo,
      expiryDate: body.expiryDate,
      totalFees: body.totalFees,
      paidAmount: body.paidAmount,
      pendingAmount: body.pendingAmount,
      gymId,
      planId: body.planId,
      createdById: session.user.id as string,
    },
  });
  return NextResponse.json(member);
}

// PUT for update, DELETE for delete