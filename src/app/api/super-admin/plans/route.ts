// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prisma";

// // ── Interfaces ──────────────────────────────────────────────────────────────
// interface CreatePlanInput {
//   name: string;
//   duration: number;      // days
//   price: number;
//   description?: string;
//   isDefault?: boolean;
// }

// interface UpdatePlanInput {
//   id: string;
//   name?: string;
//   duration?: number;
//   price?: number;
//   description?: string;
//   isDefault?: boolean;
//   isActive?: boolean;
// }

// // ── POST - Create new membership plan ──────────────────────────────────────
// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym associated with this admin" }, { status: 400 });
//   }

//   try {
//     const body = (await req.json()) as CreatePlanInput;
//     const { name, duration, price, description, isDefault = false } = body;

//     // Validation
//     if (!name?.trim()) {
//       return NextResponse.json({ error: "Plan name is required" }, { status: 400 });
//     }
//     if (!Number.isInteger(duration) || duration <= 0) {
//       return NextResponse.json({ error: "Duration must be a positive integer (days)" }, { status: 400 });
//     }
//     if (typeof price !== "number" || price < 0) {
//       return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
//     }

//     // Prevent duplicate name in same gym
//     const existing = await prisma.membershipPlan.findFirst({
//       where: {
//         gymId,
//         name: { equals: name.trim(), mode: "insensitive" },
//       },
//     });

//     if (existing) {
//       return NextResponse.json(
//         { error: `Plan named "${name}" already exists in your gym` },
//         { status: 409 }
//       );
//     }

//     // If setting as default → unset previous defaults
//     if (isDefault) {
//       await prisma.membershipPlan.updateMany({
//         where: { gymId, isDefault: true },
//         data: { isDefault: false },
//       });
//     }

//     const plan = await prisma.membershipPlan.create({
//       data: {
//         name: name.trim(),
//         duration,
//         price,
//         description: description?.trim() || null,
//         isDefault,
//         isActive: true,
//         gymId,
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Membership plan created",
//         plan,
//       },
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error("[POST /api/dashboard/plans]", err);
//     return NextResponse.json(
//       {
//         error: "Failed to create plan",
//         details: err instanceof Error ? err.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// // ── GET - List all active plans for current gym ─────────────────────────────
// export async function GET(req: NextRequest) {
//   console.log("[GET /api/dashboard/plans] Request received");
  
//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym associated" }, { status: 400 });
//   }

//   try {
//     const { searchParams } = new URL(req.url);
//     const planId = searchParams.get("id");

//     const plans = await prisma.membershipPlan.findMany({
//       where: {
//         gymId,
//         isActive: true,
//         ...(planId && { id: planId }),
//       },
//       include: {
//         _count: {
//           select: { students: true },
//         },
//       },
//       orderBy: [
//         { isDefault: "desc" },
//         { duration: "asc" },
//         { name: "asc" },
//       ],
//     });

//     return NextResponse.json({
//       success: true,
//       count: plans.length,
//       data: plans,
//     });
//   } catch (err) {
//     console.error("[GET /api/dashboard/plans]", err);
//     return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
//   }
// }

// // ── PUT - Update existing plan ──────────────────────────────────────────────
// export async function PUT(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym associated" }, { status: 400 });
//   }

//   try {
//     const body = (await req.json()) as UpdatePlanInput;
//     const { id, ...updateData } = body;

//     if (!id) {
//       return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
//     }

//     // Verify plan belongs to this gym
//     const existingPlan = await prisma.membershipPlan.findFirst({
//       where: { id, gymId },
//     });

//     if (!existingPlan) {
//       return NextResponse.json(
//         { error: "Plan not found or does not belong to your gym" },
//         { status: 404 }
//       );
//     }

//     // If changing to default → unset other defaults
//     if (updateData.isDefault === true) {
//       await prisma.membershipPlan.updateMany({
//         where: { gymId, isDefault: true, id: { not: id } },
//         data: { isDefault: false },
//       });
//     }

//     const updated = await prisma.membershipPlan.update({
//       where: { id },
//       data: {
//         name: updateData.name ? updateData.name.trim() : undefined,
//         duration: updateData.duration,
//         price: updateData.price,
//         description: updateData.description !== undefined ? (updateData.description?.trim() || null) : undefined,
//         isDefault: updateData.isDefault,
//         isActive: updateData.isActive,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Plan updated successfully",
//       plan: updated,
//     });
//   } catch (err) {
//     console.error("[PUT /api/dashboard/plans]", err);
//     return NextResponse.json(
//       {
//         error: "Failed to update plan",
//         details: err instanceof Error ? err.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// // ── DELETE - Soft delete (deactivate) plan ──────────────────────────────────
// export async function DELETE(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym associated" }, { status: 400 });
//   }

//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
//     }

//     const plan = await prisma.membershipPlan.findFirst({
//       where: { id, gymId, isActive: true },
//     });

//     if (!plan) {
//       return NextResponse.json(
//         { error: "Plan not found, already inactive, or does not belong to your gym" },
//         { status: 404 }
//       );
//     }

//     // Soft delete
//     await prisma.membershipPlan.update({
//       where: { id },
//       data: { isActive: false },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Plan has been deactivated",
//     });
//   } catch (err) {
//     console.error("[DELETE /api/dashboard/plans]", err);
//     return NextResponse.json({ error: "Failed to deactivate plan" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// ── POST - Create new SaaS plan ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      duration,
      price,
      maxStudents = -1,
      maxEmployees = -1,
      features = [],
      isActive = true,
    } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!Number.isInteger(duration) || duration <= 0) {
      return NextResponse.json({ error: "Duration must be positive integer" }, { status: 400 });
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Price must be non-negative" }, { status: 400 });
    }

    // Prevent duplicate name
    const existing = await prisma.gymSubscriptionPlan.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });

    if (existing) {
      return NextResponse.json({ error: "Plan with this name already exists" }, { status: 409 });
    }

    const plan = await prisma.gymSubscriptionPlan.create({
      data: {
        name: name.trim(),
        duration,
        price,
        maxStudents,
        maxEmployees,
        features: Array.isArray(features) ? features : [],
        isActive,
      },
    });

    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/super-admin/plans]", err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

// ── GET - List all plans ────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const plans = await prisma.gymSubscriptionPlan.findMany({
      orderBy: [
        { isActive: "desc" },
        { price: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(plans);
  } catch (err) {
    console.error("[GET /api/super-admin/plans]", err);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

// ── PUT - Update plan ──────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

    const body = await req.json();
    const {
      name,
      duration,
      price,
      maxStudents,
      maxEmployees,
      features,
      isActive,
    } = body;

    const updateData: Partial<{
      name: string;
      duration: number;
      price: number;
      maxStudents: number;
      maxEmployees: number;
      features: string[]; // Replace 'string[]' with the appropriate type if features have a specific structure
      isActive: boolean;
    }> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (duration !== undefined) updateData.duration = duration;
    if (price !== undefined) updateData.price = price;
    if (maxStudents !== undefined) updateData.maxStudents = maxStudents;
    if (maxEmployees !== undefined) updateData.maxEmployees = maxEmployees;
    if (features !== undefined) updateData.features = Array.isArray(features) ? features : [];
    if (isActive !== undefined) updateData.isActive = isActive;

    const plan = await prisma.gymSubscriptionPlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error("[PUT /api/super-admin/plans]", err);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

// ── DELETE - Deactivate plan (soft delete) ─────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

    await prisma.gymSubscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Plan deactivated" });
  } catch (err) {
    console.error("[DELETE /api/super-admin/plans]", err);
    return NextResponse.json({ error: "Failed to deactivate plan" }, { status: 500 });
  }
}