import { useState, useEffect } from 'react';
import { ClippDPlayerData } from '../types';

const clippDModules = import.meta.glob('../data/clippd/player_*.json', { eager: true }) as Record<string, { default: ClippDPlayerData }>;

export function useClippDData(playerId?: string) {
  const [data, setData] = useState<ClippDPlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      if (playerId) {
        const modulePath = `../data/clippd/${playerId}.json`;
        const module = clippDModules[modulePath];
        setData(module?.default ?? null);
      } else {
        setData(null);
      }
      setLoading(false);
    } catch {
      setData(null);
      setLoading(false);
    }
  }, [playerId]);

  return { clippDData: data, loading };
}
