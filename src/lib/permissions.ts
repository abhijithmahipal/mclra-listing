import { User } from "@/types";

/**
 * Permission checking utility functions
 * These functions can be used throughout the application to check user permissions
 */

/**
 * Check if a user can edit a specific house
 * Only heads of family can edit their own house
 */
export const canEditHouse = (user: User | null, houseId: string): boolean => {
  if (!user) return false;
  return user.role === "head" && user.houseId === houseId;
};

/**
 * Check if a user can access the add home functionality
 * Only heads of family can add/edit residents
 */
export const canAccessAddHome = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "head";
};

/**
 * Check if a user can view all houses
 * All authenticated users can view all houses
 */
export const canViewAllHouses = (isAuthenticated: boolean): boolean => {
  return isAuthenticated;
};

/**
 * Check if a user can edit a specific resident
 * Only heads of family can edit residents in their own house
 */
export const canEditResident = (
  user: User | null,
  residentHouseId: string
): boolean => {
  if (!user) return false;
  return user.role === "head" && user.houseId === residentHouseId;
};

/**
 * Check if a user is the head of their house
 */
export const isHeadOfFamily = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "head";
};

/**
 * Check if a user is a member (not head) of a house
 */
export const isMember = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === "member";
};

/**
 * Get user role display name
 */
export const getUserRoleDisplayName = (user: User | null): string => {
  if (!user) return "Guest";
  return user.role === "head" ? "Head of Family" : "Member";
};

/**
 * Check if a user can perform administrative actions
 * Currently only heads of family have admin privileges for their house
 */
export const canPerformAdminActions = (
  user: User | null,
  targetHouseId?: string
): boolean => {
  if (!user) return false;
  if (!targetHouseId) return user.role === "head";
  return user.role === "head" && user.houseId === targetHouseId;
};

/**
 * Permission error messages
 */
export const PERMISSION_ERRORS = {
  NOT_AUTHENTICATED: "You must be logged in to access this feature.",
  NOT_HEAD_OF_FAMILY: "Only heads of family can perform this action.",
  WRONG_HOUSE: "You can only edit residents in your own house.",
  GENERAL_UNAUTHORIZED: "You don't have permission to perform this action.",
  MEMBER_RESTRICTION: "Members can only view resident information.",
} as const;

/**
 * Get appropriate error message for permission denial
 */
export const getPermissionErrorMessage = (
  user: User | null,
  requiredPermission: "edit_house" | "add_home" | "admin" | "authenticated",
  targetHouseId?: string
): string => {
  if (!user) {
    return PERMISSION_ERRORS.NOT_AUTHENTICATED;
  }

  switch (requiredPermission) {
    case "authenticated":
      return PERMISSION_ERRORS.NOT_AUTHENTICATED;
    case "add_home":
    case "admin":
      if (user.role !== "head") {
        return PERMISSION_ERRORS.NOT_HEAD_OF_FAMILY;
      }
      break;
    case "edit_house":
      if (user.role !== "head") {
        return PERMISSION_ERRORS.NOT_HEAD_OF_FAMILY;
      }
      if (targetHouseId && user.houseId !== targetHouseId) {
        return PERMISSION_ERRORS.WRONG_HOUSE;
      }
      break;
    default:
      return PERMISSION_ERRORS.GENERAL_UNAUTHORIZED;
  }

  return PERMISSION_ERRORS.GENERAL_UNAUTHORIZED;
};
