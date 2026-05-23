export type AdminUserRole = "all" | "student" | "admin";
export type AdminUserStatus = "all" | "active" | "inactive" | "suspended";

export interface AdminUserDbRow {
  user_id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "admin";
  status: "active" | "inactive" | "suspended";
  is_onboarding_completed: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  bio: string | null;
}

export const ADMIN_USER_PAGE_SIZE = 6;

export const DEFAULT_USER_FILTERS = {
  status: "all" as AdminUserStatus,
  role: "all" as AdminUserRole,
};
