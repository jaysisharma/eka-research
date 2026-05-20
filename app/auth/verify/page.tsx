"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Check,
  MailCheck,
} from "lucide-react";
import styles from "./page.module.css";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const t = setTimeout(() => {
      setResendCooldown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    // Paste support
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, "").slice(0, 6);

      if (cleaned.length === 6) {
        const next = cleaned.split("");
        setDigits(next);
        inputRefs.current[5]?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = digit;

    setDigits(next);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  const handleSubmit = useCallback(
    async (otp: string) => {
      if (otp.length < 6) return;

      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Verification failed.");
          setDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          setLoading(false);
          return;
        }

        setSuccess(true);

        setTimeout(() => {
          router.push("/auth/login?verified=1");
        }, 1800);
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [email, router]
  );

  useEffect(() => {
    const otp = digits.join("");

    if (otp.length === 6 && digits.every((d) => d !== "")) {
      handleSubmit(otp);
    }
  }, [digits, handleSubmit]);

  async function handleResend() {
    setResendMsg("");
    setResendLoading(true);

    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResendMsg(data.error ?? "Failed to resend.");
        return;
      }

      setResendMsg("New code sent — check your inbox.");
      setResendCooldown(60);

      setDigits(["", "", "", "", "", ""]);
      setError("");

      inputRefs.current[0]?.focus();
    } catch {
      setResendMsg("Something went wrong.");
    } finally {
      setResendLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.successWrap}>
        <div className={styles.successGlow} />

        <span className={styles.successIcon}>
          <Check size={30} strokeWidth={2.7} />
        </span>

        <h1 className={styles.successHeading}>
          Email verified
        </h1>

        <p className={styles.successSub}>
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardGlow} />

      <div className={styles.iconWrap}>
        <MailCheck size={30} strokeWidth={1.8} />
      </div>

      <h1 className={styles.heading}>
        Check your inbox
      </h1>

      <p className={styles.sub}>
        We sent a 6-digit verification code to{" "}
        <strong className={styles.emailHighlight}>
          {email || "your email"}
        </strong>
      </p>

      <div className={styles.progressDots}>
        {digits.map((d, i) => (
          <span
            key={i}
            className={`${styles.dot} ${d ? styles.dotActive : ""
              }`}
          />
        ))}
      </div>

      <div
        className={styles.otpRow}
        role="group"
        aria-label="Verification code"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={digit}
            onChange={(e) =>
              handleDigitChange(i, e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`${styles.otpInput} ${error ? styles.otpInputError : ""
              }`}
            aria-label={`Digit ${i + 1}`}
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <p className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}

      {loading && (
        <div className={styles.loadingRow}>
          <Loader2
            size={16}
            className={styles.spinner}
          />
          <span>Verifying...</span>
        </div>
      )}

      <button
        className={styles.submitBtn}
        onClick={() => handleSubmit(digits.join(""))}
        disabled={
          loading || digits.join("").length < 6
        }
      >
        {loading ? (
          <Loader2
            size={18}
            className={styles.spinner}
          />
        ) : (
          <>
            Verify email
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <div className={styles.resendRow}>
        {resendCooldown > 0 ? (
          <span className={styles.resendCooldown}>
            Resend in {resendCooldown}s
          </span>
        ) : (
          <button
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading
              ? "Sending..."
              : "Resend code"}
          </button>
        )}

        {resendMsg && (
          <span className={styles.resendMsg}>
            {resendMsg}
          </span>
        )}
      </div>

      <p className={styles.footer}>
        Wrong email?{" "}
        <Link
          href="/auth/signup"
          className={styles.footerLink}
        >
          Start over
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bg} />

      <Link href="/" className={styles.logo}>
        Eka{" "}
        <span className={styles.logoAccent}>
          Research
        </span>
      </Link>

      <Suspense fallback={<div className={styles.card} />}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}