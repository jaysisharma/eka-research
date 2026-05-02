export type UserRole = "FREE_USER" | "TEACHER" | "RESEARCHER" | "MENTOR" | "PAID_MEMBER" | "ADMIN";

export const ROLE_LABELS: Record<UserRole, string> = {
  FREE_USER:   "Free Member",
  TEACHER:     "Teacher",
  RESEARCHER:  "Researcher",
  MENTOR:      "Mentor",
  PAID_MEMBER: "Premium Member",
  ADMIN:       "Admin",
};

// Which roles can access each feature
export const ACCESS = {
  volunteering:        ["FREE_USER", "TEACHER", "RESEARCHER", "MENTOR", "PAID_MEMBER", "ADMIN"],
  researchPapers:      ["TEACHER", "RESEARCHER", "MENTOR", "PAID_MEMBER", "ADMIN"],
  curriculumMaterials: ["TEACHER", "ADMIN"],
  mentorProfile:       ["MENTOR", "ADMIN"],
  manageMentees:       ["MENTOR", "ADMIN"],
  memberBenefits:      ["PAID_MEMBER", "ADMIN"],
  adminPanel:          ["ADMIN"],
} as const satisfies Record<string, readonly UserRole[]>;

export type AccessFeature = keyof typeof ACCESS;

export function hasAccess(role: string | undefined | null, feature: AccessFeature): boolean {
  if (!role) return false;
  return (ACCESS[feature] as readonly string[]).includes(role);
}

// Matches .edu, .edu.np, .ac.np, .ac.uk, .ac.in, .edu.au, .ac.nz, .edu.pk, etc.
export function isAcademicEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return lower.endsWith(".edu") || /\.(edu|ac)\.[a-z]{2,}$/.test(lower);
}

export function resolveRole(
  accountType: string,
  email: string
): { role: UserRole; requestedRole: string | null } {
  const isAcademic = isAcademicEmail(email);
  if ((accountType === "TEACHER" || accountType === "RESEARCHER") && isAcademic) {
    return { role: accountType as UserRole, requestedRole: null };
  }
  if (accountType === "TEACHER" || accountType === "RESEARCHER") {
    return { role: "FREE_USER", requestedRole: accountType };
  }
  return { role: "FREE_USER", requestedRole: null };
}
