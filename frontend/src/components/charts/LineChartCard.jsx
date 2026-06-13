import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

/**
 * Memoized line chart card displaying carbon footprint trends over time.
 * Prevents unnecessary re-renders when parent Dashboard state changes.
 * @param {Object} props
 * @param {Array<{name: string, CO2: number}>} props.data - Line chart data points
 * @returns {JSX.Element} The line chart section
 */
const LineChartCard = React.memo(function LineChartCard({ data }) {
  /** Stable tooltip formatter to avoid re-creating on each render */
  const tooltipFormatter = useMemo(() => (value) => [`${value} kg CO₂`, 'Total Footprint'], []);

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between" aria-labelledby="line-chart-heading">
      <h2 id="line-chart-heading" className="text-base font-extrabold text-slate-800 mb-6">Carbon Monthly Trend</h2>
      <div className="h-72 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
              <Tooltip formatter={tooltipFormatter} />
              <Line
                type="monotone"
                dataKey="CO2"
                stroke="#10b981"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400 text-sm font-semibold">Need more log entries to map trends</p>
          </div>
        )}
      </div>
    </section>
  );
});

export default LineChartCard;
