'use client';

import { useState } from 'react';
import { useHouseData } from '@/hooks/useHouseData';
import { FilterOptions } from '@/types';
import { ResidentCard } from '@/components/ResidentCard';

export default function HomePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    sortBy: 'houseName',
    sortOrder: 'asc'
  });

  const { residents, loading, error } = useHouseData(filterOptions);

  const handleSearch = (term: string) => {
    setFilterOptions(prev => ({ ...prev, searchTerm: term }));
  };

  const handleSort = (field: 'houseName' | 'houseNumber' | 'street' | 'timestamp') => {
    setFilterOptions(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Resident Directory</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${
                view === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${
                view === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by house name, number, member name, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['houseName', 'houseNumber', 'street'] as const).map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterOptions.sortBy === field
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {field === 'houseName' ? 'House Name' : field === 'houseNumber' ? 'House Number' : 'Street'}
                {filterOptions.sortBy === field && (
                  <span className="ml-1">
                    {filterOptions.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          view === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {residents.map((resident) => (
            <ResidentCard
              key={resident.id}
              resident={resident}
            />
          ))}
        </div>
      )}
    </main>
  );
}
