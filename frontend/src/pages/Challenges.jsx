import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Award, Zap, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function Challenges() {
  const { user, refreshPoints } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingId, setCompletingId] = useState(null);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await api.get('/challenges');
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError('Could not fetch weekly challenges. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleComplete = async (challengeId) => {
    setCompletingId(challengeId);
    setError('');

    try {
      await api.post(`/challenges/${challengeId}/complete`);
      // Update local state
      setChallenges(prev =>
        prev.map(ch =>
          ch.id === challengeId ? { ...ch, completed: true } : ch
        )
      );
      // Update user points total in header
      await refreshPoints();
    } catch (err) {
      console.error('Failed to complete challenge:', err);
      setError('Error updating challenge completion. Please retry.');
    } finally {
      setCompletingId(null);
    }
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-eco-500 border-t-transparent"></div>
        <p className="text-slate-400 font-semibold">Loading weekly eco challenges...</p>
      </div>
    );
  }

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Weekly Eco Challenges</h2>
          <p className="text-slate-500 font-medium mt-1">Complete small actions to establish sustainable carbon habits and earn points.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center space-x-3 self-start">
          <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <div>
            <p className="text-xs font-semibold text-emerald-800">Your Eco Points</p>
            <p className="text-xl font-black text-emerald-900 leading-none mt-1">{user?.points || 0} PTS</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold p-4 rounded-2xl flex items-center space-x-2">
          <HelpCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Week Progress Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-slate-800">Weekly Challenge Completion</h4>
          <p className="text-slate-400 text-xs font-semibold">Complete 5 challenges in total to earn the "Eco Explorer" achievement badge.</p>
        </div>
        <div className="flex items-center space-x-4 shrink-0">
          <span className="text-xs font-bold text-slate-500">{completedCount} of 3 complete</span>
          <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-eco-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Challenges */}
      {challenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between min-h-[220px] transition-all duration-300 ${
                ch.completed ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                    +{ch.points} PTS
                  </span>
                  {ch.completed && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-0.5" /> Done
                    </span>
                  )}
                </div>
                
                <h4 className={`font-extrabold text-base text-slate-800 mt-4 ${ch.completed ? 'line-through text-slate-500' : ''}`}>
                  {ch.title}
                </h4>
                <p className={`text-slate-400 text-xs font-medium leading-relaxed mt-2 ${ch.completed ? 'text-slate-350' : ''}`}>
                  {ch.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-50">
                {ch.completed ? (
                  <button
                    disabled
                    className="w-full bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-not-allowed"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleComplete(ch.id)}
                    disabled={completingId === ch.id}
                    className="w-full bg-eco-600 hover:bg-eco-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center"
                  >
                    {completingId === ch.id ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Mark Completed'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center text-slate-400 font-semibold">
          No weekly challenges available. Try reloading the page.
        </div>
      )}
    </div>
  );
}
