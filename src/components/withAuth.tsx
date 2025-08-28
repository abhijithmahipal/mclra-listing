"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";

interface AuthRequirements {
  requireAuth?: boolean;
  requireRole?: "head" | "member";
  requireHouseAccess?: string;
  fallbackPath?: string;
  customCheck?: (user: User | null, isAuthenticated: boolean) => boolean;
}

/**
 * Higher-order component for protecting routes with authentication and authorization
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requirements: AuthRequirements = {}
) {
  const {
    requireAuth = true,
    requireRole,
    requireHouseAccess,
    fallbackPath = "/login",
    customCheck,
  } = requirements;

  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { user, loading, isAuthenticated, permissions } = useAuth();
    const router = useRouter();

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      );
    }

    // Check role requirement
    if (requireRole && user?.role !== requireRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Access Denied
              </h3>
              <p className="text-red-700 mb-4">
                You don&apos;t have the required permissions to access this
                page.
              </p>
              <p className="text-sm text-red-600">
                Required role: {requireRole}
                {user && (
                  <>
                    <br />
                    Your role: {user.role}
                  </>
                )}
              </p>
              <button
                onClick={() => router.push("/houses")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Houses
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Check house access requirement
    if (requireHouseAccess && !permissions.canEditHouse(requireHouseAccess)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Unauthorized Access
              </h3>
              <p className="text-red-700 mb-4">
                You can only access your own house data.
              </p>
              <button
                onClick={() => router.push("/houses")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Houses
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Check custom requirement
    if (customCheck && !customCheck(user, isAuthenticated)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Access Denied
              </h3>
              <p className="text-red-700 mb-4">
                You don&apos;t have permission to access this page.
              </p>
              <button
                onClick={() => router.push("/houses")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Houses
              </button>
            </div>
          </div>
        </div>
      );
    }

    // All checks passed, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthenticatedComponent;
}

// Convenience HOCs for common use cases
export const withHeadOfFamilyAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => withAuth(WrappedComponent, { requireRole: "head" });

export const withMemberAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => withAuth(WrappedComponent, { requireRole: "member" });

export const withBasicAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => withAuth(WrappedComponent, { requireAuth: true });
