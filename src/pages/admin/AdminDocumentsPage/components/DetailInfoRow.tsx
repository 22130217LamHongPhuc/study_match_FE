import React from "react";

interface DetailInfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export default function DetailInfoRow({ icon, label, value }: DetailInfoRowProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-lg border border-gray-100 bg-white p-3.5 shadow-sm font-sans">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <div className="text-xs font-semibold text-slate-700 truncate">{value}</div>
      </div>
    </div>
  );
}
