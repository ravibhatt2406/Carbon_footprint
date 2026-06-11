import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Award, Calendar, History, ShieldAlert, Sparkles, User, HelpCircle, Lock } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true);
        const badgesData = await api.get('/badges');
        setBadges(badgesData);

        const historyData = await api.get('/footprint-logs/history');
        setHistory(historyData);
      } catch (err) {
        console.error('Failed to load profile details:', err);
        setError('Failed to fetch profile history logs. Verify backend connection.');
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-500 border-t-transparent"></div>
        <p className="text-slate-400 font-semibold">Loading profile parameters...</p>
      </div>
    );
  }

  // Helper to resolve badge coloring icons
  const getBadgeIconColor = (type, unlocked) => {
    if (!unlocked) return 'bg-slate-100 text-slate-400';
    switch (type) {
      case 'beginner': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'eco_explorer': return 'bg-yellow-100 text-yellow-750 border border-yellow-200';
      case 'green_warrior': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'carbon_hero': return 'bg-indigo-100 text-indigo-750 border border-indigo-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-tr from-eco-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white uppercase shadow-md shadow-eco-500/10">
            {user?.displayName?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user?.displayName}</h2>
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
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold p-4 rounded-2xl flex items-center space-x-2">
          <HelpCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BADGES & ACHIEVEMENTS PANEL */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-base font-extrabold text-slate-700">Unlocked Achievements</h3>
          <div className="grid grid-cols-1 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.badgeType}
                className={`bg-white rounded-3xl p-5 border shadow-sm flex items-start space-x-4 transition-all ${
                  badge.unlocked ? 'border-slate-100' : 'border-slate-100/60 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-2xl shrink-0 ${getBadgeIconColor(badge.badgeType, badge.unlocked)}`}>
                  {badge.unlocked ? <Award className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  <h4 className="font-extrabold text-sm text-slate-800 truncate">{badge.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{badge.description}</p>
                  {badge.unlocked && badge.unlockedAt && (
                    <span className="inline-block text-[9px] font-bold text-eco-600 bg-eco-50 px-2 py-0.5 rounded-md mt-1">
                      Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARBON HISTORY LIST PANEL */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-slate-700 flex items-center space-x-2">
            <History className="h-5 w-5 text-slate-500" />
            <span>Calculation Logs History</span>
          </h3>

          {history.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {history.map((log) => (
                  <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-extrabold text-slate-800">
                          {log.total} kg CO₂
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(log.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        Car: {log.inputs.carKm}km/wk • Energy: {log.inputs.electricityKwh}kWh • Diet: {log.inputs.foodHabit}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold text-slate-500 shrink-0">
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p>🚗 {log.breakdown.transportation}k</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p>⚡ {log.breakdown.electricity}k</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p>🥗 {log.breakdown.food}k</p>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                        <p>🛍️ {log.breakdown.shopping}k</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center text-sm font-semibold text-slate-400">
              No historical log calculations found. Compute your footprint first!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
