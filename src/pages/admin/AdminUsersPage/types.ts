export type AdminUserRole = "student" | "admin";
export type AdminUserStatus = "ACTIVE" | "LOCKED" | "DELETED" | "PENDING";

export interface AdminUserDbRow {
  user_id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "admin";
  status: AdminUserStatus;
  is_onboarding_completed: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  bio: string | null;
}

export const ADMIN_USER_PAGE_SIZE = 10;

export const DEFAULT_USER_FILTERS = {
  status: null as AdminUserStatus | null,
  role: null as AdminUserRole | null,
};
