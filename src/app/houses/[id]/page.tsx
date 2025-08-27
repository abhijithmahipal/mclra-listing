'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ResidentDetails } from '@/types';
import Link from 'next/link';

type PageProps = {
  params: {
    id: string;
  };
};

export default function ResidentDetailPage({ params }: PageProps) {
  const [resident, setResident] = useState<ResidentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const docRef = doc(db, 'residents', params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setResident({ id: docSnap.id, ...docSnap.data() } as ResidentDetails);
        } else {
          setError('Resident not found');
        }
      } catch (err: unknown) {
        console.error('Error fetching resident:', err);
        setError('Failed to fetch resident details');
      } finally {
        setLoading(false);
      }
    };

    fetchResident();
  }, [params.id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-red-500 mb-4">{error}</div>
      <Link href="/houses" className="text-blue-500 hover:underline">← Back to Directory</Link>
    </div>
  );

  if (!resident) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link 
          href="/houses" 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">{resident.houseName}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                House No: {resident.houseNumber}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Street: {resident.street}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                {resident.totalFamilyMembers} Members
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-8">
          <div className="grid gap-8">
            {/* Head of Family Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Head of Family</h2>
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{resident.headOfFamily.name}</h3>
                    <p className="text-blue-600 font-medium">{resident.headOfFamily.occupation || 'Not specified'}</p>
                  </div>
                  <a
                    href={`tel:${resident.headOfFamily.phone}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <span className="text-2xl">📞</span>
                    <span className="underline font-medium">{resident.headOfFamily.phone}</span>
                  </a>
                </div>
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="bg-white px-4 py-2 rounded-lg">
                    <span className="text-gray-500">Blood Group:</span>
                    <span className="ml-2 font-medium text-gray-900">{resident.headOfFamily.bloodGroup}</span>
                  </div>
                </div>
                {resident.headOfFamily.emergencyContact && (
                  <div className="mt-6 bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-gray-500 mb-2">Emergency Contact</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{resident.headOfFamily.emergencyContact.name}</span>
                      <a
                        href={`tel:${resident.headOfFamily.emergencyContact.phone}`}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                      >
                        <span>📞</span>
                        {resident.headOfFamily.emergencyContact.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Family Members Section */}
            {resident.familyMembers.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Family Members</h2>
                <div className="grid gap-4">
                  {resident.familyMembers.map((member, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-blue-600 font-medium">{member.relationship}</p>
                          {member.occupation && (
                            <p className="text-gray-600 mt-1">{member.occupation}</p>
                          )}
                        </div>
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          >
                            <span className="text-2xl">📞</span>
                            <span className="underline font-medium">{member.phone}</span>
                          </a>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="inline-block bg-white px-3 py-1 rounded-lg border border-gray-100">
                          <span className="text-gray-500">Blood Group:</span>
                          <span className="ml-2 font-medium text-gray-900">{member.bloodGroup}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* House Details Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">House Details</h2>
              <div className="grid gap-4 p-6 rounded-xl bg-gray-50 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <span className="text-gray-500">Floor Type:</span>
                    <span className="ml-2 capitalize font-medium text-gray-900">{resident.floorType}</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <span className="text-gray-500">Ownership:</span>
                    <span className="ml-2 capitalize font-medium text-gray-900">{resident.ownership}</span>
                  </div>
                </div>
                {resident.permanentAddress && (
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <span className="text-gray-500">Permanent Address:</span>
                    <span className="ml-2 font-medium text-gray-900">{resident.permanentAddress}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
