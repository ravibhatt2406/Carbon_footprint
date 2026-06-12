import React from 'react';

/**
 * React Error Boundary component.
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-slate-50 p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-md w-full text-center space-y-4">
            <div className="text-4xl" aria-hidden="true">⚠️</div>
            <h1 className="text-xl font-bold text-slate-800">Something went wrong</h1>
            <p className="text-sm text-slate-500">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-eco-600 hover:bg-eco-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
