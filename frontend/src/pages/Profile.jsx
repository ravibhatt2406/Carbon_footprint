import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { getBadgeIconColor } from '../utils/constants';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { Award, Calendar, History, Lock } from 'lucide-react';

/**
 * Profile page showing user info, badges/achievements, and calculation history.
 * Uses the useProfile hook for data fetching and constants for badge styling.
 * @returns {JSX.Element} The profile page
 */
export default function Profile() {
  const { user } = useAuth();
  const { badges, history, loading, error } = useProfile();

  if (loading) {
    return <LoadingSpinner message="Loading profile parameters..." />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      
      {/* Profile Header */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6" aria-labelledby="profile-heading">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-tr from-eco-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white uppercase shadow-md shadow-eco-500/10" aria-hidden="true">
            {user?.displayName?.[0] || 'U'}
          </div>
          <div>
            <h1 id="profile-heading" className="text-2xl font-black text-slate-800 tracking-tight">{user?.displayName}</h1>
            <p className="text-xs font-semibold text-slate-400 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eco Achievements</p>
            <p className="text-2xl font-black text-eco-700 mt-1">
              {badges.filter(b => b.unlocked).length} <span className="text-sm font-medium text-slate-400">badges</span>
            </p>
          </div>
          <div className="ml-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience Score</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">
              {user?.points || 0} <span className="text-sm font-medium text-slate-400">PTS</span>
            </p>
          </div>
        </div>
      </section>

      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BADGES & ACHIEVEMENTS PANEL */}
        <section className="lg:col-span-1 space-y-4" aria-labelledby="badges-heading">
          <h2 id="badges-heading" className="text-base font-extrabold text-slate-700">Unlocked Achievements</h2>
          <div className="grid grid-cols-1 gap-4" role="list" aria-label="Achievement badges">
            {badges.map((badge) => (
              <article
                key={badge.badgeType}
                role="listitem"
                className={`bg-white rounded-3xl p-5 border shadow-sm flex items-start space-x-4 transition-all ${
                  badge.unlocked ? 'border-slate-100' : 'border-slate-100/60 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-2xl shrink-0 ${getBadgeIconColor(badge.badgeType, badge.unlocked)}`}>
                  {badge.unlocked ? <Award className="h-6 w-6" aria-hidden="true" /> : <Lock className="h-6 w-6" aria-hidden="true" />}
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-extrabold text-sm text-slate-800 truncate">{badge.title}</h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{badge.description}</p>
                  {badge.unlocked && badge.unlockedAt && (
                    <span className="inline-block text-[9px] font-bold text-eco-600 bg-eco-50 px-2 py-0.5 rounded-md mt-1">
                      Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                  {!badge.unlocked && (
                    <span className="sr-only">Locked - not yet earned</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CARBON HISTORY LIST PANEL */}
        <section className="lg:col-span-2 space-y-4" aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-base font-extrabold text-slate-700 flex items-center space-x-2">
            <History className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <span>Calculation Logs History</span>
          </h2>

          {history.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100" role="list" aria-label="Carbon calculation history">
                {history.map((log) => (
                  <article key={log.id} role="listitem" className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-extrabold text-slate-800">
                          {log.total} kg CO₂
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                          <time dateTime={log.date}>
                            {new Date(log.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </time>
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        Car: {log.inputs.carKm}km/wk • Energy: {log.inputs.electricityKwh}kWh • Diet: {log.inputs.foodHabit}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold text-slate-500 shrink-0" aria-label="Breakdown">
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p><span aria-hidden="true">🚗</span> {log.breakdown.transportation}k</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p><span aria-hidden="true">⚡</span> {log.breakdown.electricity}k</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p><span aria-hidden="true">🥗</span> {log.breakdown.food}k</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p><span aria-hidden="true">🛍️</span> {log.breakdown.shopping}k</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-sm font-semibold text-slate-400">
              No historical log calculations found. Compute your footprint first!
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
