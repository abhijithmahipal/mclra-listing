"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { useAuth } from "@/contexts";
import {
  setupRecaptcha,
  sendOTP,
  verifyOTP,
  formatPhoneNumber,
  validatePhoneNumber,
} from "@/lib/firebase";

interface LoginState {
  phoneNumber: string;
  otpCode: string;
  step: "phone" | "otp";
  loading: boolean;
  error: string | null;
  success: string | null;
  canResend: boolean;
  resendTimer: number;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [state, setState] = useState<LoginState>({
    phoneNumber: "",
    otpCode: "",
    step: "phone",
    loading: false,
    error: null,
    success: null,
    canResend: false,
    resendTimer: 0,
  });

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/houses");
    }
  }, [isAuthenticated, authLoading, router]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start resend timer
  const startResendTimer = () => {
    setState((prev) => ({ ...prev, canResend: false, resendTimer: 60 }));

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.resendTimer <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return { ...prev, canResend: true, resendTimer: 0 };
        }
        return { ...prev, resendTimer: prev.resendTimer - 1 };
      });
    }, 1000);
  };

  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setState((prev) => ({
      ...prev,
      phoneNumber: value,
      error: null,
    }));
  };

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only digits, max 6
    setState((prev) => ({
      ...prev,
      otpCode: value,
      error: null,
    }));
  };

  // Send OTP to phone number
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneNumber(state.phoneNumber)) {
      setState((prev) => ({
        ...prev,
        error: "Please enter a valid 10-digit phone number",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Setup reCAPTCHA if not already done
      if (!recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current = setupRecaptcha("recaptcha-container");
        } catch (recaptchaError) {
          console.error("reCAPTCHA setup error:", recaptchaError);
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Security verification setup failed. Please refresh the page and try again.",
          }));
          return;
        }
      }

      const formattedPhone = formatPhoneNumber(state.phoneNumber);
      const result = await sendOTP(
        formattedPhone,
        recaptchaVerifierRef.current
      );

      if (result.success && result.confirmationResult) {
        confirmationResultRef.current = result.confirmationResult;
        setState((prev) => ({
          ...prev,
          step: "otp",
          loading: false,
          success: "OTP sent successfully! Please check your phone.",
        }));
        startResendTimer();
      } else {
        let errorMessage =
          result.error || "Failed to send OTP. Please try again.";

        // Provide more specific error messages
        if (result.error?.includes("auth/operation-not-allowed")) {
          errorMessage =
            "Phone authentication is not properly configured. Please contact support.";
        } else if (result.error?.includes("auth/billing-not-enabled")) {
          errorMessage =
            "Phone authentication requires a paid Firebase plan. Please upgrade your Firebase project to the Blaze plan or use test phone numbers for development.";
        } else if (result.error?.includes("auth/too-many-requests")) {
          errorMessage = "Too many attempts. Please try again later.";
        } else if (result.error?.includes("auth/invalid-phone-number")) {
          errorMessage = "Please enter a valid phone number.";
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Network error. Please check your connection and try again.",
      }));
    }
  };

  // Verify OTP code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.otpCode.length !== 6) {
      setState((prev) => ({
        ...prev,
        error: "Please enter the complete 6-digit OTP",
      }));
      return;
    }

    if (!confirmationResultRef.current) {
      setState((prev) => ({
        ...prev,
        error: "Session expired. Please request a new OTP.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await verifyOTP(
        confirmationResultRef.current,
        state.otpCode
      );

      if (result.success && result.userCredential) {
        setState((prev) => ({
          ...prev,
          loading: false,
          success: "Login successful! Redirecting...",
        }));

        // Call login from AuthContext
        await login(result.userCredential.user);

        // Wait a moment for the auth context to update, then check if user needs registration
        setTimeout(() => {
          // Check if user is authenticated (has Firestore record)
          if (isAuthenticated) {
            router.push("/houses");
          } else {
            // User authenticated with Firebase but no Firestore record - needs registration
            router.push("/register");
          }
        }, 1500);
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || "Invalid OTP. Please try again.",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Verification failed. Please try again.",
      }));
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!state.canResend) return;

    setState((prev) => ({ ...prev, otpCode: "", error: null, success: null }));

    try {
      const formattedPhone = formatPhoneNumber(state.phoneNumber);
      const result = await sendOTP(
        formattedPhone,
        recaptchaVerifierRef.current!
      );

      if (result.success && result.confirmationResult) {
        confirmationResultRef.current = result.confirmationResult;
        setState((prev) => ({
          ...prev,
          success: "New OTP sent successfully!",
        }));
        startResendTimer();
      } else {
        setState((prev) => ({
          ...prev,
          error: result.error || "Failed to resend OTP. Please try again.",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to resend OTP. Please try again.",
      }));
    }
  };

  // Go back to phone input
  const handleBackToPhone = () => {
    setState((prev) => ({
      ...prev,
      step: "phone",
      otpCode: "",
      error: null,
      success: null,
      canResend: false,
      resendTimer: 0,
    }));

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    confirmationResultRef.current = null;
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
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {state.step === "phone"
              ? "Enter your phone number to receive an OTP"
              : "Enter the 6-digit code sent to your phone"}
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

          {/* Phone Number Form */}
          {state.step === "phone" && (
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">+91</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="appearance-none rounded-md relative block w-full pl-12 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter 10-digit phone number"
                    value={state.phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    disabled={state.loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  We&apos;ll send you a 6-digit verification code
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={state.loading || !state.phoneNumber}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* OTP Verification Form */}
          {state.step === "otp" && (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-lg tracking-widest"
                    placeholder="000000"
                    value={state.otpCode}
                    onChange={handleOtpChange}
                    maxLength={6}
                    disabled={state.loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Code sent to +91{state.phoneNumber}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={state.loading || state.otpCode.length !== 6}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    ← Change phone number
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!state.canResend}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {state.canResend
                      ? "Resend OTP"
                      : `Resend in ${state.resendTimer}s`}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
