import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ScheduleWidget } from '../components/dashboard/ScheduleWidget';
import { UpdatesFeed } from '../components/dashboard/UpdatesFeed';
import { MessageCenter } from '../components/dashboard/MessageCenter';
import { HomeworkList } from '../components/homework/HomeworkList';
import { PlayerProgressChart } from '../components/players/PlayerProgressChart';
import { PlayerAchievements } from '../components/players/PlayerAchievements';
import { PlayerSummary } from '../components/dashboard/PlayerSummary';
import { TodoWidget } from '../components/dashboard/TodoWidget';
import { TeamsList } from '../components/dashboard/TeamsList';
import { fetchDashboardData } from '../services/dashboard';
import { fetchUserHomework } from '../services/homeworkService';
import { fetchPlayerAwards } from '../services/awards/player';
import { Link } from 'react-router-dom';
import { Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layout/PageLayout';

export default function PlayerDashboardPage() {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [homework, setHomework] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const [data, homeworkData, awardsData] = await Promise.all([
          fetchDashboardData(currentUser),
          fetchUserHomework(currentUser),
          fetchPlayerAwards(currentUser.id)
        ]);

        setDashboardData(data);
        setHomework(homeworkData);
        setAwards(awardsData);
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
            <PlayerProgressChart reports={dashboardData?.reports || []} />
            <UpdatesFeed updates={dashboardData?.activities || []} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MessageCenter messages={dashboardData?.messages || []} />
            <TodoWidget userId={currentUser.id} />
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-lg font-semibold text-gray-800">Homework</h2>
                </div>
                <Link
                  to="/homework"
                  className="text-brand-primary hover:opacity-90 text-sm"
                >
                  View All
                </Link>
              </div>
              <HomeworkList 
                homework={homework.slice(0, 3)} // Show only 3 most recent
                playerId={currentUser.id}
              />
            </div>
            <PlayerAchievements awards={awards} />
          </div>
        </div>
      </main>
    </PageLayout>
  );
}