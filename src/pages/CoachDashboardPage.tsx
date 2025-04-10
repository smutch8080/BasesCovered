import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ScheduleWidget } from '../components/dashboard/ScheduleWidget';
import { AthleteSearch } from '../components/dashboard/AthleteSearch';
import { TeamRoster } from '../components/dashboard/TeamRoster';
import { UpdatesFeed } from '../components/dashboard/UpdatesFeed';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { MessageCenter } from '../components/dashboard/MessageCenter';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { TodoWidget } from '../components/dashboard/TodoWidget';
import { TeamsList } from '../components/dashboard/TeamsList';
import { PlanTemplatesWidget } from '../components/dashboard/PlanTemplatesWidget';
import { CTADisplay } from '../components/cta/CTADisplay';
import { fetchDashboardData } from '../services/dashboard';
import { fetchTeamMetrics } from '../services/dashboard/metrics';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function CoachDashboardPage() {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const [data, teamMetrics] = await Promise.all([
          fetchDashboardData(currentUser),
          fetchTeamMetrics(currentUser)
        ]);

        setDashboardData(data);
        setMetrics(teamMetrics);
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
            <PlanTemplatesWidget />
            <ScheduleWidget sessions={dashboardData?.sessions || []} />
            <MetricsOverview metrics={metrics || []} />
            <CTADisplay locationId="dashboard" className="mb-8" />
            <UpdatesFeed updates={dashboardData?.activities || []} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MessageCenter messages={dashboardData?.messages || []} />
            <TodoWidget userId={currentUser.id} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <AthleteSearch />
          </div>
          <div>
            <TeamRoster />
          </div>
        </div>
      </main>
    </PageLayout>
  );
}