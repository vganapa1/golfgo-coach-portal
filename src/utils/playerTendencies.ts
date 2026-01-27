import { Round } from '../types';

// ============================================================================
// OFF THE TEE STATS
// ============================================================================

export interface OffTheTeeStats {
  avg_driving_distance: number;
  fairways_hit_pct: number;
  fairways_by_hole: { [hole: number]: { hit: number; total: number; pct: number } };
  miss_pattern: {
    left: number;
    right: number;
    fairway: number;
    total: number;
  };
  strokes_gained_by_hole: { [hole: number]: number };
  best_holes: number[];
  worst_holes: number[];
}

export function calculateOffTheTeeStats(rounds: Round[]): OffTheTeeStats {
  const drivingDistances: number[] = [];
  const fairwaysByHole: { [hole: number]: { hit: number; total: number } } = {};
  const missPattern = { left: 0, right: 0, fairway: 0, total: 0 };
  const strokesGainedByHole: { [hole: number]: number[] } = {};

  rounds.forEach(round => {
    round.holes.forEach(hole => {
      // Only count par 4 and par 5 holes for driving stats
      if (hole.par >= 4 && hole.shots.length > 0) {
        const teeShot = hole.shots[0];
        
        // Track driving distance
        if (teeShot.distance_yards) {
          drivingDistances.push(teeShot.distance_yards);
        }

        // Track fairway hit
        if (!fairwaysByHole[hole.hole_number]) {
          fairwaysByHole[hole.hole_number] = { hit: 0, total: 0 };
        }
        fairwaysByHole[hole.hole_number].total++;
        if (hole.fairway_hit) {
          fairwaysByHole[hole.hole_number].hit++;
          missPattern.fairway++;
        } else {
          // Determine miss direction (simplified - would need shot coordinates for accuracy)
          if (teeShot.outcome === 'rough' || teeShot.outcome === 'bunker') {
            // Assume left/right based on outcome or use a simple heuristic
            missPattern.left += 0.5;
            missPattern.right += 0.5;
          }
        }
        missPattern.total++;
      }

      // Use hole-level strokes gained if available, otherwise distribute summary
      if (hole.strokes_gained?.ott !== undefined) {
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(hole.strokes_gained.ott);
      } else {
        const sgPerHole = round.summary.strokes_gained.ott / 18;
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(sgPerHole);
      }
    });
  });

  // Calculate percentages
  const fairwaysByHolePct: { [hole: number]: { hit: number; total: number; pct: number } } = {};
  Object.keys(fairwaysByHole).forEach(holeNum => {
    const num = parseInt(holeNum);
    fairwaysByHolePct[num] = {
      ...fairwaysByHole[num],
      pct: fairwaysByHole[num].total > 0 ? fairwaysByHole[num].hit / fairwaysByHole[num].total : 0
    };
  });

  // Calculate average strokes gained per hole
  const avgStrokesGainedByHole: { [hole: number]: number } = {};
  Object.keys(strokesGainedByHole).forEach(holeNum => {
    const num = parseInt(holeNum);
    const values = strokesGainedByHole[num];
    avgStrokesGainedByHole[num] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  // Find best and worst holes
  const sortedHoles = Object.entries(avgStrokesGainedByHole)
    .sort(([, a], [, b]) => b - a)
    .map(([hole]) => parseInt(hole));
  const bestHoles = sortedHoles.slice(0, 3);
  const worstHoles = sortedHoles.slice(-3).reverse();

  const totalFairways = Object.values(fairwaysByHole).reduce((sum, h) => sum + h.hit, 0);
  const totalPossible = Object.values(fairwaysByHole).reduce((sum, h) => sum + h.total, 0);

  return {
    avg_driving_distance: drivingDistances.length > 0
      ? drivingDistances.reduce((a, b) => a + b, 0) / drivingDistances.length
      : 0,
    fairways_hit_pct: totalPossible > 0 ? totalFairways / totalPossible : 0,
    fairways_by_hole: fairwaysByHolePct,
    miss_pattern: {
      ...missPattern,
      left: missPattern.total > 0 ? (missPattern.left / missPattern.total) * 100 : 0,
      right: missPattern.total > 0 ? (missPattern.right / missPattern.total) * 100 : 0,
      fairway: missPattern.total > 0 ? (missPattern.fairway / missPattern.total) * 100 : 0,
    },
    strokes_gained_by_hole: avgStrokesGainedByHole,
    best_holes: bestHoles,
    worst_holes: worstHoles,
  };
}

// ============================================================================
// APPROACH STATS
// ============================================================================

export interface ApproachStats {
  gir_pct: number;
  gir_by_hole: { [hole: number]: { hit: number; total: number; pct: number } };
  avg_proximity: number;
  proximity_by_hole: { [hole: number]: number };
  miss_pattern: {
    short: number;
    long: number;
    left: number;
    right: number;
    total: number;
  };
  strokes_gained_by_hole: { [hole: number]: number };
  best_holes: number[];
  worst_holes: number[];
}

export function calculateApproachStats(rounds: Round[]): ApproachStats {
  const girByHole: { [hole: number]: { hit: number; total: number } } = {};
  const proximityByHole: { [hole: number]: number[] } = {};
  const missPattern = { short: 0, long: 0, left: 0, right: 0, total: 0 };
  const strokesGainedByHole: { [hole: number]: number[] } = {};
  const proximities: number[] = [];

  rounds.forEach(round => {
    round.holes.forEach(hole => {
      // Track GIR
      if (!girByHole[hole.hole_number]) {
        girByHole[hole.hole_number] = { hit: 0, total: 0 };
      }
      girByHole[hole.hole_number].total++;
      if (hole.gir) {
        girByHole[hole.hole_number].hit++;
      }

      // Find approach shot (second shot on par 4/5, first shot on par 3)
      const approachShotIndex = hole.par === 3 ? 0 : 1;
      if (hole.shots[approachShotIndex]) {
        const approachShot = hole.shots[approachShotIndex];
        
        // Use real proximity data if available, otherwise estimate
        if (approachShot.to_pin_distance !== undefined) {
          const proximityFeet = approachShot.to_pin_distance / 12; // Convert inches to feet
          if (!proximityByHole[hole.hole_number]) {
            proximityByHole[hole.hole_number] = [];
          }
          proximityByHole[hole.hole_number].push(proximityFeet);
          proximities.push(proximityFeet);
        } else if (hole.gir && hole.putts > 0) {
          // Fallback: estimate from first putt distance
          const firstPutt = hole.shots.find(s => s.club === 'Putter');
          if (firstPutt && firstPutt.distance_yards) {
            const proximityFeet = firstPutt.distance_yards * 3;
            if (!proximityByHole[hole.hole_number]) {
              proximityByHole[hole.hole_number] = [];
            }
            proximityByHole[hole.hole_number].push(proximityFeet);
            proximities.push(proximityFeet);
          }
        }

        // Track miss pattern using coordinates if available
        if (!hole.gir) {
          missPattern.total++;
          if (approachShot.start_x !== undefined && approachShot.start_y !== undefined && 
              approachShot.end_x !== undefined && approachShot.end_y !== undefined) {
            // Use coordinates to determine miss direction
            const dx = approachShot.end_x - approachShot.start_x;
            const dy = approachShot.end_y - approachShot.start_y;
            
            if (dx < 0) missPattern.left++;
            else if (dx > 0) missPattern.right++;
            
            if (dy < 0) missPattern.short++;
            else if (dy > 0) missPattern.long++;
          } else {
            // Fallback: distribute evenly
            missPattern.short += 0.25;
            missPattern.long += 0.25;
            missPattern.left += 0.25;
            missPattern.right += 0.25;
          }
        }
      }

      // Use hole-level strokes gained if available, otherwise distribute summary
      if (hole.strokes_gained?.app !== undefined) {
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(hole.strokes_gained.app);
      } else {
        const sgPerHole = round.summary.strokes_gained.app / 18;
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(sgPerHole);
      }
    });
  });

  // Calculate percentages
  const girByHolePct: { [hole: number]: { hit: number; total: number; pct: number } } = {};
  Object.keys(girByHole).forEach(holeNum => {
    const num = parseInt(holeNum);
    girByHolePct[num] = {
      ...girByHole[num],
      pct: girByHole[num].total > 0 ? girByHole[num].hit / girByHole[num].total : 0
    };
  });

  // Calculate average proximity per hole
  const avgProximityByHole: { [hole: number]: number } = {};
  Object.keys(proximityByHole).forEach(holeNum => {
    const num = parseInt(holeNum);
    const values = proximityByHole[num];
    avgProximityByHole[num] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  // Calculate average strokes gained per hole
  const avgStrokesGainedByHole: { [hole: number]: number } = {};
  Object.keys(strokesGainedByHole).forEach(holeNum => {
    const num = parseInt(holeNum);
    const values = strokesGainedByHole[num];
    avgStrokesGainedByHole[num] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  // Find best and worst holes
  const sortedHoles = Object.entries(avgStrokesGainedByHole)
    .sort(([, a], [, b]) => b - a)
    .map(([hole]) => parseInt(hole));
  const bestHoles = sortedHoles.slice(0, 3);
  const worstHoles = sortedHoles.slice(-3).reverse();

  const totalGIR = Object.values(girByHole).reduce((sum, h) => sum + h.hit, 0);
  const totalPossible = Object.values(girByHole).reduce((sum, h) => sum + h.total, 0);

  return {
    gir_pct: totalPossible > 0 ? totalGIR / totalPossible : 0,
    gir_by_hole: girByHolePct,
    avg_proximity: proximities.length > 0
      ? proximities.reduce((a, b) => a + b, 0) / proximities.length
      : 0,
    proximity_by_hole: avgProximityByHole,
    miss_pattern: {
      ...missPattern,
      short: missPattern.total > 0 ? (missPattern.short / missPattern.total) * 100 : 0,
      long: missPattern.total > 0 ? (missPattern.long / missPattern.total) * 100 : 0,
      left: missPattern.total > 0 ? (missPattern.left / missPattern.total) * 100 : 0,
      right: missPattern.total > 0 ? (missPattern.right / missPattern.total) * 100 : 0,
    },
    strokes_gained_by_hole: avgStrokesGainedByHole,
    best_holes: bestHoles,
    worst_holes: worstHoles,
  };
}

// ============================================================================
// SHORT GAME STATS
// ============================================================================

export interface ShortGameStats {
  up_and_down_pct: number;
  scrambling_pct: number;
  outcomes_by_lie: {
    bunker: { attempts: number; successes: number; pct: number };
    rough: { attempts: number; successes: number; pct: number };
    fringe: { attempts: number; successes: number; pct: number };
  };
  strokes_gained_by_hole: { [hole: number]: number };
  best_holes: number[];
  worst_holes: number[];
}

export function calculateShortGameStats(rounds: Round[]): ShortGameStats {
  // Use actual up and down data if available, otherwise calculate
  let upAndDownAttempts = 0;
  let upAndDownSuccesses = 0;
  
  // Use actual scrambling data if available, otherwise calculate
  let scrambleAttempts = 0;
  let scrambleSuccesses = 0;

  const outcomesByLie = {
    bunker: { attempts: 0, successes: 0 },
    rough: { attempts: 0, successes: 0 },
    fringe: { attempts: 0, successes: 0 },
  };
  const strokesGainedByHole: { [hole: number]: number[] } = {};

  rounds.forEach(round => {
    round.holes.forEach(hole => {
      // Use actual up and down data if available
      if (hole.up_and_down !== undefined) {
        if (!hole.gir) {
          upAndDownAttempts++;
          if (hole.up_and_down) {
            upAndDownSuccesses++;
          }
        }
      } else {
        // Fallback: calculate from score
        if (!hole.gir) {
          upAndDownAttempts++;
          if (hole.score <= hole.par) {
            upAndDownSuccesses++;
          }
        }
      }

      // Use actual scrambling data if available
      if (hole.scramble !== undefined) {
        if (hole.par >= 4 && !hole.fairway_hit) {
          scrambleAttempts++;
          if (hole.scramble) {
            scrambleSuccesses++;
          }
        }
      } else {
        // Fallback: calculate from score
        if (hole.par >= 4 && !hole.fairway_hit) {
          scrambleAttempts++;
          if (hole.score <= hole.par) {
            scrambleSuccesses++;
          }
        }
      }

      // Track outcomes by lie type
      const shortGameShot = hole.shots.find(shot => 
        shot.lie === 'bunker' || shot.lie === 'rough' || shot.lie === 'fringe'
      );
      if (shortGameShot) {
        const lieType = shortGameShot.lie as 'bunker' | 'rough' | 'fringe';
        if (outcomesByLie[lieType]) {
          outcomesByLie[lieType].attempts++;
          if (shortGameShot.outcome === 'green') {
            outcomesByLie[lieType].successes++;
          }
        }
      }

      // Use hole-level strokes gained if available, otherwise distribute summary
      if (hole.strokes_gained?.arg !== undefined) {
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(hole.strokes_gained.arg);
      } else {
        const sgPerHole = round.summary.strokes_gained.arg / 18;
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(sgPerHole);
      }
    });
  });

  // Calculate average strokes gained per hole
  const avgStrokesGainedByHole: { [hole: number]: number } = {};
  Object.keys(strokesGainedByHole).forEach(holeNum => {
    const num = parseInt(holeNum);
    const values = strokesGainedByHole[num];
    avgStrokesGainedByHole[num] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  // Find best and worst holes
  const sortedHoles = Object.entries(avgStrokesGainedByHole)
    .sort(([, a], [, b]) => b - a)
    .map(([hole]) => parseInt(hole));
  const bestHoles = sortedHoles.slice(0, 3);
  const worstHoles = sortedHoles.slice(-3).reverse();

  return {
    up_and_down_pct: upAndDownAttempts > 0 ? upAndDownSuccesses / upAndDownAttempts : 0,
    scrambling_pct: scrambleAttempts > 0 ? scrambleSuccesses / scrambleAttempts : 0,
    outcomes_by_lie: {
      bunker: {
        ...outcomesByLie.bunker,
        pct: outcomesByLie.bunker.attempts > 0
          ? outcomesByLie.bunker.successes / outcomesByLie.bunker.attempts
          : 0,
      },
      rough: {
        ...outcomesByLie.rough,
        pct: outcomesByLie.rough.attempts > 0
          ? outcomesByLie.rough.successes / outcomesByLie.rough.attempts
          : 0,
      },
      fringe: {
        ...outcomesByLie.fringe,
        pct: outcomesByLie.fringe.attempts > 0
          ? outcomesByLie.fringe.successes / outcomesByLie.fringe.attempts
          : 0,
      },
    },
    strokes_gained_by_hole: avgStrokesGainedByHole,
    best_holes: bestHoles,
    worst_holes: worstHoles,
  };
}

// ============================================================================
// PUTTING STATS
// ============================================================================

export interface PuttingStats {
  putts_per_round: number;
  putts_per_gir: number;
  three_putt_avoidance_pct: number;
  make_pct_by_distance: {
    '0-3ft': { made: number; attempts: number; pct: number };
    '3-6ft': { made: number; attempts: number; pct: number };
    '6-10ft': { made: number; attempts: number; pct: number };
    '10-20ft': { made: number; attempts: number; pct: number };
    '20ft+': { made: number; attempts: number; pct: number };
  };
  strokes_gained_by_hole: { [hole: number]: number };
  putting_heatmap: { [hole: number]: number }; // Average putts per hole
}

export function calculatePuttingStats(rounds: Round[]): PuttingStats {
  let totalPutts = 0;
  let totalGIRHoles = 0;
  let totalPuttsOnGIR = 0;
  let totalHoles = 0;
  let threePuttHoles = 0;
  const makePctByDistance = {
    '0-3ft': { made: 0, attempts: 0 },
    '3-6ft': { made: 0, attempts: 0 },
    '6-10ft': { made: 0, attempts: 0 },
    '10-20ft': { made: 0, attempts: 0 },
    '20ft+': { made: 0, attempts: 0 },
  };
  const strokesGainedByHole: { [hole: number]: number[] } = {};
  const puttingHeatmap: { [hole: number]: number[] } = {};

  rounds.forEach(round => {
    round.holes.forEach(hole => {
      totalHoles++;
      totalPutts += hole.putts;
      
      if (hole.gir) {
        totalGIRHoles++;
        totalPuttsOnGIR += hole.putts;
      }

      if (hole.putts >= 3) {
        threePuttHoles++;
      }

      // Track putting heatmap
      if (!puttingHeatmap[hole.hole_number]) {
        puttingHeatmap[hole.hole_number] = [];
      }
      puttingHeatmap[hole.hole_number].push(hole.putts);

      // Track make percentage by distance using putt distances
      const puttShots = hole.shots.filter(shot => shot.club === 'Putter');
      if (puttShots.length > 0) {
        // Use to_pin_distance if available, otherwise use distance_yards
        let distance: number;
        if (puttShots[0].to_pin_distance !== undefined) {
          distance = puttShots[0].to_pin_distance / 12; // Convert inches to feet
        } else if (puttShots[0].distance_yards) {
          distance = puttShots[0].distance_yards * 3; // Convert yards to feet
        } else {
          distance = 0;
        }
        
        if (distance > 0) {
          let bucket: keyof typeof makePctByDistance;
          
          if (distance <= 3) bucket = '0-3ft';
          else if (distance <= 6) bucket = '3-6ft';
          else if (distance <= 10) bucket = '6-10ft';
          else if (distance <= 20) bucket = '10-20ft';
          else bucket = '20ft+';

          makePctByDistance[bucket].attempts++;
          // Made if holed in 1 putt
          if (hole.putts === 1) {
            makePctByDistance[bucket].made++;
          }
        }
      }

      // Use hole-level strokes gained if available, otherwise distribute summary
      if (hole.strokes_gained?.putt !== undefined) {
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(hole.strokes_gained.putt);
      } else {
        const sgPerHole = round.summary.strokes_gained.putt / 18;
        if (!strokesGainedByHole[hole.hole_number]) {
          strokesGainedByHole[hole.hole_number] = [];
        }
        strokesGainedByHole[hole.hole_number].push(sgPerHole);
      }

      // Distribute summary strokes gained across holes (approximation)
      const sgPerHole = round.summary.strokes_gained.putt / 18;
      if (!strokesGainedByHole[hole.hole_number]) {
        strokesGainedByHole[hole.hole_number] = [];
      }
      strokesGainedByHole[hole.hole_number].push(sgPerHole);
    });
  });

  // Calculate average strokes gained per hole
  const avgStrokesGainedByHole: { [hole: number]: number } = {};
  Object.keys(strokesGainedByHole).forEach(holeNum => {
    const num = parseInt(holeNum);
    const values = strokesGainedByHole[num];
    avgStrokesGainedByHole[num] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  // Calculate average putts per hole for heatmap
  const avgPuttingHeatmap: { [hole: number]: number } = {};
  Object.keys(puttingHeatmap).forEach(holeNum => {
    const num = parseInt(holeNum);
    const values = puttingHeatmap[num];
    avgPuttingHeatmap[num] = values.reduce((a, b) => a + b, 0) / values.length;
  });

  return {
    putts_per_round: totalHoles > 0 ? totalPutts / (totalHoles / 18) : 0,
    putts_per_gir: totalGIRHoles > 0 ? totalPuttsOnGIR / totalGIRHoles : 0,
    three_putt_avoidance_pct: totalHoles > 0 ? 1 - (threePuttHoles / totalHoles) : 0,
    make_pct_by_distance: {
      '0-3ft': {
        ...makePctByDistance['0-3ft'],
        pct: makePctByDistance['0-3ft'].attempts > 0
          ? makePctByDistance['0-3ft'].made / makePctByDistance['0-3ft'].attempts
          : 0,
      },
      '3-6ft': {
        ...makePctByDistance['3-6ft'],
        pct: makePctByDistance['3-6ft'].attempts > 0
          ? makePctByDistance['3-6ft'].made / makePctByDistance['3-6ft'].attempts
          : 0,
      },
      '6-10ft': {
        ...makePctByDistance['6-10ft'],
        pct: makePctByDistance['6-10ft'].attempts > 0
          ? makePctByDistance['6-10ft'].made / makePctByDistance['6-10ft'].attempts
          : 0,
      },
      '10-20ft': {
        ...makePctByDistance['10-20ft'],
        pct: makePctByDistance['10-20ft'].attempts > 0
          ? makePctByDistance['10-20ft'].made / makePctByDistance['10-20ft'].attempts
          : 0,
      },
      '20ft+': {
        ...makePctByDistance['20ft+'],
        pct: makePctByDistance['20ft+'].attempts > 0
          ? makePctByDistance['20ft+'].made / makePctByDistance['20ft+'].attempts
          : 0,
      },
    },
    strokes_gained_by_hole: avgStrokesGainedByHole,
    putting_heatmap: avgPuttingHeatmap,
  };
}
