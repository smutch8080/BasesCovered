import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SavedPracticePlan } from '../../types';
import { DrillCategory } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CategoryData {
  category: DrillCategory;
  yourPercentage: number;
  avgPercentage: number;
}

export const DrillInsightsSection: React.FC = () => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadInsights = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);

        // First, get the coach's team to determine age division
        const teamsRef = collection(db, 'teams');
        const teamQuery = query(teamsRef, where('coachId', '==', currentUser.id));
        const teamSnapshot = await getDocs(teamQuery);
        
        if (teamSnapshot.empty) {
          return; // No teams found
        }

        const team = teamSnapshot.docs[0].data();
        const ageDivision = team.ageDivision;

        // Get all teams in the same age division
        const sameAgeTeamsQuery = query(teamsRef, where('ageDivision', '==', ageDivision));
        const sameAgeTeamsSnapshot = await getDocs(sameAgeTeamsQuery);
        const coachIds = sameAgeTeamsSnapshot.docs.map(doc => doc.data().coachId);

        // Get current coach's practice plans
        const plansRef = collection(db, 'practice_plans');
        const coachPlansQuery = query(plansRef, where('userId', '==', currentUser.id));
        const coachPlansSnapshot = await getDocs(coachPlansQuery);
        
        // Get other coaches' practice plans
        const otherPlansQuery = query(plansRef, where('userId', 'in', coachIds));
        const otherPlansSnapshot = await getDocs(otherPlansQuery);

        // Process coach's drills
        const coachDrills = coachPlansSnapshot.docs.flatMap(doc => {
          const data = doc.data() as SavedPracticePlan;
          return data.drills;
        });

        // Process other coaches' drills
        const otherDrills = otherPlansSnapshot.docs.flatMap(doc => {
          const data = doc.data() as SavedPracticePlan;
          return data.drills;
        });

        // Calculate category distributions
        const coachCategoryCounts = coachDrills.reduce((acc, drill) => {
          acc[drill.category] = (acc[drill.category] || 0) + 1;
          return acc;
        }, {} as Record<DrillCategory, number>);

        const otherCategoryCounts = otherDrills.reduce((acc, drill) => {
          acc[drill.category] = (acc[drill.category] || 0) + 1;
          return acc;
        }, {} as Record<DrillCategory, number>);

        const coachTotal = coachDrills.length;
        const otherTotal = otherDrills.length;

        // Combine data for comparison
        const data = Object.values(DrillCategory).map(category => ({
          category,
          yourPercentage: ((coachCategoryCounts[category] || 0) / coachTotal) * 100,
          avgPercentage: ((otherCategoryCounts[category] || 0) / otherTotal) * 100
        })).sort((a, b) => b.yourPercentage - a.yourPercentage);

        setCategoryData(data);
      } catch (error) {
        console.error('Error loading insights:', error);
        toast.error('Unable to load drill insights');
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();
  }, [currentUser]);

  if (isLoading || categoryData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-6 h-6 text-brand-primary" />
        <h2 className="text-xl font-bold text-gray-800">Practice Plan Insights</h2>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="yourPercentage" name="Your Usage %" fill="#6366f1" />
            <Bar dataKey="avgPercentage" name="Age Group Avg %" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        This chart compares your drill category distribution with other coaches in your age division.
      </p>
    </div>
  );
};