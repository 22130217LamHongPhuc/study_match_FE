import { useEffect, useState } from "react";
import { AdminUsersTable } from "./components/AdminUsersTable";
import { UsersToolbar } from "./components/UsersToolbar";
import {
  ADMIN_USER_PAGE_SIZE,
  DEFAULT_USER_FILTERS,
  type AdminUserDbRow,
  type AdminUserRole,
  type AdminUserStatus,
} from "./types";
import { getAdminUsers } from "../../../services/UserService";
import { AdminUserDetailModal } from "./components/AdminUserDetailModal";
import { InviteAdminModal } from "./components/InviteAdminModal";
import { EditUserModal } from "./components/EditUserModal";

function useDebounce<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 400);

  const [statusFilter, setStatusFilter] = useState<AdminUserStatus | null>(
    DEFAULT_USER_FILTERS.status,
  );

  const [roleFilter, setRoleFilter] = useState<AdminUserRole | null>(
    DEFAULT_USER_FILTERS.role,
  );

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUserDbRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openUserDetail, setOpenUserDetail] = useState<AdminUserDbRow | null>(
    null,
  );

  const [openEditUser, setOpenEditUser] = useState<AdminUserDbRow | null>(
    null,
  );

  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        setIsSuperAdmin(String(payload.role ?? "").toLowerCase() === "super_admin");
      } catch {
        setIsSuperAdmin(false);
      }
    }
  }, []);

  const handleStatusUpdated = (userId: number, status: AdminUserStatus) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === userId
          ? {
              ...user,
              status,
            }
          : user,
    ));
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, roleFilter]);

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAdminUsers(
          page - 1,
          ADMIN_USER_PAGE_SIZE,
          statusFilter,
          debouncedQuery,
          roleFilter,
        );

        if (!res.success || !res.data) {
          setUsers([]);
          setTotalPages(0);
          setTotalItems(0);
          setError(res.message || "Không thể tải danh sách người dùng");
          return;
        }

        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalItems(res.data.totalElements);
      } catch {
        setUsers([]);
        setTotalPages(0);
        setTotalItems(0);
        setError("Có lỗi xảy ra khi tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, [page, debouncedQuery, statusFilter, roleFilter, refreshTrigger]);

  const handleStatusChange = (value: AdminUserStatus | null) => {
    setStatusFilter(value);
  };

  const handleRoleChange = (value: AdminUserRole | null) => {
    setRoleFilter(value);
  };

  return (
    <main className="space-y-6">
      <UsersToolbar
        query={query}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        onQueryChange={setQuery}
        onStatusChange={handleStatusChange}
        onRoleChange={handleRoleChange}
        isSuperAdmin={isSuperAdmin}
        onInviteClick={() => setOpenInviteModal(true)}
      />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <AdminUsersTable
        users={users}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={ADMIN_USER_PAGE_SIZE}
        loading={loading}
        onPageChange={setPage}
        onStatusUpdated={handleStatusUpdated}
        onViewUser={(userId) => {
          const user = users.find((item) => item.user_id === userId) ?? null;
          setOpenUserDetail(user);
        }}
        onEditUser={(userId) => {
          const user = users.find((item) => item.user_id === userId) ?? null;
          setOpenEditUser(user);
        }}
      />

      <AdminUserDetailModal
        open={openUserDetail !== null}
        user={openUserDetail}
        onClose={() => setOpenUserDetail(null)}
      />

      <EditUserModal
        open={openEditUser !== null}
        user={openEditUser}
        onClose={() => setOpenEditUser(null)}
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      <InviteAdminModal
        open={openInviteModal}
        onClose={() => setOpenInviteModal(false)}
        onSuccess={() => {
          setPage(1);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </main>
  );
}

