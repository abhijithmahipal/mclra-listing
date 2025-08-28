"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db, signOutUser } from "@/lib/firebase";
import { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (firebaseUser: FirebaseUser) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => void;
  updateLastLogin: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Permission checking functions
  const canEditHouse = (houseId: string): boolean => {
    if (!user) return false;
    return user.role === "head" && user.houseId === houseId;
  };

  const canAccessAddHome = (): boolean => {
    if (!user) return false;
    return user.role === "head";
  };

  const canViewAllHouses = (): boolean => {
    return isAuthenticated;
  };

  // Permission object for context value
  const getPermissions = () => ({
    canEditHouse,
    canAccessAddHome: canAccessAddHome(),
    canViewAllHouses: canViewAllHouses(),
  });

  // Fetch user data from Firestore
  const fetchUserData = async (
    firebaseUser: FirebaseUser
  ): Promise<User | null> => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Update last login timestamp
  const updateLastLogin = async (): Promise<void> => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.id);
      await setDoc(
        userDocRef,
        {
          ...user,
          lastLoginAt: Timestamp.now(),
        },
        { merge: true }
      );

      setUser((prev) =>
        prev
          ? {
              ...prev,
              lastLoginAt: {
                seconds: Math.floor(Date.now() / 1000),
                nanoseconds: 0,
              },
            }
          : null
      );
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  };

  // Login function - called after successful OTP verification
  const login = async (firebaseUser: FirebaseUser): Promise<void> => {
    setLoading(true);
    try {
      const userData = await fetchUserData(firebaseUser);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        await updateLastLogin();
      } else {
        // User exists in Firebase Auth but not in Firestore - needs registration
        setUser(null);
        setIsAuthenticated(false);
        // Don't redirect here - let the component handle it
      }
    } catch (error) {
      console.error("Error during login:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await signOutUser();
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        console.error("Logout error:", result.error);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check current authentication state
  const checkAuthState = (): void => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      login(currentUser);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoading(true);
      try {
        const userData = await fetchUserData(currentUser);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
  };

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        // User is signed in
        const userData = await fetchUserData(firebaseUser);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Firebase user exists but no Firestore record - needs registration
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    permissions: getPermissions(),
    login,
    logout,
    checkAuthState,
    updateLastLogin,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
