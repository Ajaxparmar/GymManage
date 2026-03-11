import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, gymName, phone, email, gymSize, interest, message } = body;

    console.log("[Contact POST] Received data:", { name, gymName, phone, email, gymSize, interest, message });  
    

    // Server-side validation
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone?.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!interest) {
      return NextResponse.json({ error: "Interest selection is required" }, { status: 400 });
    }

    const lead = await prisma.contactLead.create({
      data: {
        name:     name.trim(),
        gymName:  gymName?.trim() || null,
        phone:    phone.replace(/\s/g, ""),
        email:    email?.trim() || null,
        gymSize:  gymSize || null,
        interest,
        message:  message?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (err) {
    console.error("[contact/POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}