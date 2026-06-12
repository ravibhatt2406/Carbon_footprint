import React from 'react';

/**
 * Reusable accessible loading spinner.
 * @param {Object} props
 * @param {string} [props.message='Loading...'] - The screen reader announcement text
 * @param {boolean} [props.fullPage=true] - Whether to center in full viewport
 * @returns {JSX.Element} The spinner component
 */
export default function LoadingSpinner({ message = 'Loading...', fullPage = true }) {
  const containerClass = fullPage
    ? 'flex flex-col items-center justify-center min-h-[60vh] space-y-4'
    : 'flex flex-col items-center justify-center space-y-4 py-12';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div
        className="animate-spin rounded-full h-12 w-12 border-4 border-eco-500 border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-slate-400 font-semibold">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}
