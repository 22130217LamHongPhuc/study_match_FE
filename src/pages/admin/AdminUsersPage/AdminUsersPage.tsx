import { useMemo, useState } from "react";
import { adminUsersMockData } from "./mockUsers";
import { AdminUsersTable } from "./components/AdminUsersTable";
import { UsersStatsGrid } from "./components/UsersStatsGrid";
import { UsersToolbar } from "./components/UsersToolbar";
import { ADMIN_USER_PAGE_SIZE, DEFAULT_USER_FILTERS } from "./types";

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(DEFAULT_USER_FILTERS.status);
  const [roleFilter, setRoleFilter] = useState(DEFAULT_USER_FILTERS.role);
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return adminUsersMockData.filter((user) => {
      const matchedStatus =
        statusFilter === "all" ? true : user.status === statusFilter;
      const matchedRole =
        roleFilter === "all" ? true : user.role === roleFilter;
      const matchedQuery =
        search.length === 0
          ? true
          : user.email.toLowerCase().includes(search) ||
            (user.full_name || "").toLowerCase().includes(search) ||
            String(user.user_id).includes(search) ||
            user.role.toLowerCase().includes(search);

      return matchedStatus && matchedRole && matchedQuery;
    });
  }, [query, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ADMIN_USER_PAGE_SIZE);
  const currentPage = Math.min(page, totalPages === 0 ? 1 : totalPages);
  const start = (currentPage - 1) * ADMIN_USER_PAGE_SIZE;
  const pagedUsers = filteredUsers.slice(start, start + ADMIN_USER_PAGE_SIZE);

  const statSummary = useMemo(() => {
    const totalUsers = adminUsersMockData.length;
    const activeUsers = adminUsersMockData.filter(
      (user) => user.status === "active",
    ).length;
    const verifiedUsers = adminUsersMockData.filter(
      (user) => user.email_verified,
    ).length;
    const onboardedUsers = adminUsersMockData.filter(
      (user) => user.is_onboarding_completed,
    ).length;
    const suspendedUsers = adminUsersMockData.filter(
      (user) => user.status === "suspended",
    ).length;

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      onboardedUsers,
      suspendedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      onboardingPendingUsers: totalUsers - onboardedUsers,
    };
  }, []);

  return (
    <main className="space-y-6">
      <UsersToolbar
        query={query}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onRoleChange={(value) => {
          setRoleFilter(value);
          setPage(1);
        }}
      />

      <UsersStatsGrid summary={statSummary} />

      <AdminUsersTable
        users={pagedUsers}
        page={currentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        pageSize={ADMIN_USER_PAGE_SIZE}
        onPageChange={setPage}
      />
    </main>
  );
}
