import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import { Target, Calendar, PlusCircle, CheckCircle, HelpCircle } from 'lucide-react';

export default function Goals() {
  const { refreshPoints } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New goal form state
  const [targetValue, setTargetValue] = useState('');
  const [days, setDays] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  // Update progress input states
  const [updateVal, setUpdateVal] = useState({});

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await api.get('/goals');
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
      setError('Could not fetch goals list. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!targetValue || Number(targetValue) <= 0) return;

    setSubmitting(true);
    setError('');

    try {
      const endDate = new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString();
      await api.post('/goals', { targetValue: Number(targetValue), endDate });
      setTargetValue('');
      await loadGoals();
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError('Failed to save goal. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goalId) => {
    const progressVal = Number(updateVal[goalId]);
    if (isNaN(progressVal) || progressVal < 0) return;

    try {
      await api.put(`/goals/${goalId}`, { currentProgress: progressVal });
      // Reset input field
      setUpdateVal(prev => ({ ...prev, [goalId]: '' }));
      await loadGoals();
      await refreshPoints(); // Sync badge achievements if a target completion triggers badge rewards
    } catch (err) {
      console.error('Failed to update progress:', err);
      setError('Failed to update goal progress.');
    }
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-500 border-t-transparent"></div>
        <p className="text-slate-400 font-semibold">Loading your carbon reduction goals...</p>
      </div>
    );
  }

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Carbon Reduction Goals</h2>
        <p className="text-slate-500 font-medium mt-1">Set monthly carbon footprint targets and log actions taken to achieve them.</p>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold p-4 rounded-2xl flex items-center space-x-2">
          <HelpCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CREATE GOAL PANEL */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5 sticky top-6">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-eco-500" />
              <span>Set Carbon Target</span>
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reduction Target (kg CO₂)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 20"
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-eco-500"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Period</label>
                <select
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-eco-500 bg-white"
                >
                  <option value="7">7 Days (Short Challenge)</option>
                  <option value="14">14 Days (Biweekly Goal)</option>
                  <option value="30">30 Days (Monthly Goal)</option>
                  <option value="90">90 Days (Quarterly Goal)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-eco-600 hover:bg-eco-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-75"
              >
                {submitting ? 'Creating...' : 'Launch Target Goal'}
              </button>
            </form>
          </div>
        </div>

        {/* GOALS TRACKING PANEL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Goals Section */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-700">Active Goals</h3>
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {activeGoals.map((goal) => (
                  <div key={goal.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-eco-50 text-eco-600 rounded-xl">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800">Reduce {goal.targetValue} kg CO₂</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Started {new Date(goal.startDate).toLocaleDateString()} • Ends {new Date(goal.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-eco-700 bg-eco-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    </div>

                    <ProgressBar value={goal.currentProgress} max={goal.targetValue} />

                    <div className="flex items-center space-x-3 pt-3 border-t border-slate-50">
                      <input
                        type="number"
                        min="0"
                        placeholder="Log reduction (kg)..."
                        value={updateVal[goal.id] || ''}
                        onChange={(e) => setUpdateVal(prev => ({ ...prev, [goal.id]: e.target.value }))}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-eco-500 w-full sm:max-w-[150px]"
                      />
                      <button
                        onClick={() => handleUpdateProgress(goal.id)}
                        className="bg-eco-600 hover:bg-eco-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
                      >
                        Update Progress
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-sm font-semibold text-slate-400">
                You have no active targets set. Create one using the form on the left!
              </div>
            )}
          </div>

          {/* Completed Goals Section */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-700">Completed Goals</h3>
            {completedGoals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 line-through">Reduce {goal.targetValue} kg CO₂</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Achieved on {new Date(goal.updatedAt || goal.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                      Success
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-sm font-semibold text-slate-400">
                Completed targets will show up here.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
