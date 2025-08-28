"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { House, User } from "@/types";
import { validateHouseNumber, sanitizeHouseNumber } from "@/lib/validation";

interface RegistrationState {
  step: "choice" | "create-house" | "join-house";
  houseNumber: string;
  registrationType: "create" | "join" | null;
  availableHouses: House[];
  selectedHouseId: string;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, refreshUserData } = useAuth();

  const [state, setState] = useState<RegistrationState>({
    step: "choice",
    houseNumber: "",
    registrationType: null,
    availableHouses: [],
    selectedHouseId: "",
    loading: false,
    error: null,
    success: null,
  });

  // Redirect if already authenticated or if not logged in with Firebase Auth
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        // User is already registered, redirect to houses
        router.push("/houses");
      } else if (!auth.currentUser) {
        // User is not authenticated with Firebase, redirect to login
        router.push("/login");
      }
    }
  }, [isAuthenticated, authLoading, router]);

  // Check if house number already exists
  const checkHouseNumberExists = async (
    houseNumber: string
  ): Promise<boolean> => {
    try {
      const housesRef = collection(db, "houses");
      const q = query(
        housesRef,
        where("houseNumber", "==", sanitizeHouseNumber(houseNumber))
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking house number:", error);
      throw new Error("Failed to validate house number");
    }
  };

  // Fetch available houses for joining
  const fetchAvailableHouses = async (): Promise<House[]> => {
    try {
      const housesRef = collection(db, "houses");
      const querySnapshot = await getDocs(housesRef);
      const houses: House[] = [];

      querySnapshot.forEach((doc) => {
        houses.push({ id: doc.id, ...doc.data() } as House);
      });

      return houses.sort((a, b) => a.houseNumber.localeCompare(b.houseNumber));
    } catch (error) {
      console.error("Error fetching houses:", error);
      throw new Error("Failed to load available houses");
    }
  };

  // Create new house and user record
  const createHouse = async (houseNumber: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    const userId = auth.currentUser.uid;
    const phoneNumber = auth.currentUser.phoneNumber;

    if (!phoneNumber) {
      throw new Error("Phone number not available");
    }

    // Validate house number
    if (!validateHouseNumber(houseNumber)) {
      throw new Error(
        "House number must be alphanumeric (e.g., 96, 96A, B-12)"
      );
    }

    // Check if house number already exists
    const exists = await checkHouseNumberExists(houseNumber);
    if (exists) {
      throw new Error(
        "House number already exists. Please choose a different number."
      );
    }

    const now = Timestamp.now();
    const timestamp = {
      seconds: now.seconds,
      nanoseconds: now.nanoseconds,
    };

    // Create house document
    const houseRef = doc(collection(db, "houses"));
    const houseData: Omit<House, "id"> = {
      houseNumber: sanitizeHouseNumber(houseNumber),
      headOfFamilyId: userId,
      memberIds: [userId],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(houseRef, houseData);

    // Create user document
    const userRef = doc(db, "users", userId);
    const userData: Omit<User, "id"> = {
      phoneNumber,
      role: "head",
      houseId: houseRef.id,
      createdAt: timestamp,
      lastLoginAt: timestamp,
    };

    await setDoc(userRef, userData);
  };

  // Join existing house as member
  const joinHouse = async (houseId: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    const userId = auth.currentUser.uid;
    const phoneNumber = auth.currentUser.phoneNumber;

    if (!phoneNumber) {
      throw new Error("Phone number not available");
    }

    const now = Timestamp.now();
    const timestamp = {
      seconds: now.seconds,
      nanoseconds: now.nanoseconds,
    };

    // Update house document to add user as member
    const houseRef = doc(db, "houses", houseId);
    await updateDoc(houseRef, {
      memberIds: arrayUnion(userId),
      updatedAt: timestamp,
    });

    // Create user document
    const userRef = doc(db, "users", userId);
    const userData: Omit<User, "id"> = {
      phoneNumber,
      role: "member",
      houseId,
      createdAt: timestamp,
      lastLoginAt: timestamp,
    };

    await setDoc(userRef, userData);
  };

  // Handle registration type selection
  const handleRegistrationChoice = (type: "create" | "join") => {
    setState((prev) => ({
      ...prev,
      registrationType: type,
      step: type === "create" ? "create-house" : "join-house",
      error: null,
    }));

    // If joining, fetch available houses
    if (type === "join") {
      loadAvailableHouses();
    }
  };

  // Load available houses for joining
  const loadAvailableHouses = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const houses = await fetchAvailableHouses();
      setState((prev) => ({
        ...prev,
        availableHouses: houses,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load houses",
      }));
    }
  };

  // Handle house number input change
  const handleHouseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase(); // Convert to uppercase for consistency
    setState((prev) => ({
      ...prev,
      houseNumber: value,
      error: null,
    }));
  };

  // Handle house selection for joining
  const handleHouseSelection = (houseId: string) => {
    setState((prev) => ({
      ...prev,
      selectedHouseId: houseId,
      error: null,
    }));
  };

  // Handle create house form submission
  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sanitizeHouseNumber(state.houseNumber)) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a house number",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await createHouse(state.houseNumber);

      // Refresh user data in auth context
      await refreshUserData();

      setState((prev) => ({
        ...prev,
        loading: false,
        success:
          "House created successfully! Redirecting to add home details...",
      }));

      // Redirect to add home page after successful registration
      setTimeout(() => {
        router.push("/addhome");
      }, 2000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to create house",
      }));
    }
  };

  // Handle join house form submission
  const handleJoinHouse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.selectedHouseId) {
      setState((prev) => ({
        ...prev,
        error: "Please select a house to join",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await joinHouse(state.selectedHouseId);

      // Refresh user data in auth context
      await refreshUserData();

      setState((prev) => ({
        ...prev,
        loading: false,
        success: "Successfully joined house! Redirecting to houses page...",
      }));

      // Redirect to houses page after successful registration
      setTimeout(() => {
        router.push("/houses");
      }, 2000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to join house",
      }));
    }
  };

  // Go back to choice step
  const handleBackToChoice = () => {
    setState((prev) => ({
      ...prev,
      step: "choice",
      registrationType: null,
      houseNumber: "",
      selectedHouseId: "",
      error: null,
      success: null,
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {state.step === "choice" && "Choose how you&apos;d like to proceed"}
            {state.step === "create-house" &&
              "Create a new house and become head of family"}
            {state.step === "join-house" &&
              "Join an existing house as a member"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Error Message */}
          {state.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {state.error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {state.success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {state.success}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Choice Step */}
          {state.step === "choice" && (
            <div className="space-y-4">
              <button
                onClick={() => handleRegistrationChoice("create")}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Create New House
                    </p>
                    <p className="text-sm text-gray-500">
                      Become head of family and manage residents
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                onClick={() => handleRegistrationChoice("join")}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Join Existing House
                    </p>
                    <p className="text-sm text-gray-500">
                      Become a member and view resident information
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Create House Step */}
          {state.step === "create-house" && (
            <form className="space-y-6" onSubmit={handleCreateHouse}>
              <div>
                <label
                  htmlFor="houseNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  House Number
                </label>
                <div className="mt-1">
                  <input
                    id="houseNumber"
                    name="houseNumber"
                    type="text"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="e.g., 96, 96A, B-12"
                    value={state.houseNumber}
                    onChange={handleHouseNumberChange}
                    disabled={state.loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your house number (alphanumeric format supported)
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={
                    state.loading || !sanitizeHouseNumber(state.houseNumber)
                  }
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating House...
                    </>
                  ) : (
                    "Create House & Continue"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToChoice}
                  className="w-full text-sm text-blue-600 hover:text-blue-500"
                >
                  ← Back to options
                </button>
              </div>
            </form>
          )}

          {/* Join House Step */}
          {state.step === "join-house" && (
            <form className="space-y-6" onSubmit={handleJoinHouse}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a House to Join
                </label>

                {state.loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading houses...
                    </p>
                  </div>
                ) : state.availableHouses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      No houses available to join
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {state.availableHouses.map((house) => (
                      <label
                        key={house.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          state.selectedHouseId === house.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedHouse"
                          value={house.id}
                          checked={state.selectedHouseId === house.id}
                          onChange={() => handleHouseSelection(house.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            House {house.houseNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {house.memberIds.length} member
                            {house.memberIds.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={
                    state.loading ||
                    !state.selectedHouseId ||
                    state.availableHouses.length === 0
                  }
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining House...
                    </>
                  ) : (
                    "Join House & Continue"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToChoice}
                  className="w-full text-sm text-blue-600 hover:text-blue-500"
                >
                  ← Back to options
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
