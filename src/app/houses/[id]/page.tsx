'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ResidentDetails } from '@/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ResidentDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [resident, setResident] = useState<ResidentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResident = async () => {
      if (!id) {
        setError('No resident ID provided');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'residents', id);
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
  }, [id]);

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/houses" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Directory
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{resident.houseName}</h1>
              <p className="text-lg text-gray-600 mt-1">House #{resident.houseNumber}, Street {resident.street}</p>
            </div>
            <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {resident.totalFamilyMembers} Members
            </span>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-gray-600">
              <p>Floor Type: {resident.floorType}</p>
              <p>Ownership: {resident.ownership}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Head of Family</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-semibold">
                {resident.headOfFamily.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-medium">{resident.headOfFamily.name}</h3>
                <p className="text-gray-600">{resident.headOfFamily.occupation || 'Occupation not specified'}</p>
                <div className="mt-2 flex items-center gap-4">
                  <a
                    href={`tel:${resident.headOfFamily.phone}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {resident.headOfFamily.phone}
                  </a>
                  <span className="text-gray-600">Blood Group: {resident.headOfFamily.bloodGroup}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {resident.familyMembers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Family Members</h2>
            <div className="space-y-4">
              {resident.familyMembers.map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-gray-600 text-sm">{member.relationship}</p>
                      {member.occupation && (
                        <p className="text-gray-600 text-sm">{member.occupation}</p>
                      )}
                      <div className="mt-1 flex items-center gap-4">
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {member.phone}
                          </a>
                        )}
                        <span className="text-gray-600 text-sm">Blood Group: {member.bloodGroup}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resident.headOfFamily.emergencyContact && (
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium">
                  {resident.headOfFamily.emergencyContact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium">{resident.headOfFamily.emergencyContact.name}</h3>
                  <a
                    href={`tel:${resident.headOfFamily.emergencyContact.phone}`}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {resident.headOfFamily.emergencyContact.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}