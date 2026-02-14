// // import { NextRequest, NextResponse } from "next/server";
// // import { getServerSession } from "next-auth";
// // import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// // import { PrismaClient } from "@prisma/client";
// // import { addDays } from "date-fns";

// // const prisma = new PrismaClient();

// // export async function POST(req: NextRequest) {
// //   const session = await getServerSession(authOptions);

// //   if (!session?.user || session.user.role !== "GYM_ADMIN") {
// //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //   }

// //   const gymId = session.user.gymId;
// //   if (!gymId) {
// //     return NextResponse.json({ error: "No gym found" }, { status: 400 });
// //   }

// //   try {
// //     const body = await req.json();

// //     const {
// //       name,
// //       mobile,
// //       email,
// //       address,
// //       photo,
// //       joiningDate,
// //       expiryDate,
// //       planId,
// //       totalFees,
// //       paidAmount,
// //       pendingAmount,
// //     } = body;

// //     // Validate required fields
// //     if (!name || !mobile || !planId || !joiningDate) {
// //       return NextResponse.json(
// //         { error: "Required fields missing" },
// //         { status: 400 }
// //       );
// //     }

// //     // Verify plan belongs to this gym
// //     const plan = await prisma.membershipPlan.findFirst({
// //       where: { id: planId, gymId },
// //     });

// //     if (!plan) {
// //       return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
// //     }

// //     // Create member
// //     const member = await prisma.student.create({
// //       data: {
// //         name,
// //         mobile,
// //         email: email || null,
// //         address: address || null,
// //         photo: photo || null,
// //         joiningDate: new Date(joiningDate),
// //         expiryDate: new Date(expiryDate),
// //         status: "ACTIVE",
// //         totalFees: Number(totalFees),
// //         paidAmount: Number(paidAmount),
// //         pendingAmount: Number(pendingAmount),
// //         gymId,
// //         planId,
// //         createdById: session.user.id!, // assuming user.id exists in session
// //       },
// //     });

// //     // Optional: send WhatsApp welcome message here
// //     // await sendWelcomeWhatsApp(member.mobile, member.name, plan.name);

// //     return NextResponse.json({ success: true, member }, { status: 201 });
// //   } catch (err: unknown) {
// //     console.error("[POST /api/members]", err);
// //     return NextResponse.json(
// //       { error: "Failed to add member" },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym found" }, { status: 400 });
//   }

//   try {
//     const body = await req.json();

//     const {
//       name,
//       mobile,
//       email,
//       address,
//       photo,
//       joiningDate,
//       expiryDate,
//       planId,
//       totalFees,
//       paidAmount,
//       pendingAmount,
//     } = body;

//     // Validate required fields
//     if (!name || !mobile || !planId || !joiningDate) {
//       return NextResponse.json(
//         { error: "Required fields missing: name, mobile, planId, joiningDate" },
//         { status: 400 }
//       );
//     }

//     // Verify plan belongs to this gym
//     const plan = await prisma.membershipPlan.findFirst({
//       where: { id: planId, gymId },
//     });

//     if (!plan) {
//       return NextResponse.json(
//         { error: "Invalid plan or plan does not belong to your gym" },
//         { status: 400 }
//       );
//     }

//     // Validate mobile number format (basic check)
//     const mobileRegex = /^[0-9]{10,15}$/;
//     if (!mobileRegex.test(mobile)) {
//       return NextResponse.json(
//         { error: "Invalid mobile number format" },
//         { status: 400 }
//       );
//     }

//     // Check for duplicate mobile in same gym
//     const existingMember = await prisma.student.findFirst({
//       where: {
//         gymId,
//         mobile,
//       },
//     });

//     if (existingMember) {
//       return NextResponse.json(
//         { error: "A member with this mobile number already exists" },
//         { status: 409 }
//       );
//     }

//     // Validate photo size if provided (base64 images can be large)
//     if (photo && photo.length > 10 * 1024 * 1024) {
//       // ~7.5MB actual image size after base64 encoding
//       return NextResponse.json(
//         { error: "Photo size too large. Please use a smaller image." },
//         { status: 400 }
//       );
//     }

//     // Create member
//     const member = await prisma.student.create({
//       data: {
//         name: name.trim(),
//         mobile: mobile.trim(),
//         email: email?.trim() || null,
//         address: address?.trim() || null,
//         photo: photo || null,
//         joiningDate: new Date(joiningDate),
//         expiryDate: new Date(expiryDate),
//         status: "ACTIVE",
//         totalFees: Number(totalFees),
//         paidAmount: Number(paidAmount),
//         pendingAmount: Number(pendingAmount),
//         gymId,
//         planId,
//         createdById: session.user.id!,
//       },
//       include: {
//         plan: {
//           select: {
//             name: true,
//             duration: true,
//             price: true,
//           },
//         },
//       },
//     });

//     // Optional: Create initial payment record if amount was paid
//     if (paidAmount > 0) {
//       await prisma.payment.create({
//         data: {
//           amount: Number(paidAmount),
//           paymentDate: new Date(),
//           paymentMethod: "CASH",
//           remarks: "Initial payment during registration",
//           studentId: member.id,
//           userId: session.user.id!,
//         },
//       });
//     }

//     // Optional: Queue welcome message
//     // You can implement WhatsApp/SMS notification here
//     try {
//       await prisma.notification.create({
//         data: {
//           type: "WELCOME",
//           message: `Welcome ${name}! Your membership is now active.`,
//           status: "PENDING",
//           studentId: member.id,
//         },
//       });
//     } catch (notifErr) {
//       // Don't fail the request if notification creation fails
//       console.error("Failed to create welcome notification:", notifErr);
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Member added successfully",
//         member: {
//           id: member.id,
//           name: member.name,
//           mobile: member.mobile,
//           plan: member.plan.name,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (err: unknown) {
//     console.error("[POST /api/members]", err);
    
//     // Handle Prisma-specific errors
//     if (err instanceof Error) {
//       if (err.message.includes("Unique constraint")) {
//         return NextResponse.json(
//           { error: "Member with this information already exists" },
//           { status: 409 }
//         );
//       }
//     }

//     return NextResponse.json(
//       { error: "Failed to add member. Please try again." },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Optional: GET endpoint to fetch members
// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym found" }, { status: 400 });
//   }

//   try {
//     const members = await prisma.student.findMany({
//       where: { gymId },
//       include: {
//         plan: {
//           select: {
//             name: true,
//             duration: true,
//             price: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json(members);
//   } catch (err) {
//     console.error("[GET /api/members]", err);
//     return NextResponse.json(
//       { error: "Failed to fetch members" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  console.log("[POST /api/dashboard/members] Request received");
  
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    console.log("[POST /api/dashboard/members] Unauthorized access attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    console.log("[POST /api/dashboard/members] No gym ID found");
    return NextResponse.json({ error: "No gym found" }, { status: 400 });
  }

  try {
    const body = await req.json();
    console.log("[POST /api/dashboard/members] Request data:", {
      name: body.name,
      mobile: body.mobile,
      planId: body.planId,
      gymId,
    });

    const {
      name,
      mobile,
      email,
      address,
      photo,
      joiningDate,
      expiryDate,
      planId,
      totalFees,
      paidAmount,
      pendingAmount,
    } = body;

    // Validate required fields
    if (!name || !mobile || !planId || !joiningDate) {
      console.log("[POST /api/dashboard/members] Missing required fields");
      return NextResponse.json(
        { 
          error: "Required fields missing",
          message: "Please fill in all required fields: Name, Mobile, Plan, and Joining Date"
        },
        { status: 400 }
      );
    }

    // Validate mobile number format (basic check)
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(mobile)) {
      console.log("[POST /api/dashboard/members] Invalid mobile format:", mobile);
      return NextResponse.json(
        { 
          error: "Invalid mobile number",
          message: "Mobile number should be 10-15 digits"
        },
        { status: 400 }
      );
    }

    // Check for duplicate mobile in same gym
    const existingMember = await prisma.student.findFirst({
      where: {
        gymId,
        mobile,
      },
      select: {
        id: true,
        name: true,
        mobile: true,
        status: true,
      },
    });

    if (existingMember) {
      console.log("[POST /api/dashboard/members] Duplicate member found:", existingMember);
      return NextResponse.json(
        { 
          error: "Duplicate member",
          message: `A member with mobile number ${mobile} already exists (${existingMember.name})`,
          existingMember: {
            name: existingMember.name,
            mobile: existingMember.mobile,
            status: existingMember.status,
          },
        },
        { status: 409 }
      );
    }

    // Verify plan belongs to this gym
    const plan = await prisma.membershipPlan.findFirst({
      where: { id: planId, gymId },
    });

    if (!plan) {
      console.log("[POST /api/dashboard/members] Invalid plan:", planId);
      return NextResponse.json(
        { 
          error: "Invalid plan",
          message: "Selected plan does not exist or does not belong to your gym"
        },
        { status: 400 }
      );
    }

    // Validate photo size if provided (base64 images can be large)
    if (photo && photo.length > 10 * 1024 * 1024) {
      console.log("[POST /api/dashboard/members] Photo too large:", photo.length);
      return NextResponse.json(
        { 
          error: "Photo too large",
          message: "Photo size exceeds 7.5MB. Please use a smaller image."
        },
        { status: 400 }
      );
    }

    console.log("[POST /api/dashboard/members] Creating member...");

    // Create member
    const member = await prisma.student.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        photo: photo || null,
        joiningDate: new Date(joiningDate),
        expiryDate: new Date(expiryDate),
        status: "ACTIVE",
        totalFees: Number(totalFees) || 0,
        paidAmount: Number(paidAmount) || 0,
        pendingAmount: Number(pendingAmount) || 0,
        gymId,
        planId,
        createdById: session.user.id!,
      },
      include: {
        plan: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
      },
    });

    console.log("[POST /api/dashboard/members] Member created successfully:", member.id);

    // Create initial payment record if amount was paid
    if (paidAmount > 0) {
      try {
        await prisma.payment.create({
          data: {
            amount: Number(paidAmount),
            paymentDate: new Date(),
            paymentMethod: "CASH",
            remarks: "Initial payment during registration",
            studentId: member.id,
            userId: session.user.id!,
          },
        });
        console.log("[POST /api/dashboard/members] Payment record created");
      } catch (paymentErr) {
        console.error("[POST /api/dashboard/members] Payment record failed:", paymentErr);
        // Continue even if payment record fails
      }
    }

    // Queue welcome notification
    try {
      await prisma.notification.create({
        data: {
          type: "WELCOME",
          message: `Welcome ${name}! Your ${plan.name} membership is now active.`,
          status: "PENDING",
          studentId: member.id,
        },
      });
      console.log("[POST /api/dashboard/members] Welcome notification queued");
    } catch (notifErr) {
      console.error("[POST /api/dashboard/members] Notification failed:", notifErr);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Member added successfully",
        member: {
          id: member.id,
          name: member.name,
          mobile: member.mobile,
          plan: member.plan.name,
          expiryDate: member.expiryDate,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[POST /api/dashboard/members] Error:", err);
    
    // Handle Prisma-specific errors
    if (err instanceof Error) {
      if (err.message.includes("Unique constraint")) {
        return NextResponse.json(
          { 
            error: "Duplicate entry",
            message: "Member with this information already exists"
          },
          { status: 409 }
        );
      }
      
      // Log the actual error for debugging
      console.error("[POST /api/dashboard/members] Error details:", err.message);
    }

    return NextResponse.json(
      { 
        error: "Server error",
        message: "Failed to add member. Please try again."
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    return NextResponse.json({ error: "No gym found" }, { status: 400 });
  }

  try {
    const members = await prisma.student.findMany({
      where: { gymId },
      include: {
        plan: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(members);
  } catch (err) {
    console.error("[GET /api/dashboard/members]", err);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}