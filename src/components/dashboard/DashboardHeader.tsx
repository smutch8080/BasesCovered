import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, Mail, Phone, Clock, MessageSquare } from 'lucide-react';
import { User } from '../../types/auth';
import { TeamMessageDialog } from '../messages/TeamMessageDialog';

interface Props {
  user: User;
}

export const DashboardHeader: React.FC<Props> = ({ user }) => {
  const [showTeamMessageDialog, setShowTeamMessageDialog] = useState(false);
  const isCoach = user.role === 'coach' || user.role === 'admin';

  // Get first team for now - could be enhanced to allow team selection
  const defaultTeam = user.teams?.[0];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-brand-muted">
              {isCoach 
                ? "Here's what's happening with your teams today"
                : "Here's your progress and upcoming activities"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isCoach ? (
              // Coach Actions
              <>
                <Link
                  to="/practice-plan/new"
                  className="btn-primary flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Create Practice Plan
                </Link>
                
                {defaultTeam && (
                  <button
                    onClick={() => setShowTeamMessageDialog(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Team Message
                  </button>
                )}
              </>
            ) : (
              // Player Actions
              <>
                <Link
                  to="/progress"
                  className="btn-primary flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  View Progress
                </Link>
                
                <Link
                  to="/homework"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Homework
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Team Message Dialog */}
      {defaultTeam && (
        <TeamMessageDialog
          isOpen={showTeamMessageDialog}
          onClose={() => setShowTeamMessageDialog(false)}
          teamId={defaultTeam}
          teamName="Your Team" // This could be enhanced to show actual team name
        />
      )}
    </div>
  );
};