'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ResidentDetails } from '@/types';
import Link from 'next/link';
import { MapPin, Users, Phone, User, Home, ArrowLeft } from 'lucide-react';
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--foreground]/80"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8 text-[--foreground]">
      <div className="text-red-500 mb-4">{error}</div>
      <Link href="/houses" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Directory</Link>
    </div>
  );

  if (!resident) return null;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 text-[--foreground]">
      <div className="mb-4 sm:mb-6">
        <Link href="/houses" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Directory
        </Link>
      </div>

      <div className="rounded-2xl p-4 sm:p-6 bg-[--card] text-[--card-foreground] backdrop-blur-xl border border-[--border] shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        <div className="border-b border-[--border] pb-4 sm:pb-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{resident.houseName}</h1>
              <p className="text-sm sm:text-lg text-[--muted-foreground] mt-1 inline-flex items-center gap-1.5 sm:gap-2">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" /> House #{resident.houseNumber}
                <span className="opacity-50">•</span>
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> Street {resident.street}
              </p>
            </div>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-full text-xs sm:text-sm font-medium border border-blue-500/25">
              <Users className="inline w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> {resident.totalFamilyMembers} Members
            </span>
          </div>
          
          <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="text-[--muted-foreground] text-sm sm:text-base">
              <p>Floor Type: {resident.floorType}</p>
              <p>Ownership: {resident.ownership}</p>
              {resident.ownership === 'rented' && (resident.permanentAddress || resident.ownerAddress) && (
                <div className="mt-2 text-xs sm:text-sm space-y-1">
                  {resident.permanentAddress && (
                    <p>Permanent Address: {resident.permanentAddress}</p>
                  )}
                  {resident.ownerAddress && (
                    <p>Owner Address: {resident.ownerAddress}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Head of Family</h2>
          <div className="rounded-2xl p-3 sm:p-4 bg-[--card] text-[--card-foreground] backdrop-blur-xl border border-[--border]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-500/15 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 text-lg sm:text-xl font-semibold border border-blue-500/25">
                <User className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium">{resident.headOfFamily.name}</h3>
                <p className="text-[--muted-foreground]">{resident.headOfFamily.occupation || 'Occupation not specified'}</p>
                <div className="mt-2 flex items-center gap-4">
                  <a
                    href={`tel:${resident.headOfFamily.phone}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 text-sm sm:text-base"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {resident.headOfFamily.phone}
                  </a>
                  <span className="text-[--muted-foreground] text-sm sm:text-base">Blood Group: {resident.headOfFamily.bloodGroup}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {resident.familyMembers.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Family Members</h2>
            <div className="space-y-3 sm:space-y-4">
              {resident.familyMembers.map((member, index) => (
                <div key={index} className="rounded-2xl p-3 sm:p-4 bg-[--card] text-[--card-foreground] backdrop-blur-xl border border-[--border]">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-500/15 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 font-medium border border-blue-500/25">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-medium">{member.name}</h3>
                      <p className="text-[--muted-foreground] text-xs sm:text-sm">{member.relationship}</p>
                      {member.occupation && (
                        <p className="text-[--muted-foreground] text-xs sm:text-sm">{member.occupation}</p>
                      )}
                      <div className="mt-1 flex items-center gap-4">
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {member.phone}
                          </a>
                        )}
                        <span className="text-[--muted-foreground] text-xs sm:text-sm">Blood Group: {member.bloodGroup}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resident.headOfFamily.emergencyContact && (
          <div className="mt-8 pt-6 border-t border-[--border]">
            <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
            <div className="rounded-2xl p-4 border border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-red-500/15 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 font-medium border border-red-500/25">
                  {resident.headOfFamily.emergencyContact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium">{resident.headOfFamily.emergencyContact.name}</h3>
                  <a
                    href={`tel:${resident.headOfFamily.emergencyContact.phone}`}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1 mt-1"
                  >
                    <Phone className="w-4 h-4" />
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