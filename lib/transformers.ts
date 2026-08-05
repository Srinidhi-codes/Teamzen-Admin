import { User } from "./graphql/users/types";
import { ColorAccent } from "./store/slices/themeSlice";

const VALID_ACCENTS: ColorAccent[] = [
  "teal",
  "slate",
  "blue",
  "green",
  "indigo",
  "orange",
  "red",
  "purple",
];

export function normalizeAccent(value?: string | null): ColorAccent {
  if (value && VALID_ACCENTS.includes(value as ColorAccent)) {
    return value as ColorAccent;
  }
  return "teal";
}

export const mapBackendUserToFrontendUser = (backendUser: any): User => {
  const orgRaw = backendUser.organization;
  let organization: User["organization"] = null;

  if (orgRaw && typeof orgRaw === "object") {
    organization = {
      id: String(orgRaw.id ?? orgRaw),
      name: orgRaw.name || backendUser.organization_name || "Unknown Organization",
      plan: orgRaw.plan,
      planExpiresAt: orgRaw.planExpiresAt || orgRaw.plan_expires_at || null,
      daysUntilPlanExpiry:
        orgRaw.daysUntilPlanExpiry ?? orgRaw.days_until_plan_expiry ?? null,
      accent: normalizeAccent(orgRaw.accent),
      logo: orgRaw.logo?.url
        ? { url: orgRaw.logo.url }
        : orgRaw.logo || null,
    };
  } else if (orgRaw) {
    organization = {
      id: String(orgRaw),
      name: backendUser.organization_name || "Unknown Organization",
      plan: backendUser.organization_plan || backendUser.plan,
      planExpiresAt:
        backendUser.organization_plan_expires_at ||
        backendUser.plan_expires_at ||
        null,
      daysUntilPlanExpiry: null,
      accent: normalizeAccent(
        backendUser.organization_accent || backendUser.accent
      ),
      logo: null,
    };
  }

  return {
    id: backendUser.id,
    email: backendUser.email,
    username: backendUser.username || backendUser.email.split("@")[0],
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    phoneNumber: backendUser.phone_number,
    role: backendUser.role,
    isActive: backendUser.is_active,
    isVerified: backendUser.is_verified || false,
    dateOfJoining: backendUser.date_of_joining,
    dateOfBirth: backendUser.date_of_birth,
    gender: backendUser.gender,
    profilePictureUrl:
      backendUser.profile_picture || backendUser.profilePictureUrl || null,
    employeeId: backendUser.employee_id,
    employmentType: backendUser.employment_type,
    organization,
    hasSeenOnboarding:
      backendUser.has_seen_onboarding || backendUser.hasSeenOnboarding || false,
    hasSeenAiOnboarding:
      backendUser.has_seen_ai_onboarding ||
      backendUser.hasSeenAiOnboarding ||
      false,
    manager: backendUser.manager,
    department: backendUser.department
      ? typeof backendUser.department === "object"
        ? backendUser.department
        : { id: backendUser.department, name: backendUser.department_name }
      : null,
    designation: backendUser.designation
      ? typeof backendUser.designation === "object"
        ? backendUser.designation
        : { id: backendUser.designation, name: backendUser.designation_name }
      : null,
    officeLocation: backendUser.office_location,
    bankAccountNumber: backendUser.bank_account_number,
    bankIfscCode: backendUser.bank_ifsc_code,
    panNumber: backendUser.pan_number,
    aadharNumber: backendUser.aadhar_number,
    uanNumber: backendUser.uan_number,
    isStaff: backendUser.is_staff,
  };
};
