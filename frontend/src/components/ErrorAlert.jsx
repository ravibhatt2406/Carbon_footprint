import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Reusable error/warning alert banner with accessible attributes.
 * @param {Object} props
 * @param {string} props.message - The error message to display
 * @param {string} [props.variant='warning'] - 'warning' (amber) or 'error' (red)
 * @param {string} [props.id] - Optional id for aria-describedby linking
 * @returns {JSX.Element|null} The error alert or null if no message
 */
export default function ErrorAlert({ message, variant = 'warning', id }) {
  if (!message) return null;

  const styles = variant === 'error'
    ? 'bg-red-50 text-red-700 border-red-100'
    : 'bg-amber-50 text-amber-700 border-amber-100';

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={`${styles} border text-xs font-semibold p-4 rounded-2xl flex items-center space-x-2`}
    >
      <HelpCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
