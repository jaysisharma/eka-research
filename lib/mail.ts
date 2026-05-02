import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function header(title: string) {
  return `
    <div style="padding:32px 40px;background:linear-gradient(135deg,#162161 0%,#06101f 100%);">
      <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#FEC73E;margin:0 0 8px;">Eka Research</p>
      <h1 style="font-size:22px;font-weight:700;margin:0;color:#ffffff;">${title}</h1>
    </div>`;
}

function wrap(inner: string) {
  return `<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;background:#06101f;border-radius:12px;overflow:hidden;">${inner}</div>`;
}

function send(to: string, subject: string, html: string) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  return transporter.sendMail({ from: `"Eka Research" <${from}>`, to, subject, html });
}

export async function sendVerificationEmail(to: string, name: string, otp: string) {
  const html = wrap(`
    ${header("Verify your email")}
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;color:#b0b8d4;line-height:1.6;font-size:14px;">
        Hi ${name}, enter the code below to activate your Eka Research account. It expires in <strong style="color:#e8eaf6;">10 minutes</strong>.
      </p>
      <div style="background:#0d1a3a;border:1px solid #1e2e5c;border-radius:10px;padding:28px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#FEC73E;font-family:monospace;">${otp}</span>
      </div>
      <p style="margin:0;font-size:12px;color:#4a5a7a;line-height:1.6;">Didn't create an account? You can safely ignore this email.</p>
    </div>
  `);
  await send(to, `${otp} — your Eka Research verification code`, html);
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const html = wrap(`
    ${header("Reset your password")}
    <div style="padding:32px 40px;">
      <p style="margin:0 0 24px;color:#b0b8d4;line-height:1.6;font-size:14px;">
        Hi ${name}, click the button below to reset your password. This link expires in <strong style="color:#e8eaf6;">1 hour</strong>.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#FEC73E;color:#0a0d1a;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">Reset password</a>
      </div>
      <p style="margin:0;font-size:12px;color:#4a5a7a;line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email. Your password won't change.
      </p>
    </div>
  `);
  await send(to, "Reset your Eka Research password", html);
}

const ROLE_LABELS: Record<string, string> = {
  FREE_USER: "Free Member",
  TEACHER: "Teacher",
  RESEARCHER: "Researcher",
  MENTOR: "Mentor",
  PAID_MEMBER: "Premium Member",
  ADMIN: "Admin",
};

export async function sendRoleNotificationEmail(
  to: string,
  name: string,
  requestedRole: string,
  approved: boolean
) {
  const roleLabel = ROLE_LABELS[requestedRole] ?? requestedRole;
  const subject = approved
    ? `Your ${roleLabel} access has been approved`
    : `Your ${roleLabel} request was not approved`;

  const html = wrap(`
    ${header(approved ? "Access approved" : "Request not approved")}
    <div style="padding:32px 40px;">
      <p style="margin:0 0 16px;color:#b0b8d4;line-height:1.6;font-size:14px;">Hi ${name},</p>
      ${approved
        ? `<p style="margin:0 0 24px;color:#b0b8d4;line-height:1.6;font-size:14px;">
            Your request for <strong style="color:#FEC73E;">${roleLabel}</strong> access has been reviewed and approved.
            Sign in to your account to access your new features.
           </p>
           <div style="text-align:center;margin-bottom:24px;">
             <a href="${process.env.AUTH_URL}/auth/login" style="display:inline-block;padding:14px 32px;background:#FEC73E;color:#0a0d1a;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">Sign in</a>
           </div>`
        : `<p style="margin:0 0 24px;color:#b0b8d4;line-height:1.6;font-size:14px;">
            Your request for <strong style="color:#e8eaf6;">${roleLabel}</strong> access was reviewed but could not be approved at this time.
            If you believe this is an error, please contact us at <a href="mailto:hello@ekaresearch.org" style="color:#FEC73E;">hello@ekaresearch.org</a>.
           </p>`}
      <p style="margin:0;font-size:12px;color:#4a5a7a;line-height:1.6;">Eka Research Team</p>
    </div>
  `);

  await send(to, subject, html);
}
