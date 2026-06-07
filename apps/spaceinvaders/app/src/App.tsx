import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { GameScreen } from '@/screens/GameScreen';

function AppShellLayout(): ReactElement {
  return (
    <div className="app-shell">
      <header className="app-shell__header">SpaceInvaders</header>
      <main className="app-shell__main">
        <Outlet />
      </main>
      <footer className="app-shell__footer">Slice 0 — Foundation</footer>
    </div>
  );
}

export function App(): ReactElement {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppShellLayout />}>
          <Route index element={<Navigate to="/game" replace />} />
          <Route path="/game" element={<GameScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
