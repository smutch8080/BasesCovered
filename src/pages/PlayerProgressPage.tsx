import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProgressReport } from '../types/progress';
import { ProgressReportCard } from '../components/progress/ProgressReportCard';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function PlayerProgressPage() {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadReports = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const reportsRef = collection(db, 'progress_reports');
        const q = query(
          reportsRef,
          where('playerId', '==', currentUser.id),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const loadedReports: ProgressReport[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedReports.push({
            ...data,
            id: doc.id,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as ProgressReport);
        });

        setReports(loadedReports);
      } catch (error) {
        console.error('Error loading progress reports:', error);
        toast.error('Unable to load progress reports');
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view progress reports</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Progress Reports
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading progress reports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map((report) => (
            <ProgressReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No progress reports yet</p>
        </div>
      )}
    </div>
  );
}

export default PlayerProgressPage;