import React from 'react';
import { TrendingUp, Users, Award, Clock, HelpCircle } from 'lucide-react';
import { TeamMetric } from '../../services/dashboard/types';

interface Props {
  metrics: TeamMetric[];
}

export const MetricsOverview: React.FC<Props> = ({ metrics }) => {
  // Calculate aggregated metrics across all teams
  const aggregatedMetrics = metrics.reduce((acc, metric) => ({
    activeAthletes: acc.activeAthletes + metric.activeAthletes,
    attendanceRate: acc.attendanceRate + metric.attendanceRate,
    performanceScore: acc.performanceScore + metric.performanceScore,
    awardsGiven: acc.awardsGiven + metric.awardsGiven
  }), {
    activeAthletes: 0,
    attendanceRate: 0,
    performanceScore: 0,
    awardsGiven: 0
  });

  // Calculate averages for percentage-based metrics
  if (metrics.length > 0) {
    aggregatedMetrics.attendanceRate /= metrics.length;
    aggregatedMetrics.performanceScore /= metrics.length;
  }

  const displayMetrics = [
    {
      id: 1,
      label: 'Active Athletes',
      value: aggregatedMetrics.activeAthletes.toString(),
      icon: Users,
      color: 'text-brand-info',
      tooltip: 'Total number of registered and active players across all teams'
    },
    {
      id: 2,
      label: 'Practice Attendance',
      value: `${Math.round(aggregatedMetrics.attendanceRate)}%`,
      icon: Clock,
      color: 'text-brand-success',
      tooltip: 'Average attendance rate at practice sessions over the last 30 days'
    },
    {
      id: 3,
      label: 'Team Performance',
      value: `${Math.round(aggregatedMetrics.performanceScore)}%`,
      icon: TrendingUp,
      color: 'text-brand-primary',
      tooltip: 'Overall performance score based on multiple factors'
    },
    {
      id: 4,
      label: 'Awards Given',
      value: aggregatedMetrics.awardsGiven.toString(),
      icon: Award,
      color: 'text-brand-accent',
      tooltip: 'Total number of achievement awards given to players'
    }
  ];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-brand-dark mb-4">Performance Metrics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {displayMetrics.map((metric) => (
          <div key={metric.id} className="p-4 bg-brand-light rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <div className="relative group">
                  <span className="text-sm text-brand-dark">{metric.label}</span>
                  <button 
                    className="ml-1 inline-flex items-center"
                    aria-label="Show metric info"
                  >
                    <HelpCircle className="w-4 h-4 text-brand-muted hover:text-brand-dark" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 sm:w-64 
                      bg-brand-dark text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 pointer-events-none z-50">
                      {metric.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                        border-4 border-transparent border-t-brand-dark" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-brand-dark">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-brand-muted mt-4">
        * Metrics are updated daily and reflect team performance over the last 30 days
      </p>
    </div>
  );
};