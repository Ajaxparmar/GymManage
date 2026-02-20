// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { PrismaClient } from "@prisma/client";
// import { addDays, format, isPast } from "date-fns";
// import { sendWhatsAppMessage } from "@/lib/whatsapp-manager"; // ← server-side function
// import { sendWhatsAppMessageServer } from "@/lib/whatsapp";

// const prisma = new PrismaClient();

// function normalizePhone(phone: string): string {
//   let cleaned = phone.replace(/\D/g, "");
//   if (cleaned.startsWith("91")) cleaned = cleaned.substring(2);
//   if (cleaned.length === 10) cleaned = "91" + cleaned;
//   return "+" + cleaned;
// }

// export async function POST(req: NextRequest) {
//   console.log("[POST /api/dashboard/members] Request received");

//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     console.log("[POST /api/dashboard/members] Unauthorized");
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     console.log("[POST /api/dashboard/members] No gymId in session");
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
//       paidAmount = 0,
//       pendingAmount,
//     } = body;

//     // Required fields
//     if (!name?.trim() || !mobile?.trim() || !planId || !joiningDate) {
//       return NextResponse.json(
//         { error: "Missing required fields: name, mobile, planId, joiningDate" },
//         { status: 400 }
//       );
//     }

//     const normalizedMobile = normalizePhone(mobile);
//     if (!/^\+\d{10,15}$/.test(normalizedMobile)) {
//       return NextResponse.json({ error: "Invalid mobile format" }, { status: 400 });
//     }

//     // Duplicate check
//     const duplicate = await prisma.student.findFirst({
//       where: { gymId, mobile: normalizedMobile },
//     });
//     if (duplicate) {
//       return NextResponse.json(
//         { error: "Duplicate mobile", message: `Mobile ${normalizedMobile} already exists` },
//         { status: 409 }
//       );
//     }

//     // Validate plan
//     const plan = await prisma.membershipPlan.findFirst({
//       where: { id: planId, gymId },
//     });
//     if (!plan) {
//       return NextResponse.json({ error: "Invalid or unauthorized plan" }, { status: 400 });
//     }

//     // Create member
//     const member = await prisma.student.create({
//       data: {
//         name: name.trim(),
//         mobile: normalizedMobile,
//         email: email?.trim() || null,
//         address: address?.trim() || null,
//         photo: photo || null,
//         joiningDate: new Date(joiningDate),
//         expiryDate: new Date(expiryDate || addDays(new Date(joiningDate), plan.duration)),
//         status: "ACTIVE",
//         totalFees: Number(totalFees) || plan.price || 0,
//         paidAmount: Number(paidAmount),
//         pendingAmount: Number(pendingAmount) ?? (Number(totalFees || plan.price) - Number(paidAmount)),
//         gymId,
//         planId,
//         createdById: session.user.id!,
//       },
//       include: {
//         plan: { select: { name: true, duration: true, price: true } },
//       },
//     });

//     console.log("[POST /api/dashboard/members] Member created:", member.id);

//     // Initial payment (if any)
//     if (Number(paidAmount) > 0) {
//       await prisma.payment.create({
//         data: {
//           amount: Number(paidAmount),
//           paymentDate: new Date(),
//           paymentMethod: "CASH",
//           remarks: "Initial payment at registration",
//           studentId: member.id,
//           userId: session.user.id!,
//         },
//       });
//     }

//     // Queue welcome notification (DB)
//     await prisma.notification.create({
//       data: {
//         type: "WELCOME",
//         message: `Welcome ${name}! Your ${plan.name} membership is now active.`,
//         status: "PENDING",
//         studentId: member.id,
//       },
//     });

//     // Send WhatsApp welcome (only if enabled)
//  // Send WhatsApp welcome (only if enabled)
// try {
//   const gym = await prisma.gym.findUnique({
//     where: { id: gymId },
//     select: { whatsappEnabled: true },
//   });

//   if (gym?.whatsappEnabled) {
//     const welcomeText =
//       `🎉 Welcome ${name}!\n\n` +
//       `Your ${plan.name} membership is now active.\n` +
//       `Valid until: ${format(member.expiryDate, "dd MMM yyyy")}\n\n` +
//       `Thank you for joining us! 💪`;

//     await sendWhatsAppMessageServer(
//       gymId,
//       normalizedMobile,
//       welcomeText,
//       { showToast: false, silent: true } // not used but kept for compatibility
//     );

//     console.log("[POST /api/dashboard/members] Welcome WhatsApp sent");
//   }
// } catch (err) {
//   console.warn(
//     "[POST /api/dashboard/members] Welcome WhatsApp failed (non-blocking):",
//     err
//   );
// }


//     return NextResponse.json(
//       {
//         success: true,
//         message: "Member added successfully",
//         member: {
//           id: member.id,
//           name: member.name,
//           mobile: member.mobile,
//           plan: member.plan.name,
//           expiryDate: member.expiryDate,
//         },
//       },
//       { status: 201 }
//     );
//   } catch (err: unknown) {
//     console.error("[POST /api/dashboard/members] Error:", err);
//     return NextResponse.json(
//       { error: "Failed to add member", message: (err as Error)?.message || "Unknown error" },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // ──────────────────────────────────────────────────────────────────────────────
// // GET - List all members
// // ──────────────────────────────────────────────────────────────────────────────

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
//         plan: { select: { name: true, duration: true, price: true } },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json(members);
//   } catch (err) {
//     console.error("[GET /api/dashboard/members]", err);
//     return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // ──────────────────────────────────────────────────────────────────────────────
// // PATCH - Update member + send WhatsApp notification if changed
// // ──────────────────────────────────────────────────────────────────────────────

// export async function PATCH(req: NextRequest) {
//   console.log("[PATCH /api/dashboard/members] Request received");

//   const session = await getServerSession(authOptions);

//   if (!session?.user || session.user.role !== "GYM_ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const gymId = session.user.gymId;
//   if (!gymId) {
//     return NextResponse.json({ error: "No gym associated" }, { status: 400 });
//   }

//   try {
//     const body = await req.json();
//     const { id, ...updateData } = body;

//     if (!id) {
//       return NextResponse.json({ error: "Member ID required" }, { status: 400 });
//     }

//     // Fetch existing member
//     const existing = await prisma.student.findFirst({
//       where: { id, gymId },
//       include: {
//         plan: { select: { id: true, name: true, duration: true, price: true } },
//       },
//     });

//     if (!existing) {
//       return NextResponse.json({ error: "Member not found or not in your gym" }, { status: 404 });
//     }

//     // Prevent duplicate mobile
//     if (updateData.mobile && updateData.mobile !== existing.mobile) {
//       const duplicate = await prisma.student.findFirst({
//         where: {
//           gymId,
//           mobile: normalizePhone(updateData.mobile),
//           id: { not: id },
//         },
//       });
//       if (duplicate) {
//         return NextResponse.json(
//           { error: "Mobile number already in use by another member" },
//           { status: 409 }
//         );
//       }
//     }

//     // Track changed fields
//     const changedFields: string[] = [];

//     if (updateData.name?.trim() && updateData.name.trim() !== existing.name) changedFields.push("name");
//     if (updateData.mobile && normalizePhone(updateData.mobile) !== existing.mobile) changedFields.push("mobile");
//     if (updateData.email?.trim() !== existing.email) changedFields.push("email");
//     if (updateData.address?.trim() !== existing.address) changedFields.push("address");
//     if (updateData.photo !== undefined && updateData.photo !== existing.photo) changedFields.push("photo");

//     // Plan change
//     let newPlan = existing.plan;
//     let newExpiry = new Date(existing.expiryDate);
//     let newTotalFees = existing.totalFees;
//     let newPending = existing.pendingAmount;

//     if (updateData.planId && updateData.planId !== existing.plan.id) {
//       changedFields.push("membership plan");

//       const selectedPlan = await prisma.membershipPlan.findFirst({
//         where: { id: updateData.planId, gymId },
//       });

//       if (!selectedPlan) {
//         return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
//       }

//       newPlan = selectedPlan;
//       newTotalFees = selectedPlan.price;

//       const baseDate = isPast(existing.expiryDate) ? new Date() : existing.expiryDate;
//       newExpiry = addDays(baseDate, selectedPlan.duration);
//       newPending = Math.max(0, newTotalFees - existing.paidAmount);
//     }

//     // Manual expiry override
//     if (updateData.expiryDate) {
//       const parsed = new Date(updateData.expiryDate);
//       if (!isNaN(parsed.getTime()) && parsed.getTime() !== newExpiry.getTime()) {
//         changedFields.push("expiry date");
//         newExpiry = parsed;
//       }
//     }

//     // Fee adjustments
//     if (updateData.paidAmount !== undefined) {
//       const newPaid = Number(updateData.paidAmount);
//       if (newPaid !== existing.paidAmount) {
//         changedFields.push("paid amount");
//         newPending = Math.max(0, newPending - (newPaid - existing.paidAmount));
//       }
//     }

//     if (updateData.totalFees !== undefined) {
//       const newTotal = Number(updateData.totalFees);
//       if (newTotal !== existing.totalFees) {
//         changedFields.push("total fees");
//         newTotalFees = newTotal;
//         newPending = Math.max(0, newTotal - existing.paidAmount);
//       }
//     }

//     if (updateData.pendingAmount !== undefined) {
//       const newPendingVal = Number(updateData.pendingAmount);
//       if (newPendingVal !== existing.pendingAmount) {
//         changedFields.push("pending dues");
//         newPending = Math.max(0, newPendingVal);
//       }
//     }

//     // Final update object
//     const finalUpdate: Record<string, unknown> = {
//       name: updateData.name?.trim(),
//       mobile: updateData.mobile ? normalizePhone(updateData.mobile) : undefined,
//       email: updateData.email?.trim() || null,
//       address: updateData.address?.trim() || null,
//       photo: updateData.photo ?? existing.photo,
//       planId: updateData.planId || existing.planId,
//       joiningDate: updateData.joiningDate ? new Date(updateData.joiningDate) : undefined,
//       expiryDate: newExpiry,
//       totalFees: newTotalFees,
//       paidAmount: updateData.paidAmount !== undefined ? Number(updateData.paidAmount) : undefined,
//       pendingAmount: newPending,
//       status: newPending <= 0 && isPast(newExpiry) ? "EXPIRED" : "ACTIVE",
//     };

//     Object.keys(finalUpdate).forEach(key => finalUpdate[key] === undefined && delete finalUpdate[key]);

//     if (Object.keys(finalUpdate).length === 0) {
//       return NextResponse.json({
//         success: true,
//         message: "No changes to apply",
//         member: existing,
//       });
//     }

//     // Update
//     const updatedMember = await prisma.student.update({
//       where: { id },
//       data: finalUpdate,
//       include: {
//         plan: { select: { name: true, duration: true, price: true } },
//       },
//     });

//     // Send WhatsApp notification on changes
//     if (changedFields.length > 0) {
//       try {
//         const gym = await prisma.gym.findUnique({
//           where: { id: gymId },
//           select: { whatsappEnabled: true },
//         });

//         if (gym?.whatsappEnabled) {
//           const changesText = changedFields.join(", ").replace(/,\s([^,]+)$/, " and $1");

//           const msg = `Hi ${updatedMember.name},\n\n` +
//                       `Your profile has been updated (${changesText}).\n\n` +
//                       `Current Plan: ${updatedMember.plan.name}\n` +
//                       `Expiry: ${format(newExpiry, "dd MMM yyyy")}\n` +
//                       `Pending Dues: ₹${newPending.toLocaleString()}\n\n` +
//                       `Thank you for being with us! 💪`;

//           await sendWhatsAppMessage(gymId, updatedMember.mobile, msg, { showToast: true, silent: false });
//           console.log("[PATCH /api/dashboard/members] WhatsApp update notification sent");
//         }
//       } catch (err) {
//         console.warn("[PATCH /api/dashboard/members] WhatsApp notification failed:", err);
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Member updated successfully",
//       member: updatedMember,
//     });
//   } catch (err: unknown) {
//     console.error("[PATCH /api/dashboard/members] Error:", err);
//     return NextResponse.json(
//       { error: "Failed to update member", message: (err as Error)?.message || "Unknown error" },
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
import { addDays, format, isPast } from "date-fns";
import { sendWhatsAppMessage, getGymWAStatus } from "@/lib/whatsapp-manager";

const prisma = new PrismaClient();

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("91")) cleaned = cleaned.substring(2);
  if (cleaned.length === 10) cleaned = "91" + cleaned;
  return "+" + cleaned;
}

// ──────────────────────────────────────────────────────────────────────────────
// POST - Add new member
// ──────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  console.log("[POST /api/dashboard/members] Request received");

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    console.log("[POST /api/dashboard/members] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    console.log("[POST /api/dashboard/members] No gymId in session");
    return NextResponse.json({ error: "No gym found" }, { status: 400 });
  }

  try {
    const body = await req.json();
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
      paidAmount = 0,
      pendingAmount,
    } = body;

    // Required fields
    if (!name?.trim() || !mobile?.trim() || !planId || !joiningDate) {
      return NextResponse.json(
        { error: "Missing required fields: name, mobile, planId, joiningDate" },
        { status: 400 }
      );
    }

    const normalizedMobile = normalizePhone(mobile);
    if (!/^\+\d{10,15}$/.test(normalizedMobile)) {
      return NextResponse.json({ error: "Invalid mobile format" }, { status: 400 });
    }

    // Duplicate check
    const duplicate = await prisma.student.findFirst({
      where: { gymId, mobile: normalizedMobile },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "Duplicate mobile", message: `Mobile ${normalizedMobile} already exists` },
        { status: 409 }
      );
    }

    // Validate plan
    const plan = await prisma.membershipPlan.findFirst({
      where: { id: planId, gymId },
    });
    if (!plan) {
      return NextResponse.json({ error: "Invalid or unauthorized plan" }, { status: 400 });
    }

    // Create member
    const member = await prisma.student.create({
      data: {
        name: name.trim(),
        mobile: normalizedMobile,
        email: email?.trim() || null,
        address: address?.trim() || null,
        photo: photo || null,
        joiningDate: new Date(joiningDate),
        expiryDate: new Date(expiryDate || addDays(new Date(joiningDate), plan.duration)),
        status: "ACTIVE",
        totalFees: Number(totalFees) || plan.price || 0,
        paidAmount: Number(paidAmount),
        pendingAmount: Number(pendingAmount) ?? (Number(totalFees || plan.price) - Number(paidAmount)),
        gymId,
        planId,
        createdById: session.user.id!,
      },
      include: {
        plan: { select: { name: true, duration: true, price: true } },
      },
    });

    console.log("[POST /api/dashboard/members] Member created:", member.id);

    // Initial payment (if any)
    if (Number(paidAmount) > 0) {
      await prisma.payment.create({
        data: {
          amount: Number(paidAmount),
          paymentDate: new Date(),
          paymentMethod: "CASH",
          remarks: "Initial payment at registration",
          studentId: member.id,
          userId: session.user.id!,
        },
      });
    }

    // Queue welcome notification (DB)
    await prisma.notification.create({
      data: {
        type: "WELCOME",
        message: `Welcome ${name}! Your ${plan.name} membership is now active.`,
        status: "PENDING",
        studentId: member.id,
      },
    });

    // Send WhatsApp welcome (only if enabled and client is ready)
    try {
      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
        select: { whatsappEnabled: true, name: true },
      });

      if (gym?.whatsappEnabled) {
        const waStatus = getGymWAStatus(gymId);
        console.log(`[POST /api/dashboard/members] WA status for ${gymId}: ${waStatus}`);

        if (waStatus === "ready") {
          const welcomeText =
          `Hello ${name}, welcome to *${gym?.name}*! 👋\n\n` +
          `Your *${plan.name} Membership* is now active.\n` +
          `📅 Valid till: ${format(member.expiryDate, "dd MMM yyyy")}\n\n` +
          `Let’s get started 💪`;

          await sendWhatsAppMessage(gymId, normalizedMobile, welcomeText, {
            showToast: true,
            silent: false,
          });

          console.log("[POST /api/dashboard/members] Welcome WhatsApp sent");
        } else {
          console.warn(
            `[POST /api/dashboard/members] WA not ready (${waStatus}) — skipping welcome message`
          );
        }
      }
    } catch (err) {
      console.warn(
        "[POST /api/dashboard/members] Welcome WhatsApp failed (non-blocking):",
        err
      );
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
    return NextResponse.json(
      { error: "Failed to add member", message: (err as Error)?.message || "Unknown error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// GET - List all members
// ──────────────────────────────────────────────────────────────────────────────

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
        plan: { select: { name: true, duration: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(members);
  } catch (err) {
    console.error("[GET /api/dashboard/members]", err);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PATCH - Update member + send WhatsApp notification if changed
// ──────────────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  console.log("[PATCH /api/dashboard/members] Request received");

  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "GYM_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gymId = session.user.gymId;
  if (!gymId) {
    return NextResponse.json({ error: "No gym associated" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    // Fetch existing member
    const existing = await prisma.student.findFirst({
      where: { id, gymId },
      include: {
        plan: { select: { id: true, name: true, duration: true, price: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Member not found or not in your gym" }, { status: 404 });
    }

    // Prevent duplicate mobile
    if (updateData.mobile && updateData.mobile !== existing.mobile) {
      const duplicate = await prisma.student.findFirst({
        where: {
          gymId,
          mobile: normalizePhone(updateData.mobile),
          id: { not: id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Mobile number already in use by another member" },
          { status: 409 }
        );
      }
    }

    // Track changed fields
    const changedFields: string[] = [];

    if (updateData.name?.trim() && updateData.name.trim() !== existing.name) changedFields.push("name");
    if (updateData.mobile && normalizePhone(updateData.mobile) !== existing.mobile) changedFields.push("mobile");
    if (updateData.email?.trim() !== existing.email) changedFields.push("email");
    if (updateData.address?.trim() !== existing.address) changedFields.push("address");
    if (updateData.photo !== undefined && updateData.photo !== existing.photo) changedFields.push("photo");

    // Plan change
    let newPlan = existing.plan;
    let newExpiry = new Date(existing.expiryDate);
    let newTotalFees = existing.totalFees;
    let newPending = existing.pendingAmount;

    if (updateData.planId && updateData.planId !== existing.plan.id) {
      changedFields.push("membership plan");

      const selectedPlan = await prisma.membershipPlan.findFirst({
        where: { id: updateData.planId, gymId },
      });

      if (!selectedPlan) {
        return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
      }

      newPlan = selectedPlan;
      newTotalFees = selectedPlan.price;

      const baseDate = isPast(existing.expiryDate) ? new Date() : existing.expiryDate;
      newExpiry = addDays(baseDate, selectedPlan.duration);
      newPending = Math.max(0, newTotalFees - existing.paidAmount);
    }

    // Manual expiry override
    if (updateData.expiryDate) {
      const parsed = new Date(updateData.expiryDate);
      if (!isNaN(parsed.getTime()) && parsed.getTime() !== newExpiry.getTime()) {
        changedFields.push("expiry date");
        newExpiry = parsed;
      }
    }

    // Fee adjustments
    if (updateData.paidAmount !== undefined) {
      const newPaid = Number(updateData.paidAmount);
      if (newPaid !== existing.paidAmount) {
        changedFields.push("paid amount");
        newPending = Math.max(0, newPending - (newPaid - existing.paidAmount));
      }
    }

    if (updateData.totalFees !== undefined) {
      const newTotal = Number(updateData.totalFees);
      if (newTotal !== existing.totalFees) {
        changedFields.push("total fees");
        newTotalFees = newTotal;
        newPending = Math.max(0, newTotal - existing.paidAmount);
      }
    }

    if (updateData.pendingAmount !== undefined) {
      const newPendingVal = Number(updateData.pendingAmount);
      if (newPendingVal !== existing.pendingAmount) {
        changedFields.push("pending dues");
        newPending = Math.max(0, newPendingVal);
      }
    }

    // Final update object
    const finalUpdate: Record<string, unknown> = {
      name: updateData.name?.trim(),
      mobile: updateData.mobile ? normalizePhone(updateData.mobile) : undefined,
      email: updateData.email?.trim() || null,
      address: updateData.address?.trim() || null,
      photo: updateData.photo ?? existing.photo,
      planId: updateData.planId || existing.planId,
      joiningDate: updateData.joiningDate ? new Date(updateData.joiningDate) : undefined,
      expiryDate: newExpiry,
      totalFees: newTotalFees,
      paidAmount: updateData.paidAmount !== undefined ? Number(updateData.paidAmount) : undefined,
      pendingAmount: newPending,
      status: newPending <= 0 && isPast(newExpiry) ? "EXPIRED" : "ACTIVE",
    };

    Object.keys(finalUpdate).forEach(key => finalUpdate[key] === undefined && delete finalUpdate[key]);

    if (Object.keys(finalUpdate).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes to apply",
        member: existing,
      });
    }

    // Update
    const updatedMember = await prisma.student.update({
      where: { id },
      data: finalUpdate,
      include: {
        plan: { select: { name: true, duration: true, price: true } },
      },
    });

    // Send WhatsApp notification on changes
    if (changedFields.length > 0) {
      try {
        const gym = await prisma.gym.findUnique({
          where: { id: gymId },
          select: { whatsappEnabled: true },
        });

        if (gym?.whatsappEnabled) {
          const waStatus = getGymWAStatus(gymId);
          console.log(`[PATCH /api/dashboard/members] WA status for ${gymId}: ${waStatus}`);

          if (waStatus === "ready") {
            const changesText = changedFields.join(", ").replace(/,\s([^,]+)$/, " and $1");

            const msg =
              `Hi ${updatedMember.name},\n\n` +
              `Your profile has been updated (${changesText}).\n\n` +
              `Current Plan: ${updatedMember.plan.name}\n` +
              `Expiry: ${format(newExpiry, "dd MMM yyyy")}\n` +
              `Pending Dues: ₹${newPending.toLocaleString()}\n\n` +
              `Thank you for being with us! 💪`;

            await sendWhatsAppMessage(gymId, updatedMember.mobile, msg, {
              showToast: true,
              silent: false,
            });

            console.log("[PATCH /api/dashboard/members] WhatsApp update notification sent");
          } else {
            console.warn(
              `[PATCH /api/dashboard/members] WA not ready (${waStatus}) — skipping update notification`
            );
          }
        }
      } catch (err) {
        console.warn("[PATCH /api/dashboard/members] WhatsApp notification failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (err: unknown) {
    console.error("[PATCH /api/dashboard/members] Error:", err);
    return NextResponse.json(
      { error: "Failed to update member", message: (err as Error)?.message || "Unknown error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}