import { FormData } from "./types";
import { LEARNING_LEVELS } from "./constants";

interface Step3GoalProps {
  data: FormData;
  update: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function Step3Goal({ data, update }: Step3GoalProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-1">
        Chọn trình độ học tập phù hợp nhất với bạn hiện tại. Điều này quyết định
        cách hệ thống ghép bạn học.
      </p>
      {LEARNING_LEVELS.map((g) => {
        const active = data.studyGoal === g.key;
        return (
          <button
            key={g.key}
            onClick={() => update("studyGoal", g.key)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 bg-white ${
              active
                ? "border-accent"
                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-700">
                    {g.title}
                  </span>
                  {active && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-accent text-accent">
                      Đã chọn
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                  {g.desc}
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  active ? "border-accent" : "border-gray-200"
                }`}
              >
                {active && (
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
