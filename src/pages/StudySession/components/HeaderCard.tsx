import { CalendarDays } from "lucide-react";

interface HeaderCardProps {
  onCreateClick: () => void;
}

export function HeaderCard({ onCreateClick }: HeaderCardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Lịch học</h1>
            <p className="text-sm text-gray-500">
              Quản lý lịch học cá nhân, 1-1 và nhóm của bạn
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          + Tạo lịch
        </button>
      </div>
    </section>
  );
}
