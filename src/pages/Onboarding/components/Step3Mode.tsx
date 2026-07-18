import { FormData, StudyGoal, StudyMode } from "./types";
import { LEARNING_LEVELS, MODES, VALID_MODES } from "./constants";

interface Step3ModeProps {
  data: FormData;
  update: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function Step3Mode({ data, update }: Step3ModeProps) {
  const goalObj = LEARNING_LEVELS.find((g) => g.key === data.studyGoal);
  const availModes: StudyMode[] = data.studyGoal
    ? (VALID_MODES[data.studyGoal as StudyGoal] ?? [])
    : [];

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border border-accent text-accent bg-white">
        {goalObj?.title}
      </div>
      <p className="text-sm text-gray-500">
        Dựa trên trình độ của bạn, hãy chọn{" "}
        <strong>cách bạn muốn học cùng người khác</strong>:
      </p>
      <div className="space-y-3">
        {availModes.map((mKey) => {
          const m = MODES[mKey];
          const active = data.studyMode === mKey;
          return (
            <button
              key={mKey}
              onClick={() => update("studyMode", mKey)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 bg-white ${
                active
                  ? "border-accent"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-700">{m.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 ${
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
    </div>
  );
}
