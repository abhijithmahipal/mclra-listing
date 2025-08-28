"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationItem {
  href: string;
  label: string;
  icon?: string;
  primary?: boolean;
}

export default function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Navigation items based on authentication and role
  const getNavigationItems = (): NavigationItem[] => {
    if (!isAuthenticated) {
      return [{ href: "/login", label: "Login", primary: true }];
    }

    const items: NavigationItem[] = [
      { href: "/houses", label: "Community Directory", icon: "🏠" },
    ];

    // Add "Add Home" for heads of family
    if (user?.role === "head") {
      items.push({ href: "/addhome", label: "Add Residents", icon: "➕" });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link
              href={isAuthenticated ? "/houses" : "/"}
              className="flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                M
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-900 text-lg font-bold tracking-tight">
                  MCLRA
                </span>
                <p className="text-xs text-gray-500 -mt-1">
                  Museum Cross Lane Residents
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.primary
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Section */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.phoneNumber?.slice(-2) || "U"}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.phoneNumber}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role === "head"
                          ? "Head of Family"
                          : "Family Member"}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.phoneNumber}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role === "head"
                          ? "Head of Family"
                          : "Family Member"}
                      </p>
                      {user.houseId && (
                        <p className="text-xs text-blue-600 mt-1">
                          House ID: {user.houseId.slice(-6)}
                        </p>
                      )}
                    </div>

                    <div className="py-2">
                      <Link
                        href="/houses"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span>🏠</span>
                        Community Directory
                      </Link>

                      {user.role === "head" && (
                        <Link
                          href="/addhome"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span>➕</span>
                          Add Residents
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span>🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    item.primary
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}

              {isAuthenticated && user && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user.phoneNumber}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role === "head"
                        ? "Head of Family"
                        : "Family Member"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}
