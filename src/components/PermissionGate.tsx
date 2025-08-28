"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: "head" | "member";
  requireHouseAccess?: string; // houseId that user must have access to
  requireAddHomeAccess?: boolean;
  fallback?: React.ReactNode;
  showUnauthorizedMessage?: boolean;
  unauthorizedMessage?: string;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requireAuth = false,
  requireRole,
  requireHouseAccess,
  requireAddHomeAccess = false,
  fallback = null,
  showUnauthorizedMessage = false,
  unauthorizedMessage = "You don't have permission to view this content.",
}) => {
  const { user, loading, isAuthenticated, permissions } = useAuth();

  // Show loading state if still checking authentication
  if (loading && requireAuth) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    if (showUnauthorizedMessage) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-yellow-800">
              Please log in to view this content.
            </p>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requireRole && user?.role !== requireRole) {
    if (showUnauthorizedMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-red-800">{unauthorizedMessage}</p>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // Check house access requirement
  if (requireHouseAccess && !permissions.canEditHouse(requireHouseAccess)) {
    if (showUnauthorizedMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-red-800">
              You can only edit residents in your own house.
            </p>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // Check add home access requirement
  if (requireAddHomeAccess && !permissions.canAccessAddHome) {
    if (showUnauthorizedMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-red-800">
              Only heads of family can add or edit residents.
            </p>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default PermissionGate;
