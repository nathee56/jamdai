'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLocalMode, setIsLocalMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local mode
    const localMode = localStorage.getItem('studyos_local_mode');
    if (localMode === 'true') {
      setIsLocalMode(true);
      setLoading(false); // We don't need to wait for Firebase if local mode
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Only finish loading if we haven't already loaded via local mode
      if (!localMode) {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const loginLocalMode = useCallback(() => {
    localStorage.setItem('studyos_local_mode', 'true');
    setIsLocalMode(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      
      // Clear all application state to prevent leaks
      localStorage.removeItem('studyos_local_mode');
      localStorage.removeItem('app_widget_order');
      // Clear AI caches
      sessionStorage.clear(); 
      
      setIsLocalMode(false);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return { user, isLocalMode, loading, signIn, loginLocalMode, signOut };
}
