import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { PublicLayout } from "./components/layouts/PublicLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { Spinner } from "./components/ui";
import { HomePage } from "./pages/HomePage";
import { TournamentsPage } from "./pages/TournamentsPage";
import { TournamentDetailPage } from "./pages/TournamentDetailPage";
import { PlayersPage } from "./pages/PlayersPage";
import { PlayerDetailPage } from "./pages/PlayerDetailPage";
import { MyPlayerPage } from "./pages/MyPlayerPage";
import { ProfilePage } from "./pages/ProfilePage";
import { FaqPage } from "./pages/FaqPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SchedulePage } from "./pages/SchedulePage";
import { LiveScoresPage } from "./pages/LiveScoresPage";
import { BracketsPage } from "./pages/BracketsPage";
import { DisciplineDetailPage } from "./pages/DisciplineDetailPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminTournamentsPage } from "./pages/admin/AdminTournaments";
import { AdminTournamentFormPage } from "./pages/admin/AdminTournamentForm";
import { AdminTournamentManagePage } from "./pages/admin/AdminTournamentManage";
import { AdminPlayersPage } from "./pages/admin/AdminPlayers";
import { AdminDisciplinesPage } from "./pages/admin/AdminDisciplines";
import { AdminGeographyPage } from "./pages/admin/AdminGeography";
import { AdminTablesPage } from "./pages/admin/AdminTables";
import { AdminFaqPage } from "./pages/admin/AdminFaq";
import { AdminMatchesPage } from "./pages/admin/AdminMatches";
import { AdminSchedulePage } from "./pages/admin/AdminSchedule";
import { AdminCommitteePage } from "./pages/admin/AdminCommittee";
import { AdminTeamsPage } from "./pages/admin/AdminTeams";
import { AdminUsersPage } from "./pages/admin/AdminUsers";
import { AdminTigPage } from "./pages/admin/AdminTig";
import { AdminScoringSheetPage } from "./pages/admin/AdminScoringSheet";
import { AdminTvPage } from "./pages/admin/AdminTv";
import { AdminApiPage } from "./pages/admin/AdminApi";
import { AdminClearPage } from "./pages/admin/AdminClear";
import { ScorerPage } from "./pages/ScorerPage";
import { TvPage } from "./pages/TvPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner label="Checking access…" />
      </div>
    );
  }
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role === "public") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicOnly() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public site */}
        <Route element={<PublicOnly />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/:slug" element={<TournamentDetailPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerDetailPage />} />
          <Route path="/players/me" element={<MyPlayerPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/live" element={<LiveScoresPage />} />
          <Route path="/brackets" element={<BracketsPage />} />
          <Route path="/disciplines/:slug" element={<DisciplineDetailPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* TV scoreboard — standalone full-screen arena display */}
        <Route path="/tv" element={<TvPage />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tournaments" element={<AdminTournamentsPage />} />
          <Route path="tournaments/new" element={<AdminTournamentFormPage />} />
          <Route path="tournaments/:id" element={<AdminTournamentManagePage />} />
          <Route path="tournaments/:id/edit" element={<AdminTournamentFormPage />} />
          <Route path="tournaments/:id/committee" element={<AdminCommitteePage />} />
          <Route path="tournaments/:id/tig" element={<AdminTigPage />} />
          <Route path="tournaments/:id/teams" element={<AdminTeamsPage />} />
          <Route path="players" element={<AdminPlayersPage />} />
          <Route path="disciplines" element={<AdminDisciplinesPage />} />
          <Route path="geography" element={<AdminGeographyPage />} />
          <Route path="tables" element={<AdminTablesPage />} />
          <Route path="matches" element={<AdminMatchesPage />} />
          <Route path="schedule" element={<AdminSchedulePage />} />
          <Route path="scoring-sheet" element={<AdminScoringSheetPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="tv" element={<AdminTvPage />} />
          <Route path="api" element={<AdminApiPage />} />
          <Route path="clear" element={<AdminClearPage />} />
          <Route path="scorer" element={<ScorerPage />} />
          <Route path="faq" element={<AdminFaqPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
