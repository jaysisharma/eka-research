export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { resolveRole } from "@/lib/access";
import { sendVerificationEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rateLimit";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000); // 5 signups per hour per IP
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { name, email, password, level, interest, accountType = "FREE_USER" } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one uppercase letter." }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one number." }, { status: 400 });
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one special character." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const { role, requestedRole } = resolveRole(accountType, email);

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        level,
        interest,
        role,
        requestedRole,
        emailVerified: false,
        verificationOtp: otpHash,
        otpExpiry,
      },
    });

    await sendVerificationEmail(email, name, otp);

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, role, pending: requestedRole !== null, needsVerification: true },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
