import { Star } from "lucide-react";

export function RatingView({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={
            i < rating
              ? "fill-blue-400 text-blue-400"
              : "fill-sand-200 text-sand-200"
          }
        />
      ))}
    </div>
  );
}
