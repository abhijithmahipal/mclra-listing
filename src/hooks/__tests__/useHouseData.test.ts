import {
  validateHouseNumber,
  validateUserHouseAssociation,
} from "@/lib/validation";
import { User, House } from "@/types";

// Mock data for testing
const mockUser: User = {
  id: "user123",
  phoneNumber: "+919876543210",
  role: "head",
  houseId: "house123",
  createdAt: { seconds: 1640995200, nanoseconds: 0 },
  lastLoginAt: { seconds: 1640995200, nanoseconds: 0 },
};

const mockHouse: House = {
  id: "house123",
  houseNumber: "96A",
  headOfFamilyId: "user123",
  memberIds: ["user123", "user456"],
  createdAt: { seconds: 1640995200, nanoseconds: 0 },
  updatedAt: { seconds: 1640995200, nanoseconds: 0 },
};

describe("Data Layer Validation", () => {
  describe("validateHouseNumber", () => {
    it("should validate correct house numbers", () => {
      expect(validateHouseNumber("96")).toBe(true);
      expect(validateHouseNumber("96A")).toBe(true);
      expect(validateHouseNumber("B-12")).toBe(true);
      expect(validateHouseNumber("123")).toBe(true);
    });

    it("should reject invalid house numbers", () => {
      expect(validateHouseNumber("")).toBe(false);
      expect(validateHouseNumber("   ")).toBe(false);
      expect(validateHouseNumber("96@")).toBe(false);
      expect(validateHouseNumber("96 A")).toBe(false);
    });
  });

  describe("validateUserHouseAssociation", () => {
    it("should validate head of family association", () => {
      expect(validateUserHouseAssociation(mockUser, mockHouse)).toBe(true);
    });

    it("should validate member association", () => {
      const memberUser: User = {
        ...mockUser,
        id: "user456",
        role: "member",
      };
      expect(validateUserHouseAssociation(memberUser, mockHouse)).toBe(true);
    });

    it("should reject non-associated users", () => {
      const nonAssociatedUser: User = {
        ...mockUser,
        id: "user789",
        role: "member",
      };
      expect(validateUserHouseAssociation(nonAssociatedUser, mockHouse)).toBe(
        false
      );
    });
  });
});
