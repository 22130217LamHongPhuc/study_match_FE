export default function BottomActionBar({
  onCancel,
  onCreate,
}: {
  onCancel?: () => void;
  onCreate?: () => void;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Hủy
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 active:scale-[0.98]"
        >
          Tạo nhóm
        </button>
      </div>
    </footer>
  );
}
