import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded page components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CarbonCalculator = lazy(() => import('./pages/CarbonCalculator'));
const Goals = lazy(() => import('./pages/Goals'));
const Challenges = lazy(() => import('./pages/Challenges'));
const ReceiptAnalysis = lazy(() => import('./pages/ReceiptAnalysis'));
const Profile = lazy(() => import('./pages/Profile'));

/**
 * Root application component.
 * Provides authentication context, routing, and lazy-loaded pages.
 * @returns {JSX.Element} The rendered app
 */
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected App Routes under Common Layout Shell */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calculator"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CarbonCalculator />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Goals />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Challenges />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/receipt-analysis"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReceiptAnalysis />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
