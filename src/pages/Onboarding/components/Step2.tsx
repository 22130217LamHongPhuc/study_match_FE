import { useEffect, useState } from "react";
import { FormData } from "./types";
import { FieldLabel, Chip } from "./Shared";

interface Step2Props {
  data: FormData;
  update: (key: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function Step2({ data, update }: Step2Props) {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => res.json())
      .then((responseData: { name: string }[]) => {
        setCities(responseData.map((c) => c.name));
      });
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Giới tính</FieldLabel>
        <div className="flex gap-3">
          {(
            [
              ["M", "Nam"],
              ["F", "Nữ"],
            ] as const
          ).map(([val, lbl]) => (
            <Chip
              key={val}
              active={data.gender === val}
              onClick={() => update("gender", val)}
            >
              {lbl}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Nhóm tuổi</FieldLabel>
        <div className="flex gap-3">
          {(["0-35", "35-55", "55<="] as const).map((ag) => (
            <Chip
              key={ag}
              active={data.ageGroup === ag}
              onClick={() => update("ageGroup", ag)}
            >
              {ag}
            </Chip>
          ))}
        </div>
      </div>

      {cities.length > 0 ? (
        <div className="w-full max-w-md">
          <FieldLabel>Chọn quê quán</FieldLabel>
          <div className="relative mt-1">
            <select
              value={data.region || ""}
              onChange={(e) => update("region", e.target.value)}
              className="block w-full rounded-lg border-2 border-gray-200 bg-white py-2 px-3 pr-10 text-gray-800 text-sm truncate focus:outline-none focus:border-accent"
              title={data.region || ""}
            >
              <option value="" disabled>
                -- Chọn quên quán --
              </option>
              {cities.map((c) => (
                <option key={c} value={c} title={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Đang tải danh sách khu vực...</p>
      )}
    </div>
  );
}
