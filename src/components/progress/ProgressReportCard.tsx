import React from 'react';
import { Calendar, ClipboardList } from 'lucide-react';
import { ProgressReport } from '../../types/progress';
import { Link } from 'react-router-dom';

interface Props {
  report: ProgressReport;
}

export const ProgressReportCard: React.FC<Props> = ({ report }) => {
  const getSkillColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(report.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {Object.entries(report.skills).map(([skill, rating]) => (
          <div key={skill} className="space-y-1">
            <div className="text-sm font-medium text-gray-600">
              {skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </div>
            {rating.notApplicable ? (
              <div className="text-gray-500">N/A</div>
            ) : (
              <div className={`text-lg font-semibold ${getSkillColor(rating.value!)}`}>
                {rating.value}/10
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Pros</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{report.pros}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Cons</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{report.cons}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Areas for Focus</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{report.areasForFocus}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Goals</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{report.goals}</p>
        </div>
      </div>

      {report.practicePlans && report.practicePlans.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Practice Plans</h3>
          <div className="space-y-2">
            {report.practicePlans.map((plan) => (
              <Link
                key={plan.id}
                to={`/practice-plan/${plan.id}`}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-brand-primary hover:bg-gray-100"
              >
                <ClipboardList className="w-4 h-4" />
                {plan.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};