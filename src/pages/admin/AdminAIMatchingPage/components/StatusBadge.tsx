import type { MatchingActionStatus } from "../types";
import { actionStatusLabel, actionStatusStyle } from "../utils";

export function StatusBadge({ status }: { status: MatchingActionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${actionStatusStyle[status]}`}
    >
      {actionStatusLabel[status]}
    </span>
  );
}
