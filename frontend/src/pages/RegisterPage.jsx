import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function RegisterPage() {
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setLoading(true);

    if (!email || !password || !displayName) {
      setValidationError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, displayName);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration action error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col space-y-6">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-2.5 bg-eco-500 rounded-2xl w-fit">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Get Started</h2>
          <p className="text-sm font-semibold text-slate-400">Join EcoLens AI and track carbon footprints</p>
        </div>

        {/* Display Errors */}
        {(validationError || authError) && (
          <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-100">
            {validationError || authError}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name / Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Green"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-eco-500 text-sm font-medium transition-colors"
            />
          </div>

          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-eco-500 text-sm font-medium transition-colors"
            />
          </div>

          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-eco-500 text-sm font-medium transition-colors"
            />
          </div>

          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-eco-500 text-sm font-medium transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-600 hover:bg-eco-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-eco-600/10 disabled:opacity-75 flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center text-xs font-medium text-slate-400 mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-eco-600 font-bold hover:underline">
            Log in here
          </Link>
        </div>

      </div>
    </div>
  );
}
