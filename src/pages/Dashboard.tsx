import { useEffect, useState } from 'react';
import { usePlayerData } from '../hooks/usePlayerData';
import { useRoundData } from '../hooks/useRoundData';
import { calculateGroupAnalytics } from '../utils/statsCalculations';
import StatCard from '../components/dashboard/StatCard';
import PlayerCard from '../components/dashboard/PlayerCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import StrokesGainedChart from '../components/dashboard/StrokesGainedChart';
import { Round, GroupAnalytics } from '../types';

export default function Dashboard() {
  const { players, loading: playersLoading } = usePlayerData();
  const { rounds, loading: roundsLoading } = useRoundData(); // Load all rounds
  const [groupAnalytics, setGroupAnalytics] = useState<GroupAnalytics | null>(null);

  // Calculate group analytics when data is loaded
  useEffect(() => {
    if (players.length > 0 && rounds.length > 0) {
      console.log('Players loaded:', players.length);
      console.log('Rounds loaded:', rounds.length);
      console.log('Sample round:', rounds[0]);
      const analytics = calculateGroupAnalytics(players, rounds);
      console.log('Group analytics:', analytics);
      setGroupAnalytics(analytics);
    }
  }, [players, rounds]);

  // Loading state
  if (playersLoading || roundsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice round data...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h2>
        <p className="text-gray-600">
          Please add practice round data to the src/data/rounds/ folder.
        </p>
      </div>
    );
  }

  // Prepare chart data for score progression by round
  const scoreProgressionData = [
    {
      round: 'Round 1',
      average: groupAnalytics?.avg_by_round.round_1 || 0,
    },
    {
      round: 'Round 2',
      average: groupAnalytics?.avg_by_round.round_2 || 0,
    },
    {
      round: 'Round 3',
      average: groupAnalytics?.avg_by_round.round_3 || 0,
    },
  ];

  // Prepare strokes gained data by round
  const sgData = [
    {
      category: 'Off Tee',
      round_1: getRoundSG(rounds, 1, 'ott'),
      round_2: getRoundSG(rounds, 2, 'ott'),
      round_3: getRoundSG(rounds, 3, 'ott'),
    },
    {
      category: 'Approach',
      round_1: getRoundSG(rounds, 1, 'app'),
      round_2: getRoundSG(rounds, 2, 'app'),
      round_3: getRoundSG(rounds, 3, 'app'),
    },
    {
      category: 'Around Green',
      round_1: getRoundSG(rounds, 1, 'arg'),
      round_2: getRoundSG(rounds, 2, 'arg'),
      round_3: getRoundSG(rounds, 3, 'arg'),
    },
    {
      category: 'Putting',
      round_1: getRoundSG(rounds, 1, 'putt'),
      round_2: getRoundSG(rounds, 2, 'putt'),
      round_3: getRoundSG(rounds, 3, 'putt'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Practice Round Analytics
        </h1>
        <p className="mt-2 text-gray-600">
          {groupAnalytics?.total_players || 0} players × 3 rounds = {groupAnalytics?.total_rounds || 0} total rounds analyzed
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Group Avg Score"
          value={groupAnalytics?.group_avg_score.toFixed(1) || 'N/A'}
          subtitle="Across all rounds"
        />
        <StatCard
          title="Strokes Gained Total"
          value={groupAnalytics ? (groupAnalytics.group_strokes_gained.total >= 0 ? `+${groupAnalytics.group_strokes_gained.total.toFixed(2)}` : groupAnalytics.group_strokes_gained.total.toFixed(2)) : 'N/A'}
          subtitle="vs Scratch baseline"
          trend={groupAnalytics && groupAnalytics.group_strokes_gained.total > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Best Player"
          value={groupAnalytics ? players.find(p => p.id === groupAnalytics.best_player.player_id)?.name || 'N/A' : 'N/A'}
          subtitle={groupAnalytics ? `${groupAnalytics.best_player.avg_score.toFixed(1)} avg` : ''}
        />
        <StatCard
          title="Most Improved"
          value={groupAnalytics ? players.find(p => p.id === groupAnalytics.most_improved.player_id)?.name || 'N/A' : 'N/A'}
          subtitle={groupAnalytics ? `${groupAnalytics.most_improved.improvement.toFixed(1)} strokes` : ''}
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          title="Score Progression by Round"
          data={scoreProgressionData}
          dataKeys={[
            { key: 'average', name: 'Group Average', color: '#22c55e' }
          ]}
          yAxisLabel="Score"
        />
        <StrokesGainedChart data={sgData} />
      </div>

      {/* Player Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Player Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => {
            const playerRounds = rounds.filter(r => r.player_id === player.id).sort((a, b) => a.round_number - b.round_number);
            const avgScore = playerRounds.length > 0
              ? playerRounds.reduce((sum, r) => sum + r.total_score, 0) / playerRounds.length
              : undefined;

            // Calculate trend
            let scoreTrend: 'improving' | 'declining' | 'stable' | undefined;
            if (playerRounds.length >= 2) {
              const sortedRounds = [...playerRounds].sort((a, b) => a.round_number - b.round_number);
              const scoreChange = sortedRounds[sortedRounds.length - 1].total_score - sortedRounds[0].total_score;
              if (scoreChange < -1) scoreTrend = 'improving';
              else if (scoreChange > 1) scoreTrend = 'declining';
              else scoreTrend = 'stable';
            }

            return (
              <PlayerCard
                key={player.id}
                player={player}
                avgScore={avgScore}
                scoreTrend={scoreTrend}
                roundsCompleted={playerRounds.length}
              />
            );
          })}
        </div>
      </div>

      {/* Round-by-Round Details */}
      {rounds.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Round-by-Round Scores</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Round 1</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Round 2</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Round 3</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player) => {
                    const playerRounds = rounds.filter(r => r.player_id === player.id).sort((a, b) => a.round_number - b.round_number);
                    const round1 = playerRounds.find(r => r.round_number === 1);
                    const round2 = playerRounds.find(r => r.round_number === 2);
                    const round3 = playerRounds.find(r => r.round_number === 3);
                    const avgScore = playerRounds.length > 0
                      ? playerRounds.reduce((sum, r) => sum + r.total_score, 0) / playerRounds.length
                      : 0;
                    
                    let trend: string = '';
                    if (playerRounds.length >= 2) {
                      const sortedRounds = [...playerRounds].sort((a, b) => a.round_number - b.round_number);
                      const scoreChange = sortedRounds[sortedRounds.length - 1].total_score - sortedRounds[0].total_score;
                      if (scoreChange < -1) trend = '↗️ Improving';
                      else if (scoreChange > 1) trend = '↘️ Declining';
                      else trend = '→ Stable';
                    }

                    return (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {round1 ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{round1.total_score}</div>
                              <div className="text-xs text-gray-500">
                                {round1.total_score - round1.total_par > 0 ? '+' : ''}{round1.total_score - round1.total_par}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {round2 ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{round2.total_score}</div>
                              <div className="text-xs text-gray-500">
                                {round2.total_score - round2.total_par > 0 ? '+' : ''}{round2.total_score - round2.total_par}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {round3 ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{round3.total_score}</div>
                              <div className="text-xs text-gray-500">
                                {round3.total_score - round3.total_par > 0 ? '+' : ''}{round3.total_score - round3.total_par}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-semibold text-gray-900">{avgScore.toFixed(1)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm text-gray-600">{trend}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate average strokes gained for a specific round number
function getRoundSG(
  rounds: Round[], 
  roundNumber: number, 
  category: 'ott' | 'app' | 'arg' | 'putt'
): number {
  const roundsFiltered = rounds.filter(r => r.round_number === roundNumber);
  if (roundsFiltered.length === 0) return 0;
  
  const sum = roundsFiltered.reduce((acc, r) => acc + r.summary.strokes_gained[category], 0);
  return sum / roundsFiltered.length;
}
