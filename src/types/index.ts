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
