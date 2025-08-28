"use client";

import React from "react";
import Link from "next/link";
import ProtectedRoute from "../ProtectedRoute";
import PermissionGate from "../PermissionGate";
import { withHeadOfFamilyAuth } from "../withAuth";

/**
 * Demo component showing how to use the authorization components
 * This file demonstrates the practical usage of all authorization features
 */

// Example 1: Protected page component
const AddHomePage = () => {
  return (
    <ProtectedRoute requireRole="head">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Add Home</h1>
        <p>This page is only accessible to heads of family.</p>
        {/* Add home form would go here */}
      </div>
    </ProtectedRoute>
  );
};

// Example 2: Component with conditional rendering
const HouseCard = ({
  house,
}: {
  house: { id: string; houseNumber: string };
}) => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold">{house.houseNumber}</h3>

      {/* Show edit button only to house heads */}
      <PermissionGate requireHouseAccess={house.id}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
          Edit House
        </button>
      </PermissionGate>

      {/* Show different content based on permissions */}
      <PermissionGate
        requireHouseAccess={house.id}
        fallback={<span className="text-gray-500">View Only</span>}
      >
        <button className="bg-green-600 text-white px-4 py-2 rounded mt-2 ml-2">
          Manage Residents
        </button>
      </PermissionGate>

      {/* Show unauthorized message */}
      <PermissionGate
        requireRole="head"
        showUnauthorizedMessage={true}
        unauthorizedMessage="Only heads of family can perform administrative actions."
      >
        <button className="bg-red-600 text-white px-4 py-2 rounded mt-2 ml-2">
          Delete House
        </button>
      </PermissionGate>
    </div>
  );
};

// Example 3: Using HOC for component protection
const AdminPanel = () => {
  return (
    <div className="bg-gray-100 p-4 rounded">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <p>
        This component is automatically protected by the withHeadOfFamilyAuth
        HOC.
      </p>
      <button className="bg-purple-600 text-white px-4 py-2 rounded">
        Admin Action
      </button>
    </div>
  );
};

// Wrap with HOC
const ProtectedAdminPanel = withHeadOfFamilyAuth(AdminPanel);

// Example 4: Navigation with conditional items
const Navigation = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex space-x-4">
        <Link href="/houses" className="hover:underline">
          Houses
        </Link>

        <PermissionGate requireRole="head">
          <a href="/addhome" className="hover:underline">
            Add Home
          </a>
        </PermissionGate>

        <PermissionGate requireAuth={true}>
          <a href="/profile" className="hover:underline">
            Profile
          </a>
        </PermissionGate>
      </div>
    </nav>
  );
};

// Main demo component
const AuthorizationDemo = () => {
  const sampleHouse = { id: "house123", houseNumber: "96A" };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Authorization Demo</h1>

        <div className="grid gap-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              House Card with Permissions
            </h2>
            <HouseCard house={sampleHouse} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Protected Admin Panel
            </h2>
            <ProtectedAdminPanel />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Add Home Access</h2>
            <PermissionGate
              requireAddHomeAccess={true}
              fallback={
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-yellow-800">
                    You need to be a head of family to access the add home
                    feature.
                  </p>
                </div>
              }
            >
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-800">
                  You have access to add home functionality!
                </p>
                <button className="bg-green-600 text-white px-4 py-2 rounded mt-2">
                  Go to Add Home
                </button>
              </div>
            </PermissionGate>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationDemo;
