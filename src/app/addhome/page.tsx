'use client';

import { useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type Member = {
  name: string;
  relationship: string;
  phone: string;
  occupation: string;
  bloodGroup: string;
};

export default function AddHomePage() {
  const [ownership, setOwnership] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <h1 className="text-2xl font-semibold mb-1">Museum Cross Lane Residents Association</h1>
        <p className="text-[--muted-foreground]">Resident Information Collection Form</p>
      </div>

      <div className="rounded-2xl p-6 bg-[--card] text-[--card-foreground] backdrop-blur-xl border border-[--border] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        {!success ? (
          <form onSubmit={onSubmit} className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-xl font-medium pb-2 border-b border-[--border]">Basic Household Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="houseNumber">House Number*</label>
                  <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="houseNumber" name="houseNumber" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="houseName">House Name</label>
                  <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="houseName" name="houseName" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="street">Street*</label>
                  <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="street" name="street" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="ownership">Ownership Status*</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent"
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
                      <label className="block text-sm font-medium mb-1" htmlFor="permanentAddress">Permanent Address (if rented)</label>
                      <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="permanentAddress" name="permanentAddress" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="ownerAddress">Owner&apos;s Address (if rented)</label>
                      <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="ownerAddress" name="ownerAddress" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="floorType">Floor Type*</label>
                  <select className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="floorType" name="floorType" required>
                    <option value="">Select Floor Type</option>
                    <option value="entire">Entire Home</option>
                    <option value="partial">Ground Floor</option>
                    <option value="partial">First Floor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="familyMembers">Total Number of Family Members*</label>
                  <input type="number" min={1} className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="familyMembers" name="familyMembers" required />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium pb-2 border-b border-[--border]">Head of Family Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="headName">Name*</label>
                  <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="headName" name="headName" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="headPhone">Phone Number*</label>
                  <input type="tel" className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="headPhone" name="headPhone" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="emergencyName">Emergency Contact Name*</label>
                  <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="emergencyName" name="emergencyName" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="emergencyPhone">Emergency Contact Number*</label>
                  <input type="tel" className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="emergencyPhone" name="emergencyPhone" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="headOccupation">Occupation*</label>
                  <input className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="headOccupation" name="headOccupation" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="headBloodGroup">Blood Group*</label>
                  <select className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" id="headBloodGroup" name="headBloodGroup" required>
                    <option value="">Select Blood Group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium pb-2 border-b border-[--border]">Family Members</h2>
              <p className="text-[--muted-foreground]">Please add details for additional family members (excluding the head of family)</p>

              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="p-4 rounded-md bg-white/50 dark:bg-white/10 border border-[--border]">
                    <h3 className="font-medium mb-3">Family Member {index + 1}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input value={member.name} onChange={(e) => updateMember(index, 'name', e.target.value)} className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Relationship to Head</label>
                        <input value={member.relationship} onChange={(e) => updateMember(index, 'relationship', e.target.value)} className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input type="tel" value={member.phone} onChange={(e) => updateMember(index, 'phone', e.target.value)} className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Occupation</label>
                        <input value={member.occupation} onChange={(e) => updateMember(index, 'occupation', e.target.value)} className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Blood Group</label>
                        <select value={member.bloodGroup} onChange={(e) => updateMember(index, 'bloodGroup', e.target.value)} className="w-full px-3 py-2 rounded-md border border-[--border] bg-transparent">
                          <option value="">Select Blood Group</option>
                          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button type="button" onClick={() => removeMember(index)} className="px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addMember} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Add Family Member</button>
            </section>

            <div className="flex items-center justify-between pt-2">
              <button type="reset" className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Reset Form</button>
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Information'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-600 text-white">{error}</div>
            )}
          </form>
        ) : (
          <div className="p-4 rounded-md bg-green-600 text-white">
            <h3 className="text-lg font-semibold">Thank you!</h3>
            <p>Your information has been successfully submitted.</p>
          </div>
        )}
      </div>
    </main>
  );
}


