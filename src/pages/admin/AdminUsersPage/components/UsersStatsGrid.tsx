import {
  CircleUserRound,
  MailCheck,
  PlayCircle,
  ShieldAlert,
} from "lucide-react";
import { UserStatCard } from "./UserStatCard";

type UsersSummary = {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  onboardedUsers: number;
  suspendedUsers: number;
  unverifiedUsers: number;
  onboardingPendingUsers: number;
};

export function UsersStatsGrid({ summary }: { summary: UsersSummary }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UserStatCard
        title="Tổng tài khoản"
        value={summary.totalUsers}
        caption=""
        icon={CircleUserRound}
        iconClassName="text-sand-600"
      />

      <UserStatCard
        title="Đang hoạt động"
        value={summary.activeUsers}
        caption=""
        icon={PlayCircle}
        iconClassName="text-sage-600"
      />

      <UserStatCard
        title="Đã xác thực email"
        value={summary.verifiedUsers}
        caption=""
        icon={MailCheck}
        iconClassName="text-accent-600"
      />

      <UserStatCard
        title="Tạm khóa"
        value={summary.suspendedUsers}
        caption=""
        icon={ShieldAlert}
        iconClassName="text-rose-500"
      />
    </div>
  );
}
