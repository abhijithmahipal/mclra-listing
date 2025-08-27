'use client';

import Link from 'next/link';
import { ResidentDetails } from '@/types';

export function ResidentCard({ resident }: { resident: ResidentDetails }) {
  return (
    <Link
      href={`/houses/${resident.id}`}
      className="block group"
    >
      <div className="rounded-2xl border border-[--border] bg-[--card] text-[--card-foreground] backdrop-blur-xl transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:border-blue-500/40 hover:-translate-y-0.5">
        <div className="p-6">
          {/* House Number Badge */}
          <div className="inline-block px-3 py-1 bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-md mb-3 border border-blue-500/25">
            House #{resident.houseNumber}
          </div>

          {/* House Name & Location */}
          <h2 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {resident.houseName}
          </h2>
          <p className="text-sm mt-1 text-[--muted-foreground]">
            Street {resident.street}
          </p>

          {/* Head of Family Info */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/15 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400 font-medium border border-blue-500/25">
                {resident.headOfFamily.name.charAt(0)}
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          </div>

          {/* View Details */}
          <div className="mt-4 pt-4 border-t border-[--border] flex justify-end">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
