import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { HomePage } from '@/pages/home-page';
import { PlayPage } from '@/pages/play-page';
import { ResultsPage } from '@/pages/results-page';
import { LeaderboardPage } from '@/pages/leaderboard-page';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/results/:roundId" element={<ResultsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
