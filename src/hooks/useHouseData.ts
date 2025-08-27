import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ResidentDetails, FilterOptions } from "@/types";

export const useHouseData = (filterOptions: FilterOptions) => {
  const [residents, setResidents] = useState<ResidentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const residentsRef = collection(db, "residents");
        const q = query(
          residentsRef,
          orderBy(filterOptions.sortBy, filterOptions.sortOrder)
        );
        const querySnapshot = await getDocs(q);

        let allResidents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ResidentDetails[];

        // Apply search filter
        allResidents = allResidents.filter((resident) => {
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

        setResidents(allResidents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch resident data");
        setLoading(false);
      }
    };

    fetchResidents();
  }, [filterOptions]);

  return { residents, loading, error };
};
