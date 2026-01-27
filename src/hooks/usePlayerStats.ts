import { useMemo } from 'react';
import { Round, AggregateStats, ProgressionMetrics } from '../types';

export function usePlayerStats(rounds: Round[]) {
  const aggregateStats = useMemo<AggregateStats | null>(() => {
    if (rounds.length === 0) return null;

    const scores = rounds.map(r => r.total_score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate standard deviation
    const variance = scores.reduce((sum, score) => {
      return sum + Math.pow(score - avgScore, 2);
    }, 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Average stats across all rounds
    const avgFairways = rounds.reduce((sum, r) => sum + r.summary.fairways_pct, 0) / rounds.length;
    const avgGIR = rounds.reduce((sum, r) => sum + r.summary.gir_pct, 0) / rounds.length;
    const avgPutts = rounds.reduce((sum, r) => sum + r.summary.putts_per_hole, 0) / rounds.length;

    // Average strokes gained
    const avgSG = {
      ott: rounds.reduce((sum, r) => sum + r.summary.strokes_gained.ott, 0) / rounds.length,
      app: rounds.reduce((sum, r) => sum + r.summary.strokes_gained.app, 0) / rounds.length,
      arg: rounds.reduce((sum, r) => sum + r.summary.strokes_gained.arg, 0) / rounds.length,
      putt: rounds.reduce((sum, r) => sum + r.summary.strokes_gained.putt, 0) / rounds.length,
      total: rounds.reduce((sum, r) => sum + r.summary.strokes_gained.total, 0) / rounds.length,
    };

    return {
      rounds_played: rounds.length,
      avg_score: avgScore,
      best_score: Math.min(...scores),
      worst_score: Math.max(...scores),
      score_std_dev: stdDev,
      avg_fairways_pct: avgFairways,
      avg_gir_pct: avgGIR,
      avg_putts_per_round: avgPutts * 18,
      avg_strokes_gained: avgSG,
    };
  }, [rounds]);

  const progression = useMemo<ProgressionMetrics | null>(() => {
    if (rounds.length < 2 || !aggregateStats) return null;

    const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);
    const firstRound = sortedRounds[0];
    const lastRound = sortedRounds[sortedRounds.length - 1];

    const scoreChange = lastRound.total_score - firstRound.total_score;
    
    let trend: 'improving' | 'declining' | 'stable';
    if (scoreChange < -1) trend = 'improving';
    else if (scoreChange > 1) trend = 'declining';
    else trend = 'stable';

    // Find strongest and weakest categories
    const avgSG = aggregateStats.avg_strokes_gained;
    const categories = [
      { name: 'ott' as const, value: avgSG.ott },
      { name: 'app' as const, value: avgSG.app },
      { name: 'arg' as const, value: avgSG.arg },
      { name: 'putt' as const, value: avgSG.putt },
    ];
    categories.sort((a, b) => b.value - a.value);

    // Calculate improvement by category
    const categoryImprovement = {
      ott: lastRound.summary.strokes_gained.ott - firstRound.summary.strokes_gained.ott,
      app: lastRound.summary.strokes_gained.app - firstRound.summary.strokes_gained.app,
      arg: lastRound.summary.strokes_gained.arg - firstRound.summary.strokes_gained.arg,
      putt: lastRound.summary.strokes_gained.putt - firstRound.summary.strokes_gained.putt,
    };

    const mostImprovedEntry = Object.entries(categoryImprovement)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      score_trend: trend,
      score_change_r1_to_r3: scoreChange,
      consistency_improving: rounds.length >= 3 && aggregateStats.score_std_dev < 3,
      strongest_category: categories[0].name,
      weakest_category: categories[categories.length - 1].name,
      most_improved_category: mostImprovedEntry[0] as 'ott' | 'app' | 'arg' | 'putt',
    };
  }, [rounds, aggregateStats]);

  return { aggregateStats, progression };
}
