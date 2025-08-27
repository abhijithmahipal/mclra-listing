'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestPage() {
  const [testData, setTestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'residents'));
        console.log('Total documents:', querySnapshot.size);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTestData(docs);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      }
    };

    fetchTestData();
  }, []);

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!testData) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Firebase Connection Test</h1>
      <div className="mb-4">Found {testData.length} documents</div>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(testData[0], null, 2)}
      </pre>
    </div>
  );
}
