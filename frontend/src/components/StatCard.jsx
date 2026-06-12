import React from 'react';

/**
 * Dashboard stat card component displaying a metric with optional trend.
 * @param {Object} props
 * @param {string} props.title - The metric title
 * @param {number|null} props.value - The metric value
 * @param {string} props.unit - The unit label (e.g., 'kg CO₂')
 * @param {React.ComponentType} [props.icon] - Lucide icon component
 * @param {'up'|'down'|'neutral'} [props.trend] - Trend direction
 * @param {number} [props.trendValue] - Percentage change value
 * @param {string} [props.colorClass] - Tailwind classes for icon background
 * @returns {JSX.Element} The stat card
 */
const StatCard = React.memo(function StatCard({ title, value, unit, icon: IconComponent, trend, trendValue, colorClass }) {
  const trendLabel = trend === 'down' ? 'decreased' : trend === 'up' ? 'increased' : 'unchanged';

  return (
    <article className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
            {value !== null && value !== undefined ? (
              <>
                {value} <span className="text-sm font-medium text-slate-400">{unit}</span>
              </>
            ) : (
              <span className="text-base text-slate-400 font-medium">No records</span>
            )}
          </h3>
        </div>
        {IconComponent && (
          <div className={`p-3 rounded-2xl ${colorClass || 'bg-eco-50 text-eco-600'}`}>
            <IconComponent className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </div>

      {trendValue !== undefined && trendValue !== null && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs">
          <span
            className={`font-bold px-2 py-0.5 rounded-full ${
              trend === 'down'
                ? 'text-emerald-700 bg-emerald-50'
                : trend === 'up'
                ? 'text-red-700 bg-red-50'
                : 'text-slate-600 bg-slate-50'
            }`}
            aria-label={`${trendLabel} by ${Math.abs(trendValue)} percent from last record`}
          >
            {trend === 'down' ? '↓' : trend === 'up' ? '↑' : ''} {Math.abs(trendValue)}%
          </span>
          <span className="text-slate-400 font-medium ml-2" aria-hidden="true">from last record</span>
        </div>
      )}
    </article>
  );
});

export default StatCard;
