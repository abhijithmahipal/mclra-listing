'use client';

import Link from 'next/link';
import { ResidentDetails } from '@/types';
import { Phone, ArrowRight, MapPin, Home, User } from 'lucide-react';

export function ResidentCard({ resident }: { resident: ResidentDetails }) {
  return (
    <Link
      href={`/houses/${resident.id}`}
      className="block group"
    >
      <div className="rounded-2xl border border-[--border] bg-[--card] text-[--card-foreground] backdrop-blur-xl transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:border-blue-500/40 hover:-translate-y-0.5">
        <div className="p-6">
          {/* House Number Badge */
          }
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-md border border-blue-500/25">
              <Home className="w-3.5 h-3.5" />
              <span>House #{resident.houseNumber}</span>
            </div>
          </div>

          {/* House Name & Location */}
          <h2 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {resident.houseName}
          </h2>
          <p className="text-sm mt-1 text-[--muted-foreground] inline-flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Street {resident.street}
          </p>

          {/* Head of Family Info */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/15 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 font-medium border border-blue-500/25">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{resident.headOfFamily.name}</p>
                <p className="text-xs text-[--muted-foreground]">{resident.totalFamilyMembers} family members</p>
              </div>
            </div>
            <a
              href={`tel:${resident.headOfFamily.phone}`}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 rounded-lg transition-colors border border-transparent hover:border-blue-500/25"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>

          {/* View Details */}
          <div className="mt-4 pt-4 border-t border-[--border] flex justify-end">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
              View Details
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
