import { Round, GroupAnalytics, Player } from '../types';

export function calculateGroupAnalytics(
  players: Player[], 
  allRounds: Round[]
): GroupAnalytics {
  const totalRounds = allRounds.length;
  const totalPlayers = players.length;

  if (totalRounds === 0) {
    return {
      total_rounds: 0,
      total_players: totalPlayers,
      group_avg_score: 0,
      avg_by_round: {
        round_1: 0,
        round_2: 0,
        round_3: 0,
      },
      group_strokes_gained: {
        ott: 0,
        app: 0,
        arg: 0,
        putt: 0,
        total: 0,
      },
      best_player: {
        player_id: '',
        avg_score: 0,
      },
      most_improved: {
        player_id: '',
        improvement: 0,
      },
    };
  }

  // Group average score
  const groupAvgScore = allRounds.reduce((sum, r) => sum + r.total_score, 0) / totalRounds;

  // Average by round number
  const round1Scores = allRounds.filter(r => r.round_number === 1).map(r => r.total_score);
  const round2Scores = allRounds.filter(r => r.round_number === 2).map(r => r.total_score);
  const round3Scores = allRounds.filter(r => r.round_number === 3).map(r => r.total_score);

  const avgByRound = {
    round_1: round1Scores.length > 0 ? round1Scores.reduce((a, b) => a + b, 0) / round1Scores.length : 0,
    round_2: round2Scores.length > 0 ? round2Scores.reduce((a, b) => a + b, 0) / round2Scores.length : 0,
    round_3: round3Scores.length > 0 ? round3Scores.reduce((a, b) => a + b, 0) / round3Scores.length : 0,
  };

  // Group strokes gained
  const groupStrokesGained = {
    ott: allRounds.reduce((sum, r) => sum + r.summary.strokes_gained.ott, 0) / totalRounds,
    app: allRounds.reduce((sum, r) => sum + r.summary.strokes_gained.app, 0) / totalRounds,
    arg: allRounds.reduce((sum, r) => sum + r.summary.strokes_gained.arg, 0) / totalRounds,
    putt: allRounds.reduce((sum, r) => sum + r.summary.strokes_gained.putt, 0) / totalRounds,
    total: allRounds.reduce((sum, r) => sum + r.summary.strokes_gained.total, 0) / totalRounds,
  };

  // Find best player (lowest average)
  const playerAverages = players.map(player => {
    const playerRounds = allRounds.filter(r => r.player_id === player.id);
    if (playerRounds.length === 0) return { player_id: player.id, avg_score: Infinity };
    const avgScore = playerRounds.reduce((sum, r) => sum + r.total_score, 0) / playerRounds.length;
    return { player_id: player.id, avg_score: avgScore };
  });
  playerAverages.sort((a, b) => a.avg_score - b.avg_score);
  const bestPlayer = playerAverages.find(p => p.avg_score !== Infinity) || playerAverages[0];

  // Find most improved player
  const playerImprovements = players.map(player => {
    const playerRounds = allRounds
      .filter(r => r.player_id === player.id)
      .sort((a, b) => a.round_number - b.round_number);
    
    if (playerRounds.length < 2) return { player_id: player.id, improvement: 0 };
    
    const improvement = playerRounds[0].total_score - playerRounds[playerRounds.length - 1].total_score;
    return { player_id: player.id, improvement };
  });
  playerImprovements.sort((a, b) => b.improvement - a.improvement);
  const mostImproved = playerImprovements[0] || { player_id: '', improvement: 0 };

  return {
    total_rounds: totalRounds,
    total_players: totalPlayers,
    group_avg_score: groupAvgScore,
    avg_by_round: avgByRound,
    group_strokes_gained: groupStrokesGained,
    best_player: bestPlayer,
    most_improved: mostImproved,
  };
}

export function formatScore(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return 'E';
  if (diff > 0) return `+${diff}`;
  return `${diff}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatStrokesGained(value: number): string {
  return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
}
