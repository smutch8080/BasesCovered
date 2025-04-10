import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ScheduleWidget } from '../components/dashboard/ScheduleWidget';
import { UpdatesFeed } from '../components/dashboard/UpdatesFeed';
import { MessageCenter } from '../components/dashboard/MessageCenter';
import { TodoWidget } from '../components/dashboard/TodoWidget';
import { TeamsList } from '../components/dashboard/TeamsList';
import { fetchDashboardData } from '../services/dashboard';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function ParentDashboardPage() {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const data = await fetchDashboardData(currentUser);
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Unable to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  if (isLoading) {
    return (
      <PageLayout className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-gray-50">
      <DashboardHeader user={currentUser} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <TeamsList 
              teams={dashboardData?.teams || []}
              pendingRequests={dashboardData?.pendingRequests || []}
            />
            <ScheduleWidget sessions={dashboardData?.sessions || []} />
            <UpdatesFeed updates={dashboardData?.activities || []} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MessageCenter messages={dashboardData?.messages || []} />
            <TodoWidget userId={currentUser.id} />
            
            {/* Find Teams CTA */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <Users className="w-12 h-12 text-brand-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Find Teams</h3>
                <p className="text-gray-600 mb-4">
                  Looking for teams in your area? Browse available teams and submit join requests.
                </p>
                <Link
                  to="/teams/find"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90"
                >
                  Browse Teams
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}