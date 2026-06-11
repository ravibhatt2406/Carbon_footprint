import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import {
  Leaf,
  Activity,
  Zap,
  TrendingDown,
  Sparkles,
  ArrowRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load summary metrics
        const summaryData = await api.get('/footprint-logs/summary');
        setSummary(summaryData);

        // Load historical logs
        const historyLogs = await api.get('/footprint-logs/history');
        setHistory(historyLogs);

        // Load goals list and identify the latest active goal
        const goals = await api.get('/goals');
        const active = goals.find(g => !g.completed) || null;
        setActiveGoal(active);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        setError('Could not retrieve dashboard statistics. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-500 border-t-transparent"></div>
        <p className="text-slate-400 font-semibold">Generating dashboard statistics...</p>
      </div>
    );
  }

  // Pre-process charts data
  const latestFootprint = summary?.current || null;
  const pieData = latestFootprint
    ? [
        { name: 'Transportation', value: latestFootprint.breakdown.transportation },
        { name: 'Electricity', value: latestFootprint.breakdown.electricity },
        { name: 'Diet & Food', value: latestFootprint.breakdown.food },
        { name: 'Shopping Habits', value: latestFootprint.breakdown.shopping }
      ].filter(item => item.value > 0)
    : [];

  const lineData = history
    .map(log => ({
      name: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      CO2: log.total
    }))
    .reverse(); // Chronological order (oldest to newest)

  const PIE_COLORS = ['#3b82f6', '#eab308', '#10b981', '#a855f7'];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Hello, {user?.displayName || 'Eco-Warrior'}!
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Here is your current environmental impact snapshot.
          </p>
        </div>
        <Link
          to="/calculator"
          className="inline-flex items-center space-x-2 bg-eco-600 hover:bg-eco-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-eco-600/10 self-start"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Calculation</span>
        </Link>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold p-4 rounded-2xl flex items-center space-x-3">
          <HelpCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Carbon Footprint"
          value={latestFootprint?.total}
          unit="kg CO₂"
          icon={Leaf}
          trend={summary?.difference < 0 ? 'down' : summary?.difference > 0 ? 'up' : 'neutral'}
          trendValue={summary?.percentageChange}
          colorClass="bg-eco-50 text-eco-600"
        />

        <StatCard
          title="Last Recorded Value"
          value={summary?.previous?.total}
          unit="kg CO₂"
          icon={Activity}
          colorClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Total Eco Score"
          value={user?.points || 0}
          unit="Points"
          icon={Zap}
          colorClass="bg-yellow-50 text-yellow-600"
        />
      </div>

      {latestFootprint ? (
        <>
          {/* Charts panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart: Carbon Sources */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <h3 className="text-base font-extrabold text-slate-800 mb-6">Carbon Footprint Sources</h3>
              <div className="h-72 w-full flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} kg CO₂`} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm font-semibold">Insufficient breakdown data</p>
                )}
              </div>
            </div>

            {/* Line Chart: History Log */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <h3 className="text-base font-extrabold text-slate-800 mb-6">Carbon Monthly Trend</h3>
              <div className="h-72 w-full">
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Total Footprint']} />
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Goals card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">Monthly Targets</h3>
                <p className="text-slate-400 text-xs font-semibold mt-1">Your current target challenge</p>
              </div>

              {activeGoal ? (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Target Target</span>
                    <span>Reduce {activeGoal.targetValue} kg CO₂</span>
                  </div>
                  <ProgressBar value={activeGoal.currentProgress} max={activeGoal.targetValue} />
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Target End Date: {new Date(activeGoal.endDate).toLocaleDateString()}
                  </p>
                  <Link
                    to="/goals"
                    className="inline-flex items-center text-xs font-bold text-eco-600 hover:text-eco-700 group pt-2"
                  >
                    <span>Update Goal Progress</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <TrendingDown className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">No active goals running</p>
                  <Link
                    to="/goals"
                    className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Set a Target
                  </Link>
                </div>
              )}
            </div>

            {/* AI Advisor Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-extrabold text-slate-800">Gemini Carbon Advisor</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="text-slate-600 text-sm leading-relaxed prose prose-slate max-w-none max-h-72 overflow-y-auto pr-2">
                {latestFootprint.advice ? (
                  latestFootprint.advice.split('\n').map((line, i) => {
                    if (line.startsWith('###')) {
                      return <h4 key={i} className="text-sm font-extrabold text-slate-800 mt-4 mb-2">{line.replace(/###/g, '').trim()}</h4>;
                    }
                    if (line.startsWith('####')) {
                      return <h5 key={i} className="text-xs font-extrabold text-slate-800 mt-3 mb-1">{line.replace(/####/g, '').trim()}</h5>;
                    }
                    if (line.startsWith('-') || line.startsWith('*')) {
                      return <li key={i} className="ml-4 list-disc text-xs my-1">{line.substring(2)}</li>;
                    }
                    return <p key={i} className="my-1.5 text-xs">{line}</p>;
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No recommendations loaded</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center space-y-4 max-w-lg mx-auto mt-12">
          <Leaf className="h-14 w-14 text-eco-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800">Calculate Your First Carbon Footprint</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Welcome to EcoLens AI! To load your dashboard and charts, you need to input your habits (driving, home energy, food, shopping) into our footprint calculator.
          </p>
          <Link
            to="/calculator"
            className="inline-block bg-eco-600 hover:bg-eco-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md shadow-eco-600/10"
          >
            Start Calculator Form
          </Link>
        </div>
      )}
    </div>
  );
}
