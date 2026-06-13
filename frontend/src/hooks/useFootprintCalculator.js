/**
 * @module useFootprintCalculator
 * Custom hook encapsulating the multi-step carbon footprint calculator state machine.
 * Manages form state, step navigation, submission, and reset logic.
 */
import { useState, useCallback } from 'react';
import { submitFootprint } from '../services/footprintService';
import { useAuth } from '../context/AuthContext';

/** @typedef {import('../types/index').FootprintLog} FootprintLog */

/**
 * Manages the complete state machine for the 4-step carbon footprint calculator.
 * @returns {Object} Calculator state, form values, and operations
 */
export function useFootprintCalculator() {
  const { refreshPoints } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Form state
  const [carKm, setCarKm] = useState(0);
  const [bikeKm, setBikeKm] = useState(0);
  const [busKm, setBusKm] = useState(0);
  const [trainKm, setTrainKm] = useState(0);
  const [electricityKwh, setElectricityKwh] = useState(0);
  const [foodHabit, setFoodHabit] = useState('mixed');
  const [shoppingHabit, setShoppingHabit] = useState('moderate');

  /** Advances to the next step (max 4) */
  const handleNext = useCallback(() => {
    if (step < 4) setStep(s => s + 1);
  }, [step]);

  /** Returns to the previous step (min 1) */
  const handleBack = useCallback(() => {
    if (step > 1) setStep(s => s - 1);
  }, [step]);

  /**
   * Submits the footprint calculation to the backend.
   * @param {Event} e - Form submit event
   */
  const handleSubmit = useCallback(async (e) => {
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
      const response = await submitFootprint(payload);
      setResult(response);
      await refreshPoints();
    } catch (err) {
      console.error('Submit footprint calculation error:', err);
      setError('Failed to compute carbon values. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [carKm, bikeKm, busKm, trainKm, electricityKwh, foodHabit, shoppingHabit, refreshPoints]);

  /** Resets the calculator to initial state for a new calculation */
  const handleReset = useCallback(() => {
    setResult(null);
    setStep(1);
    setCarKm(0);
    setBikeKm(0);
    setBusKm(0);
    setTrainKm(0);
    setElectricityKwh(0);
    setFoodHabit('mixed');
    setShoppingHabit('moderate');
  }, []);

  return {
    step,
    loading,
    result,
    error,
    // Form values
    carKm, setCarKm,
    bikeKm, setBikeKm,
    busKm, setBusKm,
    trainKm, setTrainKm,
    electricityKwh, setElectricityKwh,
    foodHabit, setFoodHabit,
    shoppingHabit, setShoppingHabit,
    // Operations
    handleNext,
    handleBack,
    handleSubmit,
    handleReset,
  };
}
