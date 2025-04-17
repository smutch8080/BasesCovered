import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotFoundPage } from './components/NotFoundPage';
import { UserRole } from './types/auth';

// Pages
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import DrillDetailPage from './pages/DrillDetailPage';
import DrillsPage from './pages/DrillsPage';
import AddDrillPage from './pages/AddDrillPage';
import EditDrillPage from './pages/EditDrillPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ClinicsPage from './pages/ClinicsPage';
import ClinicDetailPage from './pages/ClinicDetailPage';
import NewClinicPage from './pages/NewClinicPage';
import ActivityFeedPage from './pages/ActivityFeedPage';
import MorePage from './pages/MorePage';
import CoachDashboardPage from './pages/CoachDashboardPage';
import PlayerDashboardPage from './pages/PlayerDashboardPage';
import LeagueDashboardPage from './pages/LeagueDashboardPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import TeamInvitePage from './pages/TeamInvitePage';
import TeamJoinPage from './pages/TeamJoinPage';
import TeamResourcesPage from './pages/TeamResourcesPage';
import LeagueResourcesPage from './pages/LeagueResourcesPage';
import FindTeamsPage from './pages/FindTeamsPage';
import CommunityResourcesPage from './pages/CommunityResourcesPage';
import MessagesPage from './pages/MessagesPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import ProgressReportPage from './pages/ProgressReportPage';
import ProgressReportsListPage from './pages/ProgressReportsListPage';
import HomeworkPage from './pages/HomeworkPage';
import HomeworkDetailPage from './pages/HomeworkDetailPage';
import NewHomeworkPage from './pages/NewHomeworkPage';
import SavedPlansPage from './pages/SavedPlansPage';
import AwardsPage from './pages/AwardsPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import CoachesPage from './pages/CoachesPage';
import CoachProfilePage from './pages/CoachProfilePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CoachingAssistantPage from './pages/CoachingAssistantPage';
import PracticePlanPage from './pages/PracticePlanPage';
import NewPracticePlanPage from './pages/NewPracticePlanPage';
import EditPracticePlanPage from './pages/EditPracticePlanPage';
import PracticePlanTimer from './pages/PracticePlanTimer';
import ChantsPage from './pages/ChantsPage';
import NewChantPage from './pages/NewChantPage';
import ChantDetailPage from './pages/ChantDetailPage';
import TodoPage from './pages/TodoPage';
import CoachesUniversityPage from './pages/CoachesUniversityPage';
import LessonDetailPage from './pages/LessonDetailPage';
import ScenariosPage from './pages/scenarios/ScenariosPage';
import NewScenarioPage from './pages/scenarios/NewScenarioPage';
import ScenarioDetailPage from './pages/scenarios/ScenarioDetailPage';
import LeaderboardPage from './pages/scenarios/LeaderboardPage';
import VolunteersPage from './pages/VolunteersPage';
import TeamVolunteersPage from './pages/TeamVolunteersPage';
import VolunteerRolesPage from './pages/VolunteerRolesPage';
import FieldVisualizerPage from './pages/FieldVisualizerPage';
import PublicEventsPage from './pages/PublicEventsPage';
import CreditsPage from './pages/CreditsPage';
import GamesPage from './pages/GamesPage';
import GameDetailPage from './pages/GameDetailPage';
import MessagingPage from './pages/MessagingPage';
import PhoneAuthTestPage from './pages/PhoneAuthTestPage';
import TestNotificationsPage from './pages/test-notifications';
import AuthSuccessPage from './pages/AuthSuccessPage';
import PrivateTrainingPage from './pages/PrivateTrainingPage';
import SummerTrainingTeamPage from './pages/SummerTrainingTeamPage';

// Admin Pages
import UsersPage from './pages/admin/UsersPage';
import HelpArticlesPage from './pages/admin/HelpArticlesPage';
import CTAManagementPage from './pages/admin/CTAManagementPage';
import NotificationAdminPage from './pages/admin/NotificationAdminPage';

// New BasesCovered Clinics Page
import BasesCoveredClinicsPage from './pages/BasesCoveredClinicsPage';

export default function Routes() {
  const { currentUser } = useAuth();
  const isCoach = currentUser?.role === 'coach' || currentUser?.role === 'admin';
  const isPlayer = currentUser?.role === 'player';
  const isLeagueManager = currentUser?.role === 'league_manager';

  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/" element={
        currentUser ? (
          isCoach ? <CoachDashboardPage /> :
          isPlayer ? <PlayerDashboardPage /> :
          isLeagueManager ? <LeagueDashboardPage /> :
          <HomePage />
        ) : <LandingPage />
      } />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/credits" element={<CreditsPage />} />
      <Route path="/field-visualizer" element={<FieldVisualizerPage />} />
      <Route path="/coaches" element={<CoachesPage />} />
      <Route path="/coaches/:coachId" element={<CoachProfilePage />} />
      <Route path="/drills" element={<DrillsPage />} />
      <Route path="/drills/:drillId" element={<DrillDetailPage />} />
      <Route path="/chants" element={<ChantsPage />} />
      <Route path="/chants/:chantId" element={<ChantDetailPage />} />
      <Route path="/clinics" element={<ClinicsPage />} />
      <Route path="/clinics/:clinicId" element={<ClinicDetailPage />} />
      <Route path="/private-training" element={<PrivateTrainingPage />} />
      <Route path="/summer-team" element={<SummerTrainingTeamPage />} />
      <Route path="/resources" element={<CommunityResourcesPage />} />
      <Route path="/invite/:teamId/:inviteHash" element={<TeamInvitePage />} />
      <Route path="/community-events" element={<PublicEventsPage />} />
      <Route path="/phone-auth-test" element={<PhoneAuthTestPage />} />
      <Route path="/auth-success" element={<AuthSuccessPage />} />

      {/* Protected Routes */}
      <Route path="/feed" element={
        <ProtectedRoute>
          <ActivityFeedPage />
        </ProtectedRoute>
      } />

      <Route path="/more" element={
        <ProtectedRoute>
          <MorePage />
        </ProtectedRoute>
      } />

      {/* League Manager Routes */}
      <Route path="/league-dashboard" element={
        <ProtectedRoute requiredRole={UserRole.league_manager}>
          <LeagueDashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/league/:leagueId/resources" element={
        <ProtectedRoute requiredRole={UserRole.league_manager}>
          <LeagueResourcesPage />
        </ProtectedRoute>
      } />

      {/* Team Routes */}
      <Route path="/teams" element={
        <ProtectedRoute>
          <TeamsPage />
        </ProtectedRoute>
      } />
      <Route path="/teams/find" element={<FindTeamsPage />} />
      <Route path="/teams/:teamId" element={
        <ProtectedRoute>
          <TeamDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/teams/:teamId/join" element={
        <ProtectedRoute>
          <TeamJoinPage />
        </ProtectedRoute>
      } />
      <Route path="/teams/:teamId/resources" element={
        <ProtectedRoute>
          <TeamResourcesPage />
        </ProtectedRoute>
      } />

      {/* Games Routes */}
      <Route path="/games" element={
        <ProtectedRoute>
          <GamesPage />
        </ProtectedRoute>
      } />
      <Route path="/games/:gameId" element={
        <ProtectedRoute>
          <GameDetailPage />
        </ProtectedRoute>
      } />

      {/* Player Routes */}
      <Route path="/teams/:teamId/players/:playerId" element={
        <ProtectedRoute>
          <PlayerProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/teams/:teamId/players/:playerId/progress" element={
        <ProtectedRoute>
          <ProgressReportsListPage />
        </ProtectedRoute>
      } />
      <Route path="/teams/:teamId/players/:playerId/progress/new" element={
        <ProtectedRoute requiredRole={UserRole.coach}>
          <ProgressReportPage />
        </ProtectedRoute>
      } />

      {/* Volunteer Routes */}
      <Route path="/volunteers" element={
        <ProtectedRoute>
          <VolunteersPage />
        </ProtectedRoute>
      } />
      <Route path="/teams/:teamId/volunteers" element={
        <ProtectedRoute>
          <TeamVolunteersPage />
        </ProtectedRoute>
      } />
      <Route path="/teams/:teamId/volunteers/roles" element={
        <ProtectedRoute requiredRole={UserRole.coach}>
          <VolunteerRolesPage />
        </ProtectedRoute>
      } />

      {/* Event Routes */}
      <Route path="/events" element={
        <ProtectedRoute>
          <EventsPage />
        </ProtectedRoute>
      } />
      <Route path="/events/:eventId" element={
        <ProtectedRoute>
          <EventDetailPage />
        </ProtectedRoute>
      } />

      {/* Practice Plan Routes */}
      <Route path="/practice-plan/new" element={
        <ProtectedRoute>
          <NewPracticePlanPage />
        </ProtectedRoute>
      } />
      <Route path="/practice-plan/:planId" element={
        <ProtectedRoute>
          <PracticePlanPage />
        </ProtectedRoute>
      } />
      <Route path="/practice-plan/:planId/edit" element={
        <ProtectedRoute>
          <EditPracticePlanPage />
        </ProtectedRoute>
      } />
      <Route path="/practice-plan/:planId/timer" element={
        <ProtectedRoute>
          <PracticePlanTimer />
        </ProtectedRoute>
      } />
      <Route path="/saved-plans" element={
        <ProtectedRoute>
          <SavedPlansPage />
        </ProtectedRoute>
      } />

      {/* Homework Routes */}
      <Route path="/homework" element={
        <ProtectedRoute>
          <HomeworkPage />
        </ProtectedRoute>
      } />
      <Route path="/homework/new" element={
        <ProtectedRoute requiredRole={UserRole.coach}>
          <NewHomeworkPage />
        </ProtectedRoute>
      } />
      <Route path="/homework/:homeworkId" element={
        <ProtectedRoute>
          <HomeworkDetailPage />
        </ProtectedRoute>
      } />

      {/* Progress Routes */}
      <Route path="/progress" element={
        <ProtectedRoute>
          <ProgressReportsListPage />
        </ProtectedRoute>
      } />

      {/* Awards Routes */}
      <Route path="/awards" element={
        <ProtectedRoute>
          <AwardsPage />
        </ProtectedRoute>
      } />

      {/* Collections Routes */}
      <Route path="/collections" element={
        <ProtectedRoute>
          <CollectionsPage />
        </ProtectedRoute>
      } />
      <Route path="/collections/:collectionId" element={
        <ProtectedRoute>
          <CollectionDetailPage />
        </ProtectedRoute>
      } />

      {/* Messages Routes */}
      <Route path="/messages" element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } />
      <Route path="/messages/:conversationId" element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } />
      <Route path="/messages/team/:teamId" element={
        <ProtectedRoute>
          <MessagesPage />
        </ProtectedRoute>
      } />

      {/* Coaching Assistant Routes */}
      <Route path="/coaching-assistant" element={
        <ProtectedRoute>
          <CoachingAssistantPage />
        </ProtectedRoute>
      } />

      {/* Coaches University Routes */}
      <Route path="/coaches-university" element={
        <ProtectedRoute>
          <CoachesUniversityPage />
        </ProtectedRoute>
      } />
      <Route path="/coaches-university/:lessonId" element={
        <ProtectedRoute>
          <LessonDetailPage />
        </ProtectedRoute>
      } />

      {/* Scenario Routes */}
      <Route path="/scenarios" element={
        <ProtectedRoute>
          <ScenariosPage />
        </ProtectedRoute>
      } />
      <Route path="/scenarios/new" element={
        <ProtectedRoute requiredRole={UserRole.coach}>
          <NewScenarioPage />
        </ProtectedRoute>
      } />
      <Route path="/scenarios/:scenarioId" element={
        <ProtectedRoute>
          <ScenarioDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/scenarios/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole={UserRole.admin}>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/help-articles" element={
        <ProtectedRoute requiredRole={UserRole.admin}>
          <HelpArticlesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/cta" element={
        <ProtectedRoute requiredRole={UserRole.admin}>
          <CTAManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute requiredRole={UserRole.admin}>
          <NotificationAdminPage />
        </ProtectedRoute>
      } />

      {/* Todo Routes */}
      <Route path="/todos" element={
        <ProtectedRoute>
          <TodoPage />
        </ProtectedRoute>
      } />

      {/* Chant Management Routes */}
      <Route path="/chants/new" element={
        <ProtectedRoute>
          <NewChantPage />
        </ProtectedRoute>
      } />

      {/* Clinic Management Routes */}
      <Route path="/clinics/new" element={
        <ProtectedRoute requiredRole={UserRole.coach}>
          <NewClinicPage />
        </ProtectedRoute>
      } />

      {/* Drill Management Routes */}
      <Route path="/add-drill" element={
        <ProtectedRoute requiredRole={UserRole.admin}>
          <AddDrillPage />
        </ProtectedRoute>
      } />
      <Route path="/drills/:drillId/edit" element={
        <ProtectedRoute requiredRole={UserRole.admin}>
          <EditDrillPage />
        </ProtectedRoute>
      } />

      {/* Profile Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Settings Route */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />

      {/* Messaging Routes */}
      <Route path="/messaging" element={
        <ProtectedRoute>
          <MessagingPage />
        </ProtectedRoute>
      } />

      {/* Testing Routes */}
      <Route path="/test-notifications" element={
        <ProtectedRoute>
          <TestNotificationsPage />
        </ProtectedRoute>
      } />

      {/* BasesCovered Clinics Route */}
      <Route path="/bases-covered-clinics" element={<BasesCoveredClinicsPage />} />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </RouterRoutes>
  );
}