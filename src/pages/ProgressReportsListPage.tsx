import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProgressReport } from '../types/progress';
import { ProgressReportCard } from '../components/progress/ProgressReportCard';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function ProgressReportsListPage() {
  const { teamId, playerId } = useParams();
  const location = useLocation();
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadReports = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const reportsRef = collection(db, 'progress_reports');
        let constraints = [];

        // Determine which reports to fetch based on user role and context
        if (currentUser.role === 'player') {
          // Players see their own reports
          constraints = [
            where('playerId', '==', currentUser.id),
            orderBy('date', 'desc')
          ];
        } else if (currentUser.role === 'parent') {
          // Parents see their child's reports
          if (playerId) {
            constraints = [
              where('playerId', '==', playerId),
              orderBy('date', 'desc')
            ];
          } else {
            // If no specific player, show no reports for parents
            constraints = [
              orderBy('date', 'desc')
            ];
          }
        } else if (currentUser.role === 'coach' || currentUser.role === 'admin') {
          // Coaches see reports for specific player/team
          if (playerId && teamId) {
            constraints = [
              where('playerId', '==', playerId),
              where('teamId', '==', teamId),
              orderBy('date', 'desc')
            ];
          } else if (teamId) {
            // If no specific player, show all team reports
            constraints = [
              where('teamId', '==', teamId),
              orderBy('date', 'desc')
            ];
          } else {
            // If no team specified, show all reports for coach
            constraints = [
              orderBy('date', 'desc')
            ];
          }
        }

        const q = query(reportsRef, ...constraints);
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
  }, [currentUser, playerId, teamId]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please sign in to view progress reports</p>
      </div>
    );
  }

  const isCoach = currentUser.role === 'coach' || currentUser.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {isCoach && teamId && (
            <Link
              to={`/teams/${teamId}`}
              className="flex items-center gap-2 text-brand-primary hover:opacity-90"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Team
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            Progress Reports
          </h1>
        </div>

        {isCoach && playerId && teamId && (
          <Link
            to={`/teams/${teamId}/players/${playerId}/progress/new`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg
              hover:opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Progress Report
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading progress reports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map((report) => (
            <ProgressReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No progress reports found</p>
        </div>
      )}
    </div>
  );
}

export default ProgressReportsListPage;