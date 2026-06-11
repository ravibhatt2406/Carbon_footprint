import React, { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Zap,
  ShoppingBag,
  Utensils,
  Leaf,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function CarbonCalculator() {
  const { refreshPoints } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Form states
  const [carKm, setCarKm] = useState(0);
  const [bikeKm, setBikeKm] = useState(0);
  const [busKm, setBusKm] = useState(0);
  const [trainKm, setTrainKm] = useState(0);
  const [electricityKwh, setElectricityKwh] = useState(0);
  const [foodHabit, setFoodHabit] = useState('mixed');
  const [shoppingHabit, setShoppingHabit] = useState('moderate');

  const stepsList = [
    { id: 1, title: 'Transportation', icon: Car },
    { id: 2, title: 'Electricity', icon: Zap },
    { id: 3, title: 'Food & Diet', icon: Utensils },
    { id: 4, title: 'Shopping', icon: ShoppingBag }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      carKm: Number(carKm),
      bikeKm: Number(bikeKm),
      busKm: Number(busKm),
      trainKm: Number(trainKm),
      electricityKwh: Number(electricityKwh),
      foodHabit,
      shoppingHabit
    };

    try {
      const response = await api.post('/footprint-logs', payload);
      setResult(response);
      await refreshPoints(); // Reload user points in header if a new badge was awarded
    } catch (err) {
      console.error('Submit footprint calculation error:', err);
      setError('Failed to compute carbon values. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStep(1);
    setCarKm(0);
    setBikeKm(0);
    setBusKm(0);
    setTrainKm(0);
    setElectricityKwh(0);
    setFoodHabit('mixed');
    setShoppingHabit('moderate');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Carbon Calculator</h2>
        <p className="text-slate-500 font-medium mt-1">Estimate your carbon impact by answering simple lifestyle questions.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-100 flex items-center space-x-2">
          <HelpCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!result ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Steps Side Navigator */}
          <div className="md:col-span-1 border-r border-slate-100 md:pr-6 space-y-4">
            {stepsList.map((s) => {
              const StepIcon = s.icon;
              const isCurrent = step === s.id;
              const isPassed = step > s.id;

              return (
                <div
                  key={s.id}
                  className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-eco-500 text-white font-bold'
                      : isPassed
                      ? 'text-eco-600 font-semibold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  <StepIcon className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{s.title}</span>
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="md:col-span-3 flex flex-col justify-between min-h-[300px]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: TRANSPORTATION */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-800">Weekly Commuting Distances</h3>
                  <p className="text-xs text-slate-400">Estimate how many kilometers you travel per week.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Car (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={carKm}
                        onChange={(e) => setCarKm(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bicycle (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={bikeKm}
                        onChange={(e) => setBikeKm(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bus (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={busKm}
                        onChange={(e) => setBusKm(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Train (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={trainKm}
                        onChange={(e) => setTrainKm(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ELECTRICITY */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-800">Home Electricity Usage</h3>
                  <p className="text-xs text-slate-400">Enter your average monthly electrical consumption in kWh.</p>
                  
                  <div className="flex flex-col space-y-1 max-w-sm">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Energy (kWh)</label>
                    <input
                      type="number"
                      min="0"
                      value={electricityKwh}
                      onChange={(e) => setElectricityKwh(e.target.value)}
                      placeholder="e.g. 250"
                      className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: FOOD HABITS */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-800">Dietary Choices</h3>
                  <p className="text-xs text-slate-400">Select the option that matches your weekly food habits best.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'vegetarian', title: 'Vegetarian', desc: 'No meat, plant and dairy products.' },
                      { id: 'mixed', title: 'Mixed Diet', desc: 'Poultry, fish, vegetables, occasional beef.' },
                      { id: 'non-vegetarian', title: 'Non-Vegetarian', desc: 'Frequent red meat, poultry, dairy.' }
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setFoodHabit(item.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          foodHabit === item.id
                            ? 'bg-eco-50 border-eco-500 ring-2 ring-eco-500/20'
                            : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-slate-800">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: SHOPPING HABITS */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-800">Shopping Consumer Habits</h3>
                  <p className="text-xs text-slate-400">Select your purchasing level for clothing, goods, and electronics.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'low', title: 'Minimal / Low', desc: 'Minimal clothing, gadgets, mostly second-hand.' },
                      { id: 'moderate', title: 'Moderate / Average', desc: 'Occasional purchases of new clothing and goods.' },
                      { id: 'high', title: 'Frequent / High', desc: 'Frequent purchases of new items, electronics, clothing.' }
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setShoppingHabit(item.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                          shoppingHabit === item.id
                            ? 'bg-eco-50 border-eco-500 ring-2 ring-eco-500/20'
                            : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-slate-800">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-6 mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1 || loading}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 font-bold text-xs text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center space-x-1.5 bg-eco-600 hover:bg-eco-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-eco-600/10"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 disabled:opacity-75"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit Details</span>
                      <Leaf className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* RESULTS INTERFACE */
        <div className="space-y-8 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-6 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Result Computed
                </span>
                <h3 className="text-4xl font-black text-slate-800 mt-2">
                  {result.total} <span className="text-lg font-medium text-slate-400">kg CO₂ / month</span>
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Calculate Again
              </button>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">🚗 Transit</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.transportation} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">⚡ Electricity</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.electricity} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">🥗 Diet & Food</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.food} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">🛍️ Shopping</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.shopping} kg</p>
              </div>
            </div>
          </div>

          {/* Gemini AI Advice Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse-soft" />
              <h3 className="text-lg font-extrabold text-slate-800">Gemini AI Reduction Suggestions</h3>
            </div>
            
            <div className="text-slate-600 text-sm leading-relaxed prose prose-slate max-w-none pr-2">
              {result.advice ? (
                result.advice.split('\n').map((line, i) => {
                  if (line.startsWith('###')) {
                    return <h4 key={i} className="text-sm font-extrabold text-slate-800 mt-5 mb-2">{line.replace(/###/g, '').trim()}</h4>;
                  }
                  if (line.startsWith('####')) {
                    return <h5 key={i} className="text-xs font-extrabold text-slate-800 mt-4 mb-1">{line.replace(/####/g, '').trim()}</h5>;
                  }
                  if (line.startsWith('-') || line.startsWith('*')) {
                    return <li key={i} className="ml-4 list-disc text-xs my-1">{line.substring(2)}</li>;
                  }
                  return <p key={i} className="my-1.5 text-xs">{line}</p>;
                })
              ) : (
                <p className="text-xs text-slate-400 italic">No recommendations could be loaded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
