import React from 'react';
import { useGoals } from '../hooks/useGoals';
import { GOAL_PERIOD_OPTIONS } from '../utils/constants';
import ProgressBar from '../components/ProgressBar';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { Target, Calendar, PlusCircle, CheckCircle, HelpCircle } from 'lucide-react';

/**
 * Goals page for creating and tracking carbon reduction targets.
 * Uses the useGoals hook for all state management and API operations.
 * @returns {JSX.Element} The goals page
 */
export default function Goals() {
  const {
    goals, loading, error,
    targetValue, setTargetValue,
    days, setDays,
    submitting,
    updateVal, setUpdateVal,
    activeGoals, completedGoals,
    handleCreateGoal, handleUpdateProgress,
  } = useGoals();

  if (loading && goals.length === 0) {
    return <LoadingSpinner message="Loading your carbon reduction goals..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Carbon Reduction Goals</h1>
        <p className="text-slate-500 font-medium mt-1">Set monthly carbon footprint targets and log actions taken to achieve them.</p>
      </div>

      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CREATE GOAL PANEL */}
        <section className="lg:col-span-1" aria-labelledby="create-goal-heading">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5 sticky top-6">
            <h2 id="create-goal-heading" className="text-base font-extrabold text-slate-800 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-eco-500" aria-hidden="true" />
              <span>Set Carbon Target</span>
            </h2>

            <form onSubmit={handleCreateGoal} className="space-y-4" noValidate>
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="goal-target-value" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Reduction Target (kg CO₂)</label>
                <input
                  id="goal-target-value"
                  name="targetValue"
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
                <label htmlFor="goal-target-period" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Period</label>
                <select
                  id="goal-target-period"
                  name="days"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-eco-500 bg-white"
                >
                  {GOAL_PERIOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
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
        </section>

        {/* GOALS TRACKING PANEL */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Goals Section */}
          <section className="space-y-4" aria-labelledby="active-goals-heading">
            <h2 id="active-goals-heading" className="text-base font-extrabold text-slate-700">Active Goals</h2>
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {activeGoals.map((goal) => (
                  <article key={goal.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-eco-50 text-eco-600 rounded-xl">
                          <Target className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-800">Reduce {goal.targetValue} kg CO₂</h3>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
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
                      <label htmlFor={`progress-${goal.id}`} className="sr-only">Log reduction in kg for goal: Reduce {goal.targetValue} kg CO₂</label>
                      <input
                        id={`progress-${goal.id}`}
                        type="number"
                        min="0"
                        name="currentProgress"
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
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-sm font-semibold text-slate-400">
                You have no active targets set. Create one using the form on the left!
              </div>
            )}
          </section>

          {/* Completed Goals Section */}
          <section className="space-y-4" aria-labelledby="completed-goals-heading">
            <h2 id="completed-goals-heading" className="text-base font-extrabold text-slate-700">Completed Goals</h2>
            {completedGoals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {completedGoals.map((goal) => (
                  <article key={goal.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <CheckCircle className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800 line-through">Reduce {goal.targetValue} kg CO₂</h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Achieved on {new Date(goal.updatedAt || goal.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                      Success
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-sm font-semibold text-slate-400">
                Completed targets will show up here.
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}
