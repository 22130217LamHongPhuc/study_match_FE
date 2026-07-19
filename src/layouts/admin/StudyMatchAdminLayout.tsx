import React, { useEffect, useState } from "react";
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
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { loadFriendProfilesService } from "../../services/FriendService";
import logoImg from "../../assets/img/logo.png";

const menuItems = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
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
      </nav>

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

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-100 bg-slate-50/50 lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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

        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}

function Topbar({
  onMenuClick,
  adminProfile,
  onLogout,
}: {
  onMenuClick: () => void;
  adminProfile: { fullName: string; avatarUrl?: string } | null;
  onLogout: () => void;
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
                className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black/5 z-40"
                onClick={(e) => e.stopPropagation()}
              >
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
    </header>
  );
}

export default function StudyMatchAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    fullName: string;
    avatarUrl?: string;
  } | null>(null);

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

  const handleLogout = async () => {
    try {
      try {
        const { default: WebSocketManager } = await import("../../socket/WebSocketManager");
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
      <Sidebar />
      <MobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          adminProfile={adminProfile}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
