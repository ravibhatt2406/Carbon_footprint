import React from 'react';
import { useFootprintCalculator } from '../hooks/useFootprintCalculator';
import { CALCULATOR_STEPS, FOOD_OPTIONS, SHOPPING_OPTIONS } from '../utils/constants';
import ErrorAlert from '../components/ErrorAlert';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  Car,
  Zap,
  ShoppingBag,
  Utensils,
  Leaf,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

/** Maps step IDs to their icon components */
const STEP_ICONS = { 1: Car, 2: Zap, 3: Utensils, 4: ShoppingBag };

/**
 * Multi-step carbon footprint calculator page.
 * Collects transportation, electricity, food, and shopping data.
 * Uses the useFootprintCalculator hook for all state management.
 * @returns {JSX.Element} The calculator page
 */
export default function CarbonCalculator() {
  const {
    step, loading, result, error,
    carKm, setCarKm, bikeKm, setBikeKm,
    busKm, setBusKm, trainKm, setTrainKm,
    electricityKwh, setElectricityKwh,
    foodHabit, setFoodHabit,
    shoppingHabit, setShoppingHabit,
    handleNext, handleBack, handleSubmit, handleReset,
  } = useFootprintCalculator();

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Carbon Calculator</h1>
        <p className="text-slate-500 font-medium mt-1">Estimate your carbon impact by answering simple lifestyle questions.</p>
      </div>

      <ErrorAlert message={error} variant="error" id="calculator-error" />

      {!result ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Steps Side Navigator */}
          <div className="md:col-span-1 border-r border-slate-100 md:pr-6 space-y-4" role="group" aria-label="Calculator steps">
            {CALCULATOR_STEPS.map((s) => {
              const StepIcon = STEP_ICONS[s.id];
              const isCurrent = step === s.id;
              const isPassed = step > s.id;

              return (
                <div
                  key={s.id}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-eco-500 text-white font-bold'
                      : isPassed
                      ? 'text-eco-600 font-semibold'
                      : 'text-slate-400 font-medium'
                  }`}
                >
                  <StepIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm">{s.title}</span>
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="md:col-span-3 flex flex-col justify-between min-h-[300px]">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* STEP 1: TRANSPORTATION */}
              {step === 1 && (
                <fieldset className="space-y-4">
                  <legend className="text-lg font-extrabold text-slate-800">Weekly Commuting Distances</legend>
                  <p className="text-xs text-slate-400">Estimate how many kilometers you travel per week.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="calc-car-km" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Car (km)</label>
                      <input id="calc-car-km" name="carKm" type="number" min="0" value={carKm} onChange={(e) => setCarKm(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="calc-bike-km" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bicycle (km)</label>
                      <input id="calc-bike-km" name="bikeKm" type="number" min="0" value={bikeKm} onChange={(e) => setBikeKm(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="calc-bus-km" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Bus (km)</label>
                      <input id="calc-bus-km" name="busKm" type="number" min="0" value={busKm} onChange={(e) => setBusKm(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="calc-train-km" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Train (km)</label>
                      <input id="calc-train-km" name="trainKm" type="number" min="0" value={trainKm} onChange={(e) => setTrainKm(e.target.value)} className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium" />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* STEP 2: ELECTRICITY */}
              {step === 2 && (
                <fieldset className="space-y-4">
                  <legend className="text-lg font-extrabold text-slate-800">Home Electricity Usage</legend>
                  <p className="text-xs text-slate-400">Enter your average monthly electrical consumption in kWh.</p>
                  
                  <div className="flex flex-col space-y-1 max-w-sm">
                    <label htmlFor="calc-electricity" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Monthly Energy (kWh)</label>
                    <input id="calc-electricity" name="electricityKwh" type="number" min="0" value={electricityKwh} onChange={(e) => setElectricityKwh(e.target.value)} placeholder="e.g. 250" className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium" />
                  </div>
                </fieldset>
              )}

              {/* STEP 3: FOOD HABITS — Accessible radio cards */}
              {step === 3 && (
                <fieldset className="space-y-4">
                  <legend className="text-lg font-extrabold text-slate-800">Dietary Choices</legend>
                  <p className="text-xs text-slate-400">Select the option that matches your weekly food habits best.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {FOOD_OPTIONS.map((item) => (
                      <div key={item.id} className="relative">
                        <input type="radio" id={`food-${item.id}`} name="foodHabit" value={item.id} checked={foodHabit === item.id} onChange={() => setFoodHabit(item.id)} className="radio-card-input" />
                        <label htmlFor={`food-${item.id}`} className="radio-card-label">
                          <h4 className="font-extrabold text-sm text-slate-800">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">{item.desc}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* STEP 4: SHOPPING HABITS — Accessible radio cards */}
              {step === 4 && (
                <fieldset className="space-y-4">
                  <legend className="text-lg font-extrabold text-slate-800">Shopping Consumer Habits</legend>
                  <p className="text-xs text-slate-400">Select your purchasing level for clothing, goods, and electronics.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {SHOPPING_OPTIONS.map((item) => (
                      <div key={item.id} className="relative">
                        <input type="radio" id={`shopping-${item.id}`} name="shoppingHabit" value={item.id} checked={shoppingHabit === item.id} onChange={() => setShoppingHabit(item.id)} className="radio-card-input" />
                        <label htmlFor={`shopping-${item.id}`} className="radio-card-label">
                          <h4 className="font-extrabold text-sm text-slate-800">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">{item.desc}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
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
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center space-x-1.5 bg-eco-600 hover:bg-eco-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-eco-600/10"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/10 disabled:opacity-75"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-label="Submitting">
                      <span className="sr-only">Submitting...</span>
                    </div>
                  ) : (
                    <>
                      <span>Submit Details</span>
                      <Leaf className="h-4 w-4" aria-hidden="true" />
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
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100" aria-labelledby="result-heading">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-6 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Result Computed
                </span>
                <h2 id="result-heading" className="text-4xl font-black text-slate-800 mt-2">
                  {result.total} <span className="text-lg font-medium text-slate-400">kg CO₂ / month</span>
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Calculate Again
              </button>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6" role="list" aria-label="Carbon footprint breakdown">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl" role="listitem">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><span aria-hidden="true">🚗</span> Transit</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.transportation} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl" role="listitem">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><span aria-hidden="true">⚡</span> Electricity</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.electricity} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl" role="listitem">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><span aria-hidden="true">🥗</span> Diet & Food</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.food} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl" role="listitem">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide"><span aria-hidden="true">🛍️</span> Shopping</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{result.breakdown.shopping} kg</p>
              </div>
            </div>
          </section>

          {/* Gemini AI Advice Card */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4" aria-labelledby="ai-advice-heading">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse-soft" aria-hidden="true" />
              <h3 id="ai-advice-heading" className="text-lg font-extrabold text-slate-800">Gemini AI Reduction Suggestions</h3>
            </div>
            <MarkdownRenderer content={result.advice} emptyMessage="No recommendations could be loaded." />
          </section>
        </div>
      )}
    </div>
  );
}
