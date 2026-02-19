import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMemo, useState, useCallback, useEffect } from 'react';
import type { Team, PendingItem } from './types';
import {
  loadCurrentTeam,
  saveCurrentTeam,
  loadPendingItems,
  savePendingItems,
  loadTeams,
} from './data/storage';
import TeamSelection from './pages/TeamSelection';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import AcceptInventory from './pages/AcceptInventory';

const PAGE_SIZE = 7;

export default function App() {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(() => loadCurrentTeam());
  const [pendingItems, setPendingItems] = useState<PendingItem[]>(() => loadPendingItems());

  const teams = useMemo(() => loadTeams(), []);

  useEffect(() => {
    saveCurrentTeam(currentTeam);
  }, [currentTeam]);

  useEffect(() => {
    savePendingItems(pendingItems);
  }, [pendingItems]);

  const addPendingItem = useCallback((item: Omit<PendingItem, 'id'>) => {
    const id = String(Date.now());
    setPendingItems((prev) => {
      const next = [{ ...item, id }, ...prev];
      savePendingItems(next);
      return next;
    });
  }, []);

  const setCurrentTeamAndSave = useCallback((team: Team | null) => {
    setCurrentTeam(team);
    saveCurrentTeam(team);
  }, []);

  const kpiItems = useMemo(() => pendingItems.length, [pendingItems]);
  const kpiDamaged = useMemo(() => pendingItems.filter((p) => p.status === 'Damaged').length, [pendingItems]);
  const kpiUnprocessed = useMemo(() => pendingItems.filter((p) => p.status === 'Unprocessed').length, [pendingItems]);
  const kpiMissingData = useMemo(() => pendingItems.filter((p) => p.status === 'Missing Data').length, [pendingItems]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            currentTeam ? (
              <Navigate to="/home" replace />
            ) : (
              <TeamSelection teams={teams} onSelectTeam={setCurrentTeamAndSave} />
            )
          }
        />
        <Route
          path="/home"
          element={
            currentTeam ? (
              <Home
                currentTeam={currentTeam}
                pendingItems={pendingItems}
                kpiItems={kpiItems}
                kpiDamaged={kpiDamaged}
                kpiUnprocessed={kpiUnprocessed}
                kpiMissingData={kpiMissingData}
                pageSize={PAGE_SIZE}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route
          path="/accept"
          element={
            currentTeam ? (
              <AcceptInventory currentTeam={currentTeam} onAdd={addPendingItem} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
