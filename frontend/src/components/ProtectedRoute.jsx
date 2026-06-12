import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Route guard component that redirects unauthenticated users to login.
 * Shows an accessible loading spinner while authentication is being verified.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page content
 * @returns {JSX.Element} Children, redirect, or loading state
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
