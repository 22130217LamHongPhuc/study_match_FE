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
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { loadFriendProfilesService } from "../../services/FriendService";
import logoImg from "../../assets/img/logo.png";

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

function Sidebar({
  adminProfile,
  onLogout,
}: {
  adminProfile: { fullName: string; avatarUrl?: string } | null;
  onLogout: () => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-100 bg-slate-50/50 lg:flex lg:flex-col">
      <SidebarContent adminProfile={adminProfile} onLogout={onLogout} />
    </aside>
  );
}

function MobileDrawer({
  open,
  onClose,
  adminProfile,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  adminProfile: { fullName: string; avatarUrl?: string } | null;
  onLogout: () => void;
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
        />
      </aside>
    </>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button className="text-slate-500 lg:hidden" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
      </div>
      <div />
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
      <Sidebar adminProfile={adminProfile} onLogout={handleLogout} />
      <MobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminProfile={adminProfile}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
