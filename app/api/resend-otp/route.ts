export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "This email is already verified." }, { status: 400 });
    }

    // Rate limit: only allow resend if current OTP has less than 9 minutes left (i.e. was issued at least 1 minute ago)
    if (user.otpExpiry && user.otpExpiry > new Date(Date.now() + 9 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new code." },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.user.update({
      where: { email },
      data: { verificationOtp: otpHash, otpExpiry },
    });

    await sendVerificationEmail(email, user.name, otp);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
