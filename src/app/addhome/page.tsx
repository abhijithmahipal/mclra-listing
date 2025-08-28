"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { House } from "@/types";

type Member = {
  name: string;
  relationship: string;
  phone: string;
  occupation: string;
  bloodGroup: string;
};

function AddHomePageContent() {
  const { user } = useAuth();
  const [ownership, setOwnership] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [houseData, setHouseData] = useState<House | null>(null);
  const [loadingHouseData, setLoadingHouseData] = useState(true);

  // Fetch house data for prefilling
  useEffect(() => {
    const fetchHouseData = async () => {
      if (!user?.houseId) {
        setLoadingHouseData(false);
        return;
      }

      try {
        const houseDocRef = doc(db, "houses", user.houseId);
        const houseDoc = await getDoc(houseDocRef);

        if (houseDoc.exists()) {
          setHouseData({ id: houseDoc.id, ...houseDoc.data() } as House);
        }
      } catch (error) {
        console.error("Error fetching house data:", error);
        setError("Failed to load house information");
      } finally {
        setLoadingHouseData(false);
      }
    };

    fetchHouseData();
  }, [user?.houseId]);

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { name: "", relationship: "", phone: "", occupation: "", bloodGroup: "" },
    ]);
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof Member, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as Member;
      return next;
    });
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    // Ensure user is authenticated and is a head of family
    if (!user || user.role !== "head") {
      setError("You must be a head of family to add resident information.");
      setSubmitting(false);
      return;
    }

    // Get the current Firebase user ID
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError("Authentication error. Please log in again.");
      setSubmitting(false);
      return;
    }

    // Ensure house data is loaded
    if (!houseData) {
      setError(
        "House information not loaded. Please refresh the page and try again."
      );
      setSubmitting(false);
      return;
    }

    const data = {
      timestamp: serverTimestamp(),
      houseNumber: String(formData.get("houseNumber") || ""),
      houseName: String(formData.get("houseName") || ""),
      street: String(formData.get("street") || ""),
      ownership: String(formData.get("ownership") || ""),
      permanentAddress: String(formData.get("permanentAddress") || ""),
      ownerAddress: String(formData.get("ownerAddress") || ""),
      floorType: String(formData.get("floorType") || ""),
      totalFamilyMembers: String(formData.get("familyMembers") || ""),
      headOfFamily: {
        name: String(formData.get("headName") || ""),
        phone: String(formData.get("headPhone") || ""),
        emergencyContact: {
          name: String(formData.get("emergencyName") || ""),
          phone: String(formData.get("emergencyPhone") || ""),
        },
        occupation: String(formData.get("headOccupation") || ""),
        bloodGroup: String(formData.get("headBloodGroup") || ""),
      },
      familyMembers: members,
      // Link resident data to user's house
      houseId: user.houseId,
      // Add user tracking fields using Firebase Auth UID
      createdBy: currentUser.uid,
      updatedBy: currentUser.uid,
    };

    try {
      await addDoc(collection(db, "residents"), data);
      setSuccess(true);
      form.reset();
      setMembers([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 text-[--foreground]">
      <div className="rounded-2xl p-6 mb-6 bg-[--card] text-[--card-foreground] backdrop-blur-xl border border-[--border] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        <h1 className="text-2xl font-semibold mb-1">
          Museum Cross Lane Residents Association
        </h1>
        <p className="text-[--muted-foreground]">
          Resident Information Collection Form
        </p>
      </div>

      <div className="rounded-2xl p-6 bg-[--card] text-[--card-foreground] backdrop-blur-xl border border-[--border] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        {loadingHouseData ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--primary] mx-auto mb-4"></div>
              <p className="text-[--muted-foreground]">
                Loading house information...
              </p>
            </div>
          </div>
        ) : !success ? (
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Information Notice
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Some fields are automatically filled from your account
                    information and cannot be edited. This ensures data
                    consistency across the system.
                  </p>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-medium pb-2 border-b border-[--border]">
                Basic Household Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="houseNumber"
                  >
                    House Number*
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    id="houseNumber"
                    name="houseNumber"
                    required
                    value={houseData?.houseNumber || "Loading..."}
                    readOnly
                    placeholder="e.g., 42"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This field is automatically filled from your house
                    registration
                  </p>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="houseName"
                  >
                    House Name
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="houseName"
                    name="houseName"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="street"
                  >
                    Street*
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="street"
                    name="street"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="ownership"
                  >
                    Ownership Status*
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="ownership"
                    name="ownership"
                    required
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="owned">Owned</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>

                {ownership === "rented" && (
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-4 p-4 rounded-md bg-white/50 dark:bg-white/10 border border-[--border]">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="permanentAddress"
                      >
                        Permanent Address (if rented)
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                        id="permanentAddress"
                        name="permanentAddress"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor="ownerAddress"
                      >
                        Owner&apos;s Address (if rented)
                      </label>
                      <input
                        className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                        id="ownerAddress"
                        name="ownerAddress"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="floorType"
                  >
                    Floor Type*
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="floorType"
                    name="floorType"
                    required
                  >
                    <option value="">Select Floor Type</option>
                    <option value="entire">Entire Home</option>
                    <option value="partial">Ground Floor</option>
                    <option value="partial">First Floor</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="familyMembers"
                  >
                    Total Number of Family Members*
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="familyMembers"
                    name="familyMembers"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium pb-2 border-b border-[--border]">
                Head of Family Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="headName"
                  >
                    Name* (Head of Family)
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="headName"
                    name="headName"
                    required
                    placeholder="Enter your full name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your name as the head of family
                  </p>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="headPhone"
                  >
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    id="headPhone"
                    name="headPhone"
                    required
                    value={user?.phoneNumber || "Loading..."}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is your registered phone number
                  </p>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="emergencyName"
                  >
                    Emergency Contact Name*
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="emergencyName"
                    name="emergencyName"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="emergencyPhone"
                  >
                    Emergency Contact Number*
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="headOccupation"
                  >
                    Occupation*
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="headOccupation"
                    name="headOccupation"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="headBloodGroup"
                  >
                    Blood Group*
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                    id="headBloodGroup"
                    name="headBloodGroup"
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium pb-2 border-b border-[--border]">
                Family Members
              </h2>
              <p className="text-[--muted-foreground]">
                Please add details for additional family members (excluding the
                head of family)
              </p>

              <div className="space-y-4">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-md bg-white/50 dark:bg-white/10 border border-[--border]"
                  >
                    <h3 className="font-medium mb-3">
                      Family Member {index + 1}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Name
                        </label>
                        <input
                          value={member.name}
                          onChange={(e) =>
                            updateMember(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Relationship to Head
                        </label>
                        <input
                          value={member.relationship}
                          onChange={(e) =>
                            updateMember(index, "relationship", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={member.phone}
                          onChange={(e) =>
                            updateMember(index, "phone", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Occupation
                        </label>
                        <input
                          value={member.occupation}
                          onChange={(e) =>
                            updateMember(index, "occupation", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Blood Group
                        </label>
                        <select
                          value={member.bloodGroup}
                          onChange={(e) =>
                            updateMember(index, "bloodGroup", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent focus:ring-2 focus:ring-[--ring] outline-none"
                        >
                          <option value="">Select Blood Group</option>
                          {[
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "AB+",
                            "AB-",
                            "O+",
                            "O-",
                          ].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="px-3 py-2 rounded-lg text-[#475569] bg-[#e2e8f0] hover:bg-[#cbd5e1] transition-all shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addMember}
                className="px-3 py-2 rounded-lg text-[#475569] bg-[#e2e8f0] hover:bg-[#cbd5e1] transition-all shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
              >
                Add Family Member
              </button>
            </section>

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={submitting}
                type="submit"
                className="px-4 py-2 rounded-lg text-white bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-60 transition-all shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
              >
                {submitting ? "Submitting..." : "Submit Information"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-600 text-white">
                {error}
              </div>
            )}
          </form>
        ) : (
          <div className="p-4 rounded-md bg-[--accent] text-white">
            <h3 className="text-lg font-semibold">Thank you!</h3>
            <p>Your information has been successfully submitted.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AddHomePage() {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireRole="head"
      unauthorizedMessage="Only heads of family can add resident information. Please contact your house head if you need to add or update resident details."
    >
      <AddHomePageContent />
    </ProtectedRoute>
  );
}
