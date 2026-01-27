import { Round, HoleStrategy, CourseStrategy } from '../types';

interface HoleAnalysis {
  holeNumber: number;
  avgScore: number;
  par: number;
  consistency: number; // 0-1, higher is better
  trend: 'improving' | 'declining' | 'stable';
  commonIssues: string[];
  strengths: string[];
}

function analyzeHole(rounds: Round[], holeNumber: number): HoleAnalysis {
  const holeData = rounds.map(r => r.holes[holeNumber - 1]);
  const scores = holeData.map(h => h.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const par = holeData[0].par;
  
  // Calculate consistency (inverse of standard deviation normalized)
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 1 - (stdDev / 2)); // Normalize to 0-1
  
  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (scores.length >= 2) {
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg < firstAvg - 0.5) trend = 'improving';
    else if (secondAvg > firstAvg + 0.5) trend = 'declining';
  }
  
  // Identify issues and strengths
  const commonIssues: string[] = [];
  const strengths: string[] = [];
  
  // Check fairway performance (for par 4/5)
  if (par >= 4) {
    const fairwayHits = holeData.filter(h => h.fairway_hit).length;
    const fairwayPct = fairwayHits / holeData.length;
    if (fairwayPct < 0.5) {
      commonIssues.push('Low fairway hit rate');
    } else if (fairwayPct > 0.7) {
      strengths.push('Consistent driving');
    }
  }
  
  // Check GIR
  const girHits = holeData.filter(h => h.gir).length;
  const girPct = girHits / holeData.length;
  if (girPct < 0.4) {
    commonIssues.push('Missing greens');
  } else if (girPct > 0.7) {
    strengths.push('Strong approach play');
  }
  
  // Check putting
  const avgPutts = holeData.reduce((sum, h) => sum + h.putts, 0) / holeData.length;
  if (avgPutts > 2.2) {
    commonIssues.push('Excessive putts');
  } else if (avgPutts < 1.8) {
    strengths.push('Efficient putting');
  }
  
  // Check scrambling when missing green
  const missedGreens = holeData.filter(h => !h.gir);
  if (missedGreens.length > 0) {
    const scrambles = missedGreens.filter(h => h.score <= par).length;
    const scramblePct = scrambles / missedGreens.length;
    if (scramblePct < 0.4) {
      commonIssues.push('Poor scrambling');
    }
  }
  
  return {
    holeNumber,
    avgScore,
    par,
    consistency,
    trend,
    commonIssues,
    strengths,
  };
}

function generateHoleStrategy(analysis: HoleAnalysis, rounds: Round[]): HoleStrategy {
  const holeData = rounds.map(r => r.holes[analysis.holeNumber - 1]);
  const par = analysis.par;
  
  // Determine confidence level
  let confidenceLevel: 'high' | 'medium' | 'low';
  if (analysis.consistency > 0.7 && rounds.length >= 3) confidenceLevel = 'high';
  else if (analysis.consistency > 0.5 || rounds.length >= 2) confidenceLevel = 'medium';
  else confidenceLevel = 'low';
  
  // Generate tee shot strategy
  let teeClub = 'Driver';
  let teeTarget = 'Center of fairway';
  let teeRationale = 'Standard aggressive play';
  
  if (par >= 4) {
    const fairwayIssue = analysis.commonIssues.includes('Low fairway hit rate');
    if (fairwayIssue) {
      teeClub = par === 5 ? '3-wood' : '3-wood or long iron';
      teeTarget = 'Conservative - favor accuracy over distance';
      teeRationale = `Fairway hit rate under 50% across ${rounds.length} rounds. Prioritize position over distance.`;
      confidenceLevel = 'high';
    } else if (analysis.strengths.includes('Consistent driving')) {
      teeClub = 'Driver';
      teeTarget = 'Aggressive line - maximize distance';
      teeRationale = `Strong fairway performance (>70% hit rate). Capitalize on driving strength.`;
    }
  } else if (par === 3) {
    teeClub = 'Depends on yardage';
    teeTarget = 'Center of green';
    teeRationale = 'Par 3 - focus on finding putting surface';
  }
  
  // Generate approach strategy
  let approachTarget = 'Center of green';
  let approachStrategy: 'aggressive' | 'conservative' = 'conservative';
  let approachRationale = 'Standard safe play to green center';
  
  const girIssue = analysis.commonIssues.includes('Missing greens');
  const hasScrambleIssue = analysis.commonIssues.includes('Poor scrambling');
  
  if (girIssue && hasScrambleIssue) {
    approachTarget = 'Largest part of green, avoid trouble';
    approachStrategy = 'conservative';
    approachRationale = `GIR rate below 40% with poor scrambling. Must prioritize hitting greens.`;
    confidenceLevel = 'high';
  } else if (analysis.strengths.includes('Strong approach play')) {
    approachTarget = 'Attack pins in safe quadrants';
    approachStrategy = 'aggressive';
    approachRationale = `Consistent GIR performance (>70%). Can be more aggressive with approach.`;
  }
  
  // Generate short game strategy (if applicable)
  let shortGameFocus: string | undefined;
  let shortGameRationale: string | undefined;
  
  if (hasScrambleIssue) {
    shortGameFocus = 'Up and down percentage - focus on getting close from around green';
    shortGameRationale = `Scrambling under 40% when missing greens. Work on pitch shots and wedge distance control.`;
  }
  
  // Generate putting strategy
  let puttingEmphasis: 'speed' | 'line' | 'both' = 'both';
  let puttingRationale = 'Standard two-putt focus';
  
  const avgPutts = holeData.reduce((sum, h) => sum + h.putts, 0) / holeData.length;
  if (avgPutts > 2.2) {
    puttingEmphasis = 'speed';
    puttingRationale = `Averaging ${avgPutts.toFixed(1)} putts. Focus on lag putting to avoid three-putts.`;
  } else if (analysis.strengths.includes('Efficient putting')) {
    puttingEmphasis = 'line';
    puttingRationale = `Strong putting performance (avg ${avgPutts.toFixed(1)} putts). Can be aggressive on birdie putts.`;
  }
  
  return {
    hole_number: analysis.holeNumber,
    tee_shot: {
      recommended_club: teeClub,
      target_line: teeTarget,
      rationale: teeRationale,
    },
    approach: {
      target_area: approachTarget,
      strategy: approachStrategy,
      rationale: approachRationale,
    },
    short_game: shortGameFocus ? {
      focus_area: shortGameFocus,
      rationale: shortGameRationale!,
    } : undefined,
    putting: {
      emphasis: puttingEmphasis,
      rationale: puttingRationale,
    },
    confidence_level: confidenceLevel,
    based_on_rounds: rounds.map(r => r.round_number),
  };
}

function generateOverallNotes(rounds: Round[], holes: HoleStrategy[]): string {
  const notes: string[] = [];
  
  // Count high confidence recommendations
  const highConfidence = holes.filter(h => h.confidence_level === 'high').length;
  notes.push(`${highConfidence} high-confidence recommendations based on ${rounds.length} rounds of data.`);
  
  // Identify patterns
  const conservativeTeeShots = holes.filter(h => 
    h.tee_shot.target_line.toLowerCase().includes('conservative')
  ).length;
  
  if (conservativeTeeShots >= 6) {
    notes.push(`\n⚠️ Accuracy Focus: ${conservativeTeeShots} holes recommend conservative tee shots. Prioritize fairways over distance.`);
  }
  
  const approachIssues = holes.filter(h => 
    h.approach.rationale.toLowerCase().includes('gir')
  ).length;
  
  if (approachIssues >= 6) {
    notes.push(`\n🎯 Approach Work Needed: Multiple holes showing GIR struggles. Focus practice on iron play and distance control.`);
  }
  
  const puttingIssues = holes.filter(h => 
    h.putting?.rationale.toLowerCase().includes('three-putt') || 
    h.putting?.rationale.toLowerCase().includes('averaging')
  ).length;
  
  if (puttingIssues >= 6) {
    notes.push(`\n⛳ Putting Priority: Lag putting practice recommended. Focus on two-putt strategy.`);
  }
  
  return notes.join('\n');
}

export function generateCourseStrategy(
  playerId: string,
  rounds: Round[]
): CourseStrategy {
  const holes: HoleStrategy[] = [];
  
  // Analyze each hole
  for (let holeNum = 1; holeNum <= 18; holeNum++) {
    const analysis = analyzeHole(rounds, holeNum);
    const strategy = generateHoleStrategy(analysis, rounds);
    holes.push(strategy);
  }
  
  // Generate overall notes
  const overallNotes = generateOverallNotes(rounds, holes);
  
  // Initialize hole approvals
  const hole_approvals: { [hole_number: number]: { approved: boolean; requires_approval: boolean } } = {};
  holes.forEach(hole => {
    const requiresApproval = hole.confidence_level === 'medium' || hole.confidence_level === 'low';
    hole_approvals[hole.hole_number] = {
      approved: hole.confidence_level === 'high', // Auto-approve high confidence
      requires_approval: requiresApproval,
    };
  });

  return {
    player_id: playerId,
    generated_date: new Date().toISOString(),
    holes,
    overall_notes: overallNotes,
    approved: false,
    edited_holes: [],
    hole_approvals,
  };
}
