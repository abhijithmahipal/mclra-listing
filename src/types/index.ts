export interface FamilyMember {
  name: string;
  relationship: string;
  phone: string;
  occupation: string;
  bloodGroup: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface HeadOfFamily {
  name: string;
  phone: string;
  occupation: string;
  bloodGroup: string;
  emergencyContact: EmergencyContact;
}

export interface ResidentDetails {
  id: string;
  houseName: string;
  houseNumber: string;
  street: string;
  ownership: string;
  floorType: string;
  totalFamilyMembers: string;
  headOfFamily: HeadOfFamily;
  familyMembers: FamilyMember[];
  permanentAddress: string;
  ownerAddress: string;
  houseId: string; // Reference to house document
  createdBy: string; // User ID who created this record
  updatedBy: string; // User ID who last updated this record
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface FilterOptions {
  searchTerm: string;
  sortBy: "houseName" | "houseNumber" | "street" | "timestamp";
  sortOrder: "asc" | "desc";
}

// House data organization types
export interface HouseWithResidents {
  house: House;
  residents: ResidentDetails[];
  canEdit: boolean;
  isUserHouse: boolean;
}

export interface HouseDataResult {
  houses: HouseWithResidents[];
  allResidents: ResidentDetails[];
  userHouse: HouseWithResidents | null;
  loading: boolean;
  error: string | null;
}
// Authentication and Authorization Types

export interface User {
  id: string; // Firebase Auth UID
  phoneNumber: string;
  role: "head" | "member";
  houseId: string; // Reference to house document
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  lastLoginAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface House {
  id: string; // Auto-generated document ID
  houseNumber: string; // Alphanumeric identifier
  headOfFamilyId: string; // Reference to user document
  memberIds: string[]; // Array of user document IDs
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  permissions: {
    canEditHouse: (houseId: string) => boolean;
    canAccessAddHome: boolean;
    canViewAllHouses: boolean;
  };
}
