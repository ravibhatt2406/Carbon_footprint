import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, QrCode, LineChart, ArrowRight } from 'lucide-react';

/**
 * Public landing page showcasing EcoLens AI features.
 * @returns {JSX.Element} The landing page
 */
export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between z-10" role="banner">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-eco-500 rounded-lg">
            <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">EcoLens AI</span>
        </div>
        <nav aria-label="Landing page navigation" className="flex items-center space-x-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-eco-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-eco-700 transition-colors shadow-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 font-semibold hover:text-eco-600 transition-colors">
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-eco-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-eco-700 transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2 flex flex-col space-y-6 text-left">
          <span className="inline-block self-start text-xs font-bold uppercase tracking-widest text-eco-700 bg-eco-100 px-3 py-1 rounded-full">
            EcoLens AI – Carbon Tracker & AI Advisor
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight">
            Track, Reduce, and <span className="text-eco-600">Neutralize</span> Your Carbon Footprint.
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg">
            Understand your impact, complete gamified challenges, set emission targets, and get intelligent AI advice on reducing your carbon footprint using Google Gemini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-eco-600 hover:bg-eco-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-eco-600/20"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-eco-600 hover:bg-eco-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-eco-600/20"
                >
                  <span>Start Free Tracker</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-8 py-4 rounded-2xl flex items-center justify-center transition-all"
                >
                  <span>Explore Login</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Visual / Image Section */}
        <div className="md:w-1/2 relative flex items-center justify-center" aria-hidden="true">
          <div className="absolute -inset-4 bg-eco-200/40 rounded-full blur-3xl -z-10 animate-pulse-soft"></div>
          <div className="bg-gradient-to-br from-eco-50 to-emerald-100/40 border border-eco-100 p-8 rounded-3xl shadow-xl max-w-md w-full relative">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">Calculated Sample</h4>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p className="text-5xl font-black text-slate-800">425.4</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">kg CO₂ Monthly Carbon Footprint</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mb-1">
                ↓ 12% drop
              </span>
            </div>
            
            <div className="mt-8 space-y-3.5">
              <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-100 pb-2">
                <span className="text-slate-500">🚗 Transportation</span>
                <span className="text-slate-800">116.9 kg CO₂</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-100 pb-2">
                <span className="text-slate-500">⚡ Electricity</span>
                <span className="text-slate-800">140.0 kg CO₂</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold border-b border-slate-100 pb-2">
                <span className="text-slate-500">🥗 Food Diet</span>
                <span className="text-slate-800">150.0 kg CO₂</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold pb-1">
                <span className="text-slate-500">🛍️ Shopping Habits</span>
                <span className="text-slate-800">18.5 kg CO₂</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-white border-t border-slate-100 py-20 px-6" aria-labelledby="features-heading">
        <div className="max-w-7xl w-full mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 id="features-heading" className="text-3xl font-extrabold text-slate-800 tracking-tight">Features Packed for Practical Impact</h2>
            <p className="text-slate-500 font-medium">Simple trackers, advanced intelligence. Designed for students, households, and green enthusiasts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list" aria-label="Key features">
            <article className="p-8 rounded-3xl bg-slate-50 border border-slate-100/60 space-y-4" role="listitem">
              <div className="p-3 bg-eco-500 text-white rounded-2xl w-fit">
                <Leaf className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Footprint Calculator</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Input your driving, public transit, home energy, and shopping habits to view a detailed breakdown of carbon emissions.</p>
            </article>

            <article className="p-8 rounded-3xl bg-slate-50 border border-slate-100/60 space-y-4" role="listitem">
              <div className="p-3 bg-indigo-500 text-white rounded-2xl w-fit">
                <LineChart className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">AI Carbon Advisor</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Integrated Google Gemini AI processes your results to generate customized reduction tips, numbers, and challenges.</p>
            </article>

            <article className="p-8 rounded-3xl bg-slate-50 border border-slate-100/60 space-y-4" role="listitem">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl w-fit">
                <QrCode className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Bill & Receipt OCR</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Upload shopping receipts or electric utility invoices. Gemini Vision parses items or kWh numbers to calculate direct emissions.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-850 mt-auto text-center text-sm font-medium" role="contentinfo">
        <p>© 2026 EcoLens AI. Dedicated to a greener, carbon-neutral tomorrow.</p>
      </footer>
    </div>
  );
}
