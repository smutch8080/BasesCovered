import React from 'react';
import { VolunteerStats } from '../../types/volunteer';
import { Award, Calendar, Clock } from 'lucide-react';

interface Props {
  stats: VolunteerStats;
}

export const VolunteerStatsCard: React.FC<Props> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Total Hours</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalHours}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold">Events</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.eventsVolunteered}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <Award className="w-5 h-5" />
            <h3 className="font-semibold">Last Active</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {stats.lastVolunteered ? new Date(stats.lastVolunteered).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">Role Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(stats.roleBreakdown).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between">
              <span className="text-gray-600">{role}</span>
              <div className="flex items-center gap-4">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-primary rounded-full h-2"
                    style={{
                      width: `${(count / stats.eventsVolunteered) * 100}%`
                    }}
                  />
                </div>
                <span className="text-gray-800 font-medium w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};