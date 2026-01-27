import { useState, useEffect } from 'react';
import { Round } from '../types';

// Import consolidated player rounds files
const playerRoundsModules = import.meta.glob('../data/player_*_rounds.json', { eager: true }) as Record<string, { default: any }>;

// Transform consolidated format to individual Round objects
function extractRounds(consolidatedData: any): Round[] {
  if (!consolidatedData || !consolidatedData.rounds) return [];
  
  return consolidatedData.rounds.map((roundData: any) => {
    // Create a map from scorecard array to ensure we have all scores
    const scorecardMap = new Map<number, number>();
    if (roundData.scorecard && Array.isArray(roundData.scorecard)) {
      roundData.scorecard.forEach((entry: any) => {
        const holeNum = entry.hole || entry.hole_number;
        if (holeNum && entry.score !== undefined) {
          scorecardMap.set(holeNum, entry.score);
        }
      });
    }

    // Calculate summary if not already present
    const holes = roundData.holes || [];
    const fairways_hit = holes.filter((h: any) => h.hit_fairway || h.fairway_hit).length;
    const fairways_possible = holes.filter((h: any) => h.par >= 4).length;
    const gir = holes.filter((h: any) => h.hit_gir || h.gir).length;
    const gir_possible = holes.length;
    const total_putts = holes.reduce((sum: number, h: any) => sum + (h.putts || 0), 0);
    const three_putts = holes.filter((h: any) => h.putts >= 3).length;
    
    // Calculate up and down stats
    const upAndDownAttempts = holes.filter((h: any) => 
      h.up_and_down_attempt || (!h.gir && !h.hit_gir)
    ).length;
    const upAndDowns = holes.filter((h: any) => 
      h.up_and_down || h.up_and_down_success
    ).length;
    
    // Calculate scrambling stats
    const scrambleAttempts = holes.filter((h: any) => 
      h.par >= 4 && !h.fairway_hit && !h.hit_fairway
    ).length;
    const scrambles = holes.filter((h: any) => 
      h.scramble || (h.par >= 4 && !h.fairway_hit && !h.hit_fairway && h.score <= h.par)
    ).length;
    
    // Calculate strokes gained totals
    const strokesGained = holes.reduce((acc: any, h: any) => {
      const hsg = h.strokes_gained || {};
      return {
        ott: acc.ott + (hsg.ott || 0),
        app: acc.app + (hsg.app || 0),
        arg: acc.arg + (hsg.arg || 0),
        putt: acc.putt + (hsg.putt || 0),
        total: acc.total + (hsg.total || 0)
      };
    }, { ott: 0, app: 0, arg: 0, putt: 0, total: 0 });

    const summary = roundData.summary || {
      total_score: roundData.total_score,
      total_par: 72,
      score_to_par: roundData.total_score - 72,
      fairways_hit,
      fairways_possible,
      fairways_pct: fairways_possible > 0 ? fairways_hit / fairways_possible : 0,
      gir,
      gir_possible,
      gir_pct: gir_possible > 0 ? gir / gir_possible : 0,
      total_putts,
      putts_per_hole: total_putts / holes.length,
      three_putts,
      up_and_downs: upAndDowns,
      up_and_down_attempts: upAndDownAttempts,
      up_and_down_pct: upAndDownAttempts > 0 ? upAndDowns / upAndDownAttempts : 0,
      scrambles,
      scramble_attempts: scrambleAttempts,
      scramble_pct: scrambleAttempts > 0 ? scrambles / scrambleAttempts : 0,
      strokes_gained: strokesGained
    };

    // Create a map of holes by hole number for quick lookup
    const holesMap = new Map<number, any>();
    holes.forEach((h: any) => {
      const holeNum = h.hole_number || h.hole;
      if (holeNum) {
        holesMap.set(holeNum, h);
      }
    });

    // Build complete holes array (1-18), using scorecard as source of truth for scores
    const completeHoles = [];
    for (let holeNum = 1; holeNum <= 18; holeNum++) {
      const holeData = holesMap.get(holeNum);
      const scorecardEntry = roundData.scorecard?.find((e: any) => (e.hole || e.hole_number) === holeNum);
      
      // Get score from scorecard first (most reliable), then from hole data
      const score = scorecardEntry?.score ?? holeData?.score ?? 0;
      const par = scorecardEntry?.par ?? holeData?.par ?? 4;
      
      // Debug logging for missing scores
      if (score === 0 && holeNum <= 3) {
        console.log(`[Round ${roundData.round_number}] Hole ${holeNum}:`, {
          scorecardEntry,
          holeData: holeData ? { score: holeData.score, par: holeData.par } : null,
          finalScore: score
        });
      }
      
      completeHoles.push({
        hole_number: holeNum,
        par: par,
        score: score,
        shots: holeData?.shots || [],
        fairway_hit: holeData?.hit_fairway || holeData?.fairway_hit || false,
        gir: holeData?.hit_gir || holeData?.gir || false,
        putts: holeData?.putts || 0,
        up_and_down: holeData?.up_and_down || holeData?.up_and_down_success || false,
        scramble: holeData?.scramble || false,
        strokes_gained: holeData?.strokes_gained
      });
    }
    
    // Log summary for debugging
    if (roundData.round_number === 1) {
      console.log(`[Round ${roundData.round_number}] Extracted holes:`, {
        totalHoles: completeHoles.length,
        scores: completeHoles.map(h => h.score),
        scorecardLength: roundData.scorecard?.length,
        holesLength: holes.length
      });
    }

    return {
      player_id: consolidatedData.player_id,
      round_number: roundData.round_number,
      date: roundData.round_date,
      course_name: roundData.course_name,
      total_score: roundData.total_score,
      total_par: 72,
      holes: completeHoles,
      summary
    };
  });
}

export function useRoundData(playerId?: string) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const allRounds: Round[] = [];
      
      if (playerId) {
        // Load only specific player's rounds
        const modulePath = `../data/${playerId}_rounds.json`;
        const module = playerRoundsModules[modulePath];
        if (module) {
          allRounds.push(...extractRounds(module.default));
        }
      } else {
        // Load all rounds for all players
        Object.values(playerRoundsModules).forEach(module => {
          allRounds.push(...extractRounds(module.default));
        });
      }
      
      setRounds(allRounds);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load round data:', err);
      setError('Failed to load round data');
      setLoading(false);
    }
  }, [playerId]);

  return { rounds, loading, error };
}
