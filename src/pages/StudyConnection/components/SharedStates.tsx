import { BookOpen } from "lucide-react";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500" />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  imageUrl,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  imageUrl?: string;
}) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
      <div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="mx-auto mb-4 w-96 h-auto object-contain"
          />
        ) : (
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <BookOpen size={20} className="text-orange-400" />
          </div>
        )}

        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>

        <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 h-9 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
