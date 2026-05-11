import React from "react";
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
  MoreHorizontal,
  TrendingUp,
  UserCheck,
  UsersRound,
  Sparkles,
  AlertCircle,
  Menu,
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

function Sidebar() {
  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r border-gray-200 bg-gray-50 lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 bg-white/50 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white">
          <GraduationCap size={16} />
        </div>

        <span className="text-sm font-bold tracking-tight text-gray-900">
          StudyMatch Admin
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
                }`
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
              isActive
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-900"
            }`
          }
        >
          <Settings size={16} />
          <span>Cài đặt hệ thống</span>
        </NavLink>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <button className="text-gray-500 lg:hidden">
          <Menu size={18} />
        </button>
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            className="h-8 w-64 rounded border border-gray-300 bg-gray-50 pl-9 pr-3 text-[12px] outline-none focus:border-blue-500 focus:bg-white"
            placeholder="Tìm mã sinh viên, tên nhóm..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600">
          <Bell size={18} />
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="h-7 w-7 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white">
            TC
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] font-bold text-gray-700 leading-none">
              Thầy Chùa
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">
              Root Admin
            </p>
          </div>
          <ChevronDown
            size={12}
            className="text-gray-400 group-hover:text-gray-600"
          />
        </div>
      </div>
    </header>
  );
}

export default function StudyMatchAdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100/30 font-sans text-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
