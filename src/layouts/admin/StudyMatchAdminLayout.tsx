import React, { useState } from "react";
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
  {
    label: "Hồ sơ học tập",
    icon: GraduationCap,
    path: "/admin/profiles",
  },
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
  {
    label: "Phản hồi",
    icon: MessageSquareWarning,
    path: "/admin/feedbacks",
  },
  {
    label: "Chat & Video",
    icon: Video,
    path: "/admin/communication",
  },
  {
    label: "Báo cáo",
    icon: BarChart3,
    path: "/admin/reports",
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="border-b border-sand-200 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sand-900 text-white">
            <GraduationCap size={16} />
          </div>

          <span className="text-sm font-semibold tracking-tight text-sand-900">
            StudyMatch Admin
          </span>
        </div>
        <p className="mt-2 text-[11px] font-medium text-sand-500">
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
                `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sand-200/70 text-sand-900"
                    : "text-sand-600 hover:bg-sand-100 hover:text-sand-800"
                }`
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sand-200 p-3">
        <NavLink
          to="/admin/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sand-200/70 text-sand-900"
                : "text-sand-500 hover:bg-sand-100 hover:text-sand-800"
            }`
          }
        >
          <Settings size={16} />
          <span>Cài đặt hệ thống</span>
        </NavLink>
      </div>
    </>
  );
}

function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-sand-200 bg-sand-100 lg:flex lg:flex-col">
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sand-100 transition-transform duration-200 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-sand-500 hover:bg-sand-200 hover:text-sand-700"
        >
          <X size={16} />
        </button>

        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-sand-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button className="text-sand-500 lg:hidden" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400"
            size={14}
          />
          <input
            className="h-9 w-64 rounded-lg border border-sand-300 bg-sand-50 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent-600 focus:bg-white focus:ring-1 focus:ring-accent-600/20"
            placeholder="Tìm sinh viên, nhóm học..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sand-400 hover:text-sand-600">
          <Bell size={18} />
        </button>
        <div className="h-4 w-px bg-sand-200" />
        <div className="group flex cursor-pointer items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-800 text-[10px] font-medium text-white">
            TC
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-none text-sand-800">
              Thầy Chùa
            </p>
            <p className="mt-1 text-[10px] uppercase text-sand-400">
              Root Admin
            </p>
          </div>
          <ChevronDown
            size={12}
            className="text-sand-400 group-hover:text-sand-600"
          />
        </div>
      </div>
    </header>
  );
}

export default function StudyMatchAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-sand-50 font-sans text-sand-900">
      <Sidebar />
      <MobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
