import { render, screen } from "@testing-library/react";
import { useAuth } from "@/contexts/AuthContext";
import PermissionGate from "../PermissionGate";
import { User } from "@/types";

// Mock the useAuth hook
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("Authorization Components", () => {
  const mockHeadUser: User = {
    id: "user1",
    phoneNumber: "+1234567890",
    role: "head",
    houseId: "house1",
    createdAt: { seconds: 1234567890, nanoseconds: 0 },
    lastLoginAt: { seconds: 1234567890, nanoseconds: 0 },
  };

  const mockMemberUser: User = {
    id: "user2",
    phoneNumber: "+1234567891",
    role: "member",
    houseId: "house1",
    createdAt: { seconds: 1234567890, nanoseconds: 0 },
    lastLoginAt: { seconds: 1234567890, nanoseconds: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PermissionGate", () => {
    it("renders children when user has required permissions", () => {
      mockUseAuth.mockReturnValue({
        user: mockHeadUser,
        loading: false,
        isAuthenticated: true,
        permissions: {
          canEditHouse: (houseId: string) => houseId === "house1",
          canAccessAddHome: true,
          canViewAllHouses: true,
        },
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthState: jest.fn(),
        updateLastLogin: jest.fn(),
        refreshUserData: jest.fn(),
      });

      render(
        <PermissionGate requireRole="head">
          <div>Protected Content</div>
        </PermissionGate>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    it("renders fallback when user lacks required permissions", () => {
      mockUseAuth.mockReturnValue({
        user: mockMemberUser,
        loading: false,
        isAuthenticated: true,
        permissions: {
          canEditHouse: () => false,
          canAccessAddHome: false,
          canViewAllHouses: true,
        },
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthState: jest.fn(),
        updateLastLogin: jest.fn(),
        refreshUserData: jest.fn(),
      });

      render(
        <PermissionGate requireRole="head" fallback={<div>Access Denied</div>}>
          <div>Protected Content</div>
        </PermissionGate>
      );

      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("shows unauthorized message when configured", () => {
      mockUseAuth.mockReturnValue({
        user: mockMemberUser,
        loading: false,
        isAuthenticated: true,
        permissions: {
          canEditHouse: () => false,
          canAccessAddHome: false,
          canViewAllHouses: true,
        },
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthState: jest.fn(),
        updateLastLogin: jest.fn(),
        refreshUserData: jest.fn(),
      });

      render(
        <PermissionGate
          requireAddHomeAccess={true}
          showUnauthorizedMessage={true}
        >
          <div>Protected Content</div>
        </PermissionGate>
      );

      expect(
        screen.getByText("Only heads of family can add or edit residents.")
      ).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("shows loading state when auth is loading", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        isAuthenticated: false,
        permissions: {
          canEditHouse: () => false,
          canAccessAddHome: false,
          canViewAllHouses: false,
        },
        login: jest.fn(),
        logout: jest.fn(),
        checkAuthState: jest.fn(),
        updateLastLogin: jest.fn(),
        refreshUserData: jest.fn(),
      });

      render(
        <PermissionGate requireAuth={true}>
          <div>Protected Content</div>
        </PermissionGate>
      );

      // Check for loading spinner
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });
});
