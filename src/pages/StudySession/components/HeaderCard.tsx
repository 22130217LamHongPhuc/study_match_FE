interface HeaderCardProps {
  onCreateClick: () => void;
}

export function HeaderCard({ onCreateClick }: HeaderCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch học</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý lịch học cá nhân, lịch học 1-1 và lịch học nhóm của bạn.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          + Tạo lịch
        </button>
      </div>
    </section>
  );
}
