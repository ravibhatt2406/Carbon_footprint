import React, { createContext, useState, useEffect, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { api } from '../utils/api';

const AuthContext = createContext(null);

// Safe check for environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseKeys = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let firebaseAuth = null;
if (hasFirebaseKeys) {
  try {
    const app = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(app);
    console.log('Firebase Auth initialized on the client.');
  } catch (err) {
    console.error('Failed to initialize Firebase Auth Client SDK:', err);
  }
} else {
  console.log('Running frontend auth in SIMULATION MODE.');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSimulation = !firebaseAuth;

  // Sync profile details (points, custom details) from Express API
  const syncUserProfile = async (token) => {
    try {
      localStorage.setItem('ecolens_token', token);
      const profile = await api.get('/auth/profile');
      setUser(prev => ({
        ...prev,
        ...profile
      }));
    } catch (err) {
      console.error('Error syncing profile with backend:', err);
    }
  };

  useEffect(() => {
    if (isSimulation) {
      // Simulation Auth Initialization
      const token = localStorage.getItem('ecolens_token');
      if (token) {
        api.get('/auth/profile')
          .then(profile => {
            setUser(profile);
          })
          .catch(err => {
            console.warn('Simulated session expired or server offline:', err.message);
            localStorage.removeItem('ecolens_token');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      // Firebase Auth Listener
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              token
            });
            await syncUserProfile(token);
          } catch (err) {
            console.error('Error retrieving Firebase Auth token:', err);
          }
        } else {
          setUser(null);
          localStorage.removeItem('ecolens_token');
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [isSimulation]);

  const registerUser = async (email, password, displayName) => {
    setError(null);
    setLoading(true);
    try {
      if (isSimulation) {
        const data = await api.post('/auth/register', { email, password, displayName });
        localStorage.setItem('ecolens_token', data.token);
        setUser(data.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(userCredential.user, { displayName });
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('ecolens_token', token);
        await syncUserProfile(token);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      if (isSimulation) {
        const data = await api.post('/auth/login', { email, password });
        localStorage.setItem('ecolens_token', data.token);
        setUser(data.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('ecolens_token', token);
        await syncUserProfile(token);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isSimulation) {
        await signOut(firebaseAuth);
      }
      setUser(null);
      localStorage.removeItem('ecolens_token');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshPoints = async () => {
    if (localStorage.getItem('ecolens_token')) {
      try {
        const profile = await api.get('/auth/profile');
        setUser(prev => prev ? { ...prev, points: profile.points } : null);
      } catch (err) {
        console.error('Failed to refresh user stats:', err);
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    refreshPoints,
    isSimulation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
