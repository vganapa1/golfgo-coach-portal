import { Round, Player } from '../types';

export interface ClippDCategory {
  name: string;
  subcategories: ClippDSubcategory[];
}

export interface ClippDSubcategory {
  name: string;
  value: number;
  unit: string;
  source: string;
}

export interface ClippDExportData {
  player_id: string;
  player_name: string;
  clippd_id: string;
  date_range: {
    start: string;
    end: string;
  };
  rounds_included: number;
  categories: ClippDCategory[];
}

export function mapToClippDFormat(player: Player, rounds: Round[]): ClippDExportData {
  const sortedRounds = [...rounds].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate aggregate stats
  const totalRounds = rounds.length;
  
  // Driving stats
  const avgDrivingDistance = calculateAverage(rounds, (r) => {
    // Estimate from par 4/5 tee shots
    const par45Holes = r.holes.filter(h => h.par >= 4);
    const teeShots = par45Holes.map(h => h.shots[0]).filter(s => s);
    return teeShots.length > 0 
      ? teeShots.reduce((sum, s) => sum + s.distance_yards, 0) / teeShots.length 
      : 0;
  });

  const fairwayHitPct = calculateAverage(rounds, (r) => r.summary.fairways_pct) * 100;
  const avgStrokesGainedOTT = calculateAverage(rounds, (r) => r.summary.strokes_gained.ott);

  // Approach stats
  const girPct = calculateAverage(rounds, (r) => r.summary.gir_pct) * 100;
  const avgProximity = calculateAverage(rounds, (r) => {
    const approachShots = r.holes
      .filter(h => h.gir)
      .map(h => h.shots.find(s => s.outcome === 'green'))
      .filter(s => s && s.to_pin_distance);
    return approachShots.length > 0
      ? approachShots.reduce((sum, s) => sum + (s!.to_pin_distance || 0), 0) / approachShots.length
      : 0;
  });
  const avgStrokesGainedAPP = calculateAverage(rounds, (r) => r.summary.strokes_gained.app);

  // Short Game stats
  const upAndDownPct = calculateAverage(rounds, (r) => r.summary.up_and_down_pct) * 100;
  const scramblePct = calculateAverage(rounds, (r) => r.summary.scramble_pct) * 100;
  const avgStrokesGainedARG = calculateAverage(rounds, (r) => r.summary.strokes_gained.arg);

  // Putting stats
  const avgPuttsPerRound = calculateAverage(rounds, (r) => r.summary.total_putts);
  const avgPuttsPerGIR = calculateAverage(rounds, (r) => {
    const girHoles = r.holes.filter(h => h.gir);
    return girHoles.length > 0
      ? girHoles.reduce((sum, h) => sum + h.putts, 0) / girHoles.length
      : 0;
  });
  const threePuttAvoidance = calculateAverage(rounds, (r) => {
    const threePutts = r.summary.three_putts || 0;
    return ((18 - threePutts) / 18) * 100;
  });
  const avgStrokesGainedPUTT = calculateAverage(rounds, (r) => r.summary.strokes_gained.putt);

  return {
    player_id: player.id,
    player_name: player.name,
    clippd_id: player.clippd_id,
    date_range: {
      start: sortedRounds[0].date,
      end: sortedRounds[sortedRounds.length - 1].date,
    },
    rounds_included: totalRounds,
    categories: [
      {
        name: 'Driving',
        subcategories: [
          {
            name: 'Average Driving Distance',
            value: avgDrivingDistance,
            unit: 'yards',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Fairways Hit',
            value: fairwayHitPct,
            unit: '%',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Strokes Gained: Off the Tee',
            value: avgStrokesGainedOTT,
            unit: 'strokes',
            source: 'GolfGo analytics engine',
          },
        ],
      },
      {
        name: 'Iron Play',
        subcategories: [
          {
            name: 'Greens in Regulation',
            value: girPct,
            unit: '%',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Average Proximity to Hole',
            value: avgProximity,
            unit: 'feet',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Strokes Gained: Approach',
            value: avgStrokesGainedAPP,
            unit: 'strokes',
            source: 'GolfGo analytics engine',
          },
        ],
      },
      {
        name: 'Short Game',
        subcategories: [
          {
            name: 'Up & Down Percentage',
            value: upAndDownPct,
            unit: '%',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Scrambling Percentage',
            value: scramblePct,
            unit: '%',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Strokes Gained: Around the Green',
            value: avgStrokesGainedARG,
            unit: 'strokes',
            source: 'GolfGo analytics engine',
          },
        ],
      },
      {
        name: 'Putting',
        subcategories: [
          {
            name: 'Average Putts per Round',
            value: avgPuttsPerRound,
            unit: 'putts',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Average Putts per GIR',
            value: avgPuttsPerGIR,
            unit: 'putts',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Three-Putt Avoidance',
            value: threePuttAvoidance,
            unit: '%',
            source: 'GolfGo shot tracking',
          },
          {
            name: 'Strokes Gained: Putting',
            value: avgStrokesGainedPUTT,
            unit: 'strokes',
            source: 'GolfGo analytics engine',
          },
        ],
      },
    ],
  };
}

function calculateAverage(rounds: Round[], getValue: (round: Round) => number): number {
  if (rounds.length === 0) return 0;
  const sum = rounds.reduce((acc, round) => acc + getValue(round), 0);
  return sum / rounds.length;
}

export function generateClippDJSON(exportData: ClippDExportData): string {
  return JSON.stringify(exportData, null, 2);
}

export function getSyncCompatibility(rounds: Round[]): {
  compatible: boolean;
  issues: string[];
  readyMetrics: number;
  totalMetrics: number;
} {
  const issues: string[] = [];
  let readyMetrics = 0;
  const totalMetrics = 13; // Total ClippD metrics we're mapping

  if (rounds.length === 0) {
    issues.push('No round data available');
    return { compatible: false, issues, readyMetrics: 0, totalMetrics };
  }

  // Check data quality
  const hasStrokesGained = rounds.every(r => 
    r.summary.strokes_gained && 
    typeof r.summary.strokes_gained.total === 'number'
  );

  if (!hasStrokesGained) {
    issues.push('Strokes Gained data incomplete');
  } else {
    readyMetrics += 4; // All 4 SG categories
  }

  const hasFairwayData = rounds.every(r => 
    typeof r.summary.fairways_pct === 'number'
  );

  if (!hasFairwayData) {
    issues.push('Fairway tracking incomplete');
  } else {
    readyMetrics += 1;
  }

  const hasGIRData = rounds.every(r => 
    typeof r.summary.gir_pct === 'number'
  );

  if (!hasGIRData) {
    issues.push('GIR tracking incomplete');
  } else {
    readyMetrics += 2; // GIR and proximity
  }

  const hasShortGameData = rounds.every(r => 
    typeof r.summary.up_and_down_pct === 'number'
  );

  if (!hasShortGameData) {
    issues.push('Short game stats incomplete');
  } else {
    readyMetrics += 2; // Up&Down and Scrambling
  }

  const hasPuttingData = rounds.every(r => 
    typeof r.summary.total_putts === 'number'
  );

  if (!hasPuttingData) {
    issues.push('Putting data incomplete');
  } else {
    readyMetrics += 4; // All putting metrics
  }

  const compatible = issues.length === 0;

  return { compatible, issues, readyMetrics, totalMetrics };
}
