import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpenCheck,
  CalendarDays,
  BrainCircuit,
  MessageSquareWarning,
  Video,
  Bell,
  BarChart3,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  User,
  KeyRound,
  FileClock,
} from "lucide-react";
import { EditAdminProfileModal } from "./EditAdminProfileModal";
import { ChangeAdminPasswordModal } from "./ChangeAdminPasswordModal";
import { NavLink, Outlet } from "react-router-dom";
import { loadFriendProfilesService } from "../../services/FriendService";
import logoImg from "../../assets/img/logo.png";
import { toast } from "react-toastify";
import WebSocketManager from "../../socket/WebSocketManager";

const menuItems = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/admin/overview",
  },
  {
    label: "Quản lý Chat",
    icon: MessageSquareWarning,
    path: "/admin/chat-manager",
  },
  {
    label: "Người dùng",
    icon: Users,
    path: "/admin/users",
  },
  // {
  //   label: "Hồ sơ học tập",
  //   icon: GraduationCap,
  //   path: "/admin/profiles",
  // },
  {
    label: "Nhóm học",
    icon: BookOpenCheck,
    path: "/admin/groups",
  },
  {
    label: "Lịch học",
    icon: CalendarDays,
    path: "/admin/schedules",
  },
  {
    label: "AI Matching",
    icon: BrainCircuit,
    path: "/admin/matching",
  },
  // {
  //   label: "Phản hồi",
  //   icon: MessageSquareWarning,
  //   path: "/admin/feedbacks",
  // },
  // {
  //   label: "Chat & Video",
  //   icon: Video,
  //   path: "/admin/communication",
  // },
  {
    label: "Báo cáo",
    icon: BarChart3,
    path: "/admin/reports",
  },
];

function SidebarContent({
  onNavigate,
  adminProfile,
  onLogout,
}: {
  onNavigate?: () => void;
  adminProfile: { fullName: string; avatarUrl?: string } | null;
  onLogout: () => void;
}) {
  const fullName = adminProfile?.fullName || "Admin";
  const avatarUrl = adminProfile?.avatarUrl;
  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <img
            src={logoImg}
            alt="StudyMatch Logo"
            className="w-8 h-8 rounded-full object-cover border border-blue-50 shadow-sm"
          />

          <span className="text-sm font-semibold tracking-tight text-slate-900">
            StudyMatch Admin
          </span>
        </div>
        <p className="mt-2 text-[11px] font-medium text-slate-500">
          Quản trị học tập thông minh
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                  ? "bg-blue-50 text-[#3b82f6]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        {isSuperAdmin && (
          <NavLink
            to="/admin/audit-logs"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                ? "bg-blue-50 text-[#3b82f6]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            <FileClock size={16} />
            <span>Nhật ký hệ thống</span>
          </NavLink>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800">{fullName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* <div className="border-t border-sand-200 p-3">
        <NavLink
          to="/admin/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
              ? "bg-sand-200/70 text-sand-900"
              : "text-sand-500 hover:bg-sand-100 hover:text-sand-800"
            }`
          }
        >
          <Settings size={16} />
          <span>Cài đặt hệ thống</span>
        </NavLink>
      </div> */}
    </>
  );
}

function Sidebar({ isSuperAdmin  adminProfile,
  onLogout}: { isSuperAdmin?: boolean }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-100 bg-slate-50/50 lg:flex lg:flex-col">
      <SidebarContent isSuperAdmin={isSuperAdmin} />
    </aside>
  );
}

function MobileDrawer({
  open,
  onClose,
  isSuperAdmin,
}: {
  open: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white transition-transform duration-200 ease-in-out lg:hidden ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>

        <SidebarContent
          onNavigate={onClose}
          adminProfile={adminProfile}
          onLogout={onLogout}
          isSuperAdmin={isSuperAdmin}
        />
      </aside>
    </>
  );
}

function Topbar({
  onMenuClick,
  adminProfile,
  onLogout,
  onEditProfile,
  onChangePassword,
}: {
  onMenuClick: () => void;
  adminProfile: { fullName: string; avatarUrl?: string } | null;
  onLogout: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fullName = adminProfile?.fullName || "Admin";
  const avatarUrl = adminProfile?.avatarUrl;

  const initials = fullName
    ? fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "AD";

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button className="text-slate-500 lg:hidden" onClick={onMenuClick}>
          <Menu size={18} />
        </button>

      </div>

      <div className="flex items-center gap-4 relative">

        <div className="h-4 w-px bg-slate-200" />
        <div
          className="group relative flex cursor-pointer items-center gap-2 select-none"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6] text-[10px] font-medium text-white shadow-sm">
              {initials}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-none text-slate-800">
              {fullName}
            </p>
            <p className="mt-1 text-[10px] uppercase text-slate-400">
              Root Admin
            </p>
          </div>
          <ChevronDown
            size={12}
            className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
              }`}
          />

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30 cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                }}
              />
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black/5 z-40"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onEditProfile();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User size={15} />
                  Hồ sơ cá nhân
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onChangePassword();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <KeyRound size={15} />
                  Đổi mật khẩu
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div />
    </header>
  );
}

function LockedOutModal({
  open,
  reason,
  onConfirm,
}: {
  open: boolean;
  reason: string;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Tài khoản bị khóa"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-100 bg-white p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <ShieldAlert size={28} />
        </div>

        <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900">
          Tài khoản đã bị khóa
        </h3>
        
        <p className="mt-2 text-sm text-slate-500">
          Phiên làm việc của bạn đã kết thúc vì tài khoản của bạn bị khóa hoặc ngừng hoạt động bởi Super Admin.
        </p>

        {reason && (
          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-left">
            <span className="text-xs font-semibold tracking-wider text-rose-500">Lý do từ hệ thống:</span>
            <p className="mt-1 text-sm font-medium text-slate-700">{reason}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-all shadow-md shadow-rose-600/10 focus:outline-none"
        >
          Xác nhận
        </button>
      </div>
    </div>,
    document.body
  );
}

export default function StudyMatchAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    fullName: string;
    avatarUrl?: string;
  } | null>(null);
  const [lockOutData, setLockOutData] = useState<{ isLocked: boolean; reason: string }>({
    isLocked: false,
    reason: "",
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  useEffect(() => {
    const currentUserId = Number(localStorage.getItem("userId"));
    if (Number.isFinite(currentUserId) && currentUserId > 0) {
      const savedName = localStorage.getItem("fullName");
      const savedAvatar = localStorage.getItem("avatarUrl");
      if (savedName) {
        setAdminProfile({
          fullName: savedName,
          avatarUrl: savedAvatar || undefined,
        });
      }

      loadFriendProfilesService([currentUserId])
        .then((profiles) => {
          const profile = profiles.find((p) => p.userId === currentUserId);
          if (profile) {
            setAdminProfile({
              fullName: profile.fullName || "Admin",
              avatarUrl: profile.avatarUrl || undefined,
            });
            if (profile.fullName) localStorage.setItem("fullName", profile.fullName);
            if (profile.avatarUrl) localStorage.setItem("avatarUrl", profile.avatarUrl);
          }
        })
        .catch((err) => {
          console.error("Failed to load admin profile", err);
        });
    }
  }, []);

  useEffect(() => {
    const ws = WebSocketManager.getInstance();
    let isMounted = true;

    ws.connect()
      .then(() => {
        if (!isMounted) return;

        ws.onMessage("/user/queue/chat", (msg: string) => {
          try {
            const parsed = JSON.parse(msg);
            if (parsed.event === "FORCE_LOGOUT") {
              const currentUserId = Number(localStorage.getItem("userId"));
              if (parsed.data && Number(parsed.data.userId) === currentUserId) {
                ws.disconnect();
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userId");
                localStorage.removeItem("fullName");
                localStorage.removeItem("avatarUrl");
                setLockOutData({
                  isLocked: true,
                  reason: parsed.data.reason || "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động bởi quản trị viên.",
                });
              }
            }
          } catch (err) {
            console.error("Failed to process force logout event", err);
          }
        });
      })
      .catch((err) => {
        console.warn("WebSocket connection failed in admin layout", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      try {
        WebSocketManager.getInstance().disconnect();
      } catch (err) {
        console.warn("WebSocket disconnect failed", err);
      }

      const { logout } = await import("../../services/AuthService");
      await logout();
    } catch (err) {
      console.warn("Logout api failed", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("fullName");
      localStorage.removeItem("avatarUrl");
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50/20 font-sans text-slate-900">
      <Sidebar isSuperAdmin={isSuperAdmin} />
      <MobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isSuperAdmin={isSuperAdmin}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          adminProfile={adminProfile}
          onLogout={handleLogout}
          onEditProfile={() => setProfileModalOpen(true)}
          onChangePassword={() => setPasswordModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <LockedOutModal
        open={lockOutData.isLocked}
        reason={lockOutData.reason}
        onConfirm={() => {
          window.location.href = "/admin/login";
        }}
      />

      <EditAdminProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSuccess={(fullName, avatarUrl) => {
          setAdminProfile({
            fullName,
            avatarUrl: avatarUrl || undefined,
          });
        }}
      />

      <ChangeAdminPasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
