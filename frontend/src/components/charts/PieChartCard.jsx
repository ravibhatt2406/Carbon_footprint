import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { PIE_COLORS } from '../../utils/constants';

/**
 * Memoized pie chart card displaying carbon footprint source breakdown.
 * Prevents unnecessary re-renders when parent Dashboard state changes.
 * @param {Object} props
 * @param {Array<{name: string, value: number}>} props.data - Pie chart data segments
 * @returns {JSX.Element} The pie chart section
 */
const PieChartCard = React.memo(function PieChartCard({ data }) {
  /** Stable tooltip formatter to avoid re-creating on each render */
  const tooltipFormatter = useMemo(() => (value) => `${value} kg CO₂`, []);

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between" aria-labelledby="pie-chart-heading">
      <h2 id="pie-chart-heading" className="text-base font-extrabold text-slate-800 mb-6">Carbon Footprint Sources</h2>
      <div className="h-72 w-full flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 text-sm font-semibold">Insufficient breakdown data</p>
        )}
      </div>
    </section>
  );
});

export default PieChartCard;
