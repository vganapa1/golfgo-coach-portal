import { useState, useEffect } from 'react';
import { Player } from '../types';
import playersData from '../data/players.json';

export function usePlayerData() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPlayers(playersData.players);
      setLoading(false);
    } catch (err) {
      setError('Failed to load player data');
      setLoading(false);
    }
  }, []);

  return { players, loading, error };
}
