import { User, House } from "@/types";

/**
 * Validates house number format
 * House numbers can be alphanumeric (e.g., "96", "96A", "B-12")
 */
export const validateHouseNumber = (houseNumber: string): boolean => {
  if (!houseNumber || typeof houseNumber !== "string") {
    return false;
  }

  const trimmed = houseNumber.trim();
  if (trimmed.length === 0) {
    return false;
  }

  // Allow alphanumeric characters and hyphens
  const houseNumberRegex = /^[A-Za-z0-9\-]+$/;
  return houseNumberRegex.test(trimmed);
};

/**
 * Validates if a user has association with a house
 * User can be either head of family or a member
 */
export const validateUserHouseAssociation = (
  user: User,
  house: House
): boolean => {
  if (!user || !house) {
    return false;
  }

  // Check if user is head of family
  if (house.headOfFamilyId === user.id) {
    return true;
  }

  // Check if user is a member
  if (house.memberIds && house.memberIds.includes(user.id)) {
    return true;
  }

  return false;
};

/**
 * Validates phone number format
 * Accepts various Indian phone number formats
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return false;
  }

  const trimmed = phoneNumber.trim();

  // Indian phone number patterns
  // +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX (10 digits)
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(trimmed.replace(/\s+/g, ""));
};

/**
 * Validates user role
 */
export const validateUserRole = (role: string): role is "head" | "member" => {
  return role === "head" || role === "member";
};

/**
 * Validates that required fields are present in user data
 */
export const validateUserData = (userData: Partial<User>): boolean => {
  if (!userData) return false;

  return !!(
    userData.id &&
    userData.phoneNumber &&
    userData.role &&
    userData.houseId &&
    validatePhoneNumber(userData.phoneNumber) &&
    validateUserRole(userData.role)
  );
};

/**
 * Validates that required fields are present in house data
 */
export const validateHouseData = (houseData: Partial<House>): boolean => {
  if (!houseData) return false;

  return !!(
    houseData.id &&
    houseData.houseNumber &&
    houseData.headOfFamilyId &&
    validateHouseNumber(houseData.houseNumber)
  );
};

/**
 * Sanitizes house number input
 */
export const sanitizeHouseNumber = (houseNumber: string): string => {
  if (!houseNumber || typeof houseNumber !== "string") {
    return "";
  }

  return houseNumber.trim().toUpperCase();
};

/**
 * Sanitizes phone number input
 */
export const sanitizePhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    return "";
  }

  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // Handle different formats
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  return cleaned;
};
