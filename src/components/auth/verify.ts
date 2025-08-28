// Verification script to ensure all components can be imported correctly
import ProtectedRoute from "../ProtectedRoute";
import PermissionGate from "../PermissionGate";
import {
  withAuth,
  withHeadOfFamilyAuth,
  withMemberAuth,
  withBasicAuth,
} from "../withAuth";
import {
  canEditHouse,
  canAccessAddHome,
  canViewAllHouses,
  canEditResident,
  isHeadOfFamily,
  isMember,
  getUserRoleDisplayName,
  canPerformAdminActions,
  PERMISSION_ERRORS,
  getPermissionErrorMessage,
} from "../../lib/permissions";

// Verify all exports are available
console.log(
  "✅ All authorization components and utilities imported successfully"
);

export {
  ProtectedRoute,
  PermissionGate,
  withAuth,
  withHeadOfFamilyAuth,
  withMemberAuth,
  withBasicAuth,
  canEditHouse,
  canAccessAddHome,
  canViewAllHouses,
  canEditResident,
  isHeadOfFamily,
  isMember,
  getUserRoleDisplayName,
  canPerformAdminActions,
  PERMISSION_ERRORS,
  getPermissionErrorMessage,
};
