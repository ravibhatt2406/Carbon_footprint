import React from 'react';

/**
 * Accessible progress bar component showing goal completion.
 * @param {Object} props
 * @param {number} props.value - Current progress value
 * @param {number} props.max - Maximum/target value
 * @param {string} [props.heightClass='h-3'] - Tailwind height class for the bar
 * @returns {JSX.Element} The progress bar
 */
const ProgressBar = React.memo(function ProgressBar({ value, max, heightClass = 'h-3' }) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
        <span>{percentage}% complete</span>
        <span>{value} / {max} kg CO₂</span>
      </div>
      <div
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${percentage}% complete: ${value} of ${max} kg CO₂ reduced`}
      >
        <div
          className="bg-eco-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

export default ProgressBar;
