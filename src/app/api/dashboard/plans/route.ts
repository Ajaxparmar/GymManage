import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // adjust path
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;

  if (!gymId) {
    return NextResponse.json(
      { error: "No gym associated with this account" },
      { status: 400 }
    );
  }

  try {
    const plans = await prisma.membershipPlan.findMany({
      where: {
        gymId,
        // You can add .orderBy({ isDefault: "desc", createdAt: "desc" }) if desired
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(plans);
  } catch (err) {
    console.error("[GET /api/plans]", err);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────
// POST → Create new plan
// ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    return NextResponse.json({ error: "No gym ID" }, { status: 400 });
  }

  try {
    const body = await req.json();

    const {
      name,
      duration,      // in days
      price,
      description,
      isDefault = false,
      isActive = true,
    } = body;

    if (!name || !duration || !price) {
      return NextResponse.json(
        { error: "name, duration, and price are required" },
        { status: 400 }
      );
    }

    // Optional: prevent multiple default plans if your business rule requires only one
    if (isDefault) {
      await prisma.membershipPlan.updateMany({
        where: { gymId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newPlan = await prisma.membershipPlan.create({
      data: {
        name: name.trim(),
        duration: Number(duration),
        price: Number(price),
        description: description?.trim() || null,
        isDefault: Boolean(isDefault),
        isActive: Boolean(isActive),
        gymId,
      },
    });

    return NextResponse.json(newPlan, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/plans]", err);
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "A plan with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────
// PATCH → Update plan (partial)
// ────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
    console.log("PATCH /api/plans - session:", session);
    
  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym ID" }, { status: 400 });

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    // Optional: only allow certain fields to be updated
    const allowedUpdates = {
      name: updateData.name?.trim(),
      duration: updateData.duration ? Number(updateData.duration) : undefined,
      price: updateData.price ? Number(updateData.price) : undefined,
      description: updateData.description?.trim() ?? null,
      isActive: updateData.isActive !== undefined ? Boolean(updateData.isActive) : undefined,
      // isDefault: only super-admin or special logic should change this
    };

    // Clean undefined values
    const cleanData = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
    );

    // Special handling for isDefault
    if ("isDefault" in updateData) {
      if (updateData.isDefault === true) {
        await prisma.membershipPlan.updateMany({
          where: { gymId, isDefault: true },
          data: { isDefault: false },
        });
        cleanData.isDefault = true;
      } else {
        cleanData.isDefault = false;
      }
    }

    const updated = await prisma.membershipPlan.update({
      where: { id, gymId }, // important: gymId scope
      data: cleanData,
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("[PATCH /api/plans]", err);
    if (err instanceof Error && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

// ────────────────────────────────────────────────
// DELETE → Delete plan
// ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) return NextResponse.json({ error: "No gym ID" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
  }

  try {
    // Check if plan is in use
    const usageCount = await prisma.student.count({
      where: {
        planId: id,
        gymId,
        status: "ACTIVE",
      },
    });

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete plan — it is currently used by active members" },
        { status: 409 }
      );
    }

    // Check if default
    const plan = await prisma.membershipPlan.findUnique({
      where: { id, gymId },
      select: { isDefault: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.isDefault) {
      return NextResponse.json(
        { error: "Default plans cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.membershipPlan.delete({
      where: { id, gymId },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[DELETE /api/plans]", err);
    if (err instanceof Error && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    );
  }
}