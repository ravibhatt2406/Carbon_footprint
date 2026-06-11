import React from 'react';

export default function ProgressBar({ value, max, heightClass = 'h-3' }) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
        <span>{percentage}% complete</span>
        <span>{value} / {max} kg CO₂</span>
      </div>
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="bg-eco-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
