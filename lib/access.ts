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

export function isEduEmail(email: string): boolean {
  return email.toLowerCase().endsWith(".edu");
}

export function resolveRole(accountType: string, email: string): UserRole {
  if ((accountType === "TEACHER" || accountType === "RESEARCHER") && isEduEmail(email)) {
    return accountType as UserRole;
  }
  return "FREE_USER";
}
