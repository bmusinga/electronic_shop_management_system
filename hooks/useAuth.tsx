"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  type User,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      const timeout: ReturnType<typeof setTimeout> = setTimeout(
        () => setLoading(false),
        0
      );
      return () => clearTimeout(timeout);
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<UserCredential> => {
      if (!auth) {
        throw new Error(
          "Firebase is not configured. Please set the NEXT_PUBLIC_FIREBASE_* environment variables."
        );
      }
      return signInWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      if (!auth || !user) {
        throw new Error(
          "You must be signed in to change your password."
        );
      }
      const credential = EmailAuthProvider.credential(
        user.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signOut, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}