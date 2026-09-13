"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const timeout = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timeout);
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!auth) {
      throw new Error("Firebase is not configured. Please set the NEXT_PUBLIC_FIREBASE_* environment variables.");
    }
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) {
      return;
    }
    return firebaseSignOut(auth);
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!auth || !user) {
        throw new Error(
          "You must be signed in to change your password."
        );
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
