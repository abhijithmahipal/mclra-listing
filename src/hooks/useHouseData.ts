import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ResidentDetails,
  FilterOptions,
  House,
  HouseWithResidents,
  HouseDataResult,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  validateHouseNumber,
  validateUserHouseAssociation,
} from "@/lib/validation";

export const useHouseData = (filterOptions: FilterOptions): HouseDataResult => {
  const [houses, setHouses] = useState<HouseWithResidents[]>([]);
  const [allResidents, setAllResidents] = useState<ResidentDetails[]>([]);
  const [userHouse, setUserHouse] = useState<HouseWithResidents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated, permissions } = useAuth();

  useEffect(() => {
    const fetchHouseData = async () => {
      if (!isAuthenticated || !user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all houses
        const housesRef = collection(db, "houses");
        const housesQuery = query(housesRef, orderBy("houseNumber", "asc"));
        const housesSnapshot = await getDocs(housesQuery);

        if (housesSnapshot.empty) {
          setHouses([]);
          setAllResidents([]);
          setUserHouse(null);
          setLoading(false);
          return;
        }

        const housesData = housesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as House[];

        // Validate house numbers
        const validHouses = housesData.filter((house) => {
          if (!validateHouseNumber(house.houseNumber)) {
            console.warn(`Invalid house number format: ${house.houseNumber}`);
            return false;
          }
          return true;
        });

        // Fetch all residents
        const residentsRef = collection(db, "residents");
        const residentsQuery = query(
          residentsRef,
          orderBy(filterOptions.sortBy, filterOptions.sortOrder)
        );
        const residentsSnapshot = await getDocs(residentsQuery);

        let residentsData = residentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ResidentDetails[];

        // Apply search filter to residents
        if (filterOptions.searchTerm) {
          residentsData = residentsData.filter((resident) => {
            const searchTerm = filterOptions.searchTerm.toLowerCase();
            return (
              resident.houseName.toLowerCase().includes(searchTerm) ||
              resident.houseNumber.toLowerCase().includes(searchTerm) ||
              resident.street.toLowerCase().includes(searchTerm) ||
              resident.headOfFamily.name.toLowerCase().includes(searchTerm) ||
              resident.headOfFamily.phone.includes(searchTerm) ||
              resident.familyMembers.some(
                (member) =>
                  member.name.toLowerCase().includes(searchTerm) ||
                  member.phone.includes(searchTerm)
              )
            );
          });
        }

        // Organize residents by houses
        const housesWithResidents: HouseWithResidents[] = [];
        let currentUserHouse: HouseWithResidents | null = null;

        for (const house of validHouses) {
          // Validate user-house association for permission checking
          const userCanAccessHouse = validateUserHouseAssociation(user, house);

          if (!userCanAccessHouse && !permissions.canViewAllHouses) {
            // Skip houses the user doesn't have access to
            continue;
          }

          // Get residents for this house
          const houseResidents = residentsData.filter(
            (resident) => resident.houseId === house.id
          );

          // Check if user can edit this house
          const canEdit = permissions.canEditHouse(house.id);
          const isUserHouse = user.houseId === house.id;

          const houseWithResidents: HouseWithResidents = {
            house,
            residents: houseResidents,
            canEdit,
            isUserHouse,
          };

          housesWithResidents.push(houseWithResidents);

          // Set user's house if this is it
          if (isUserHouse) {
            currentUserHouse = houseWithResidents;
          }
        }

        // Validate that user's house exists and is accessible
        if (user.houseId && !currentUserHouse) {
          console.warn("User's house not found or not accessible");
          setError(
            "Your house information is not accessible. Please contact support."
          );
        }

        setHouses(housesWithResidents);
        setAllResidents(residentsData);
        setUserHouse(currentUserHouse);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching house data:", error);

        // Provide specific error messages based on error type
        let errorMessage = "Failed to fetch house data";

        if (error instanceof Error) {
          if (error.message.includes("permission-denied")) {
            errorMessage = "You don't have permission to access this data";
          } else if (error.message.includes("network")) {
            errorMessage =
              "Network error. Please check your connection and try again";
          } else if (error.message.includes("quota-exceeded")) {
            errorMessage =
              "Service temporarily unavailable. Please try again later";
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchHouseData();
  }, [filterOptions, user, isAuthenticated, permissions]);

  return {
    houses,
    allResidents,
    userHouse,
    loading,
    error,
  };
};

// Additional utility hook for fetching specific house data
export const useSpecificHouseData = (houseId: string) => {
  const [houseData, setHouseData] = useState<HouseWithResidents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated, permissions } = useAuth();

  useEffect(() => {
    const fetchSpecificHouse = async () => {
      if (!isAuthenticated || !user || !houseId) {
        setError("Invalid request parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch specific house
        const houseDocRef = doc(db, "houses", houseId);
        const houseDoc = await getDoc(houseDocRef);

        if (!houseDoc.exists()) {
          setError("House not found");
          setLoading(false);
          return;
        }

        const house = { id: houseDoc.id, ...houseDoc.data() } as House;

        // Validate house number
        if (!validateHouseNumber(house.houseNumber)) {
          setError("Invalid house data");
          setLoading(false);
          return;
        }

        // Check user permissions for this house
        const userCanAccessHouse = validateUserHouseAssociation(user, house);

        if (!userCanAccessHouse && !permissions.canViewAllHouses) {
          setError("You don't have permission to access this house");
          setLoading(false);
          return;
        }

        // Fetch residents for this house
        const residentsRef = collection(db, "residents");
        const residentsQuery = query(
          residentsRef,
          where("houseId", "==", houseId),
          orderBy("timestamp", "desc")
        );
        const residentsSnapshot = await getDocs(residentsQuery);

        const residents = residentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ResidentDetails[];

        const canEdit = permissions.canEditHouse(houseId);
        const isUserHouse = user.houseId === houseId;

        setHouseData({
          house,
          residents,
          canEdit,
          isUserHouse,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching specific house data:", error);

        let errorMessage = "Failed to fetch house data";

        if (error instanceof Error) {
          if (error.message.includes("permission-denied")) {
            errorMessage = "You don't have permission to access this house";
          } else if (error.message.includes("network")) {
            errorMessage =
              "Network error. Please check your connection and try again";
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchSpecificHouse();
  }, [houseId, user, isAuthenticated, permissions]);

  return { houseData, loading, error };
};
