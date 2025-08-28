import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  projectId: "mclra-eb016",
  appId: "1:835863133405:web:2266186b0c6da0db8aef34",
  storageBucket: "mclra-eb016.firebasestorage.app",
  apiKey: "AIzaSyDx0odY7HpPmml6l4pIVE4sSRq8Jicg2b8",
  authDomain: "mclra-eb016.firebaseapp.com",
  messagingSenderId: "835863133405",
  measurementId: "G-4C5JMMTM38",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Authentication utility functions for phone/OTP verification

/**
 * Sets up reCAPTCHA verifier for phone authentication
 * @param containerId - ID of the container element for reCAPTCHA
 * @returns RecaptchaVerifier instance
 */
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
    },
    "expired-callback": () => {
      // Response expired, ask user to solve reCAPTCHA again
    },
  });
};

/**
 * Sends OTP to the provided phone number
 * @param phoneNumber - Phone number in international format (e.g., +1234567890)
 * @param recaptchaVerifier - RecaptchaVerifier instance
 * @returns Promise that resolves to ConfirmationResult
 */
export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    return { success: true, confirmationResult, error: null };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send OTP";
    return {
      success: false,
      confirmationResult: null,
      error: errorMessage,
    };
  }
};

/**
 * Verifies the OTP code entered by the user
 * @param confirmationResult - ConfirmationResult from sendOTP
 * @param otpCode - 6-digit OTP code entered by user
 * @returns Promise that resolves to UserCredential or error
 */
export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  otpCode: string
) => {
  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    return { success: true, userCredential, error: null };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Invalid OTP code";
    return {
      success: false,
      userCredential: null,
      error: errorMessage,
    };
  }
};

/**
 * Signs out the current user
 * @returns Promise that resolves when sign out is complete
 */
export const signOutUser = async () => {
  try {
    await auth.signOut();
    return { success: true, error: null };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to sign out";
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Formats phone number to international format
 * @param phoneNumber - Phone number string
 * @param countryCode - Country code (default: +91 for India)
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: string = "+91"
): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // If it already starts with country code, return as is
  if (cleaned.startsWith(countryCode.replace("+", ""))) {
    return "+" + cleaned;
  }

  // Add country code if not present
  return countryCode + cleaned;
};

/**
 * Validates phone number format
 * @param phoneNumber - Phone number to validate
 * @returns boolean indicating if phone number is valid
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation for Indian phone numbers (10 digits)
  const phoneRegex = /^[+]?[91]?[6-9]\d{9}$/;
  const cleaned = phoneNumber.replace(/\D/g, "");
  return phoneRegex.test(cleaned) && cleaned.length >= 10;
};
