export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and verification code are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user || !user.verificationOtp || !user.otpExpiry) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified." }, { status: 200 });
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    if (hashOtp(otp) !== user.verificationOtp) {
      return NextResponse.json({ error: "Incorrect verification code. Please try again." }, { status: 400 });
    }

    await db.user.update({
      where: { email },
      data: { emailVerified: true, verificationOtp: null, otpExpiry: null },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
