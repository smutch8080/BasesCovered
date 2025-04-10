import React from 'react';
import { ProgressReport } from '../../types/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  reports: ProgressReport[];
}

export const PlayerProgressChart: React.FC<Props> = ({ reports }) => {
  const latestReport = reports[0];
  if (!latestReport) return null;

  const skillData = Object.entries(latestReport.skills)
    .filter(([_, rating]) => !rating.notApplicable)
    .map(([skill, rating]) => ({
      name: skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: rating.value
    }))
    .sort((a, b) => b.value! - a.value!);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Skills Assessment</h2>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={skillData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 10]} />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Areas of Focus</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{latestReport.areasForFocus}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Goals</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{latestReport.goals}</p>
        </div>
      </div>
    </div>
  );
};