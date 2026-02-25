import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { usePlayerData } from '../hooks/usePlayerData';
import { useRoundData } from '../hooks/useRoundData';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { calculateOffTheTeeStats, calculateApproachStats, calculateShortGameStats, calculatePuttingStats } from '../utils/playerTendencies';
import TabNavigation from '../components/player/TabNavigation';
import ClippDTab from '../components/player/ClippDTab';
import OffTheTeeStatsComponent from '../components/player/OffTheTeeStats';
import ApproachStatsComponent from '../components/player/ApproachStats';
import ShortGameStatsComponent from '../components/player/ShortGameStats';
import PuttingStatsComponent from '../components/player/PuttingStats';
import CourseView from '../components/player/CourseView';
import RoundSelector from '../components/player/RoundSelector';
import ScoreCard from '../components/player/ScoreCard';
import StrokesGainedBreakdown from '../components/player/StrokesGainedBreakdown';
import ProgressionChart from '../components/player/ProgressionChart';
import RoundComparison from '../components/player/RoundComparison';

export default function PlayerDetail() {
  const { playerId } = useParams<{ playerId: string }>();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'clippd';
  
  const { players, loading: playersLoading } = usePlayerData();
  const { rounds, loading: roundsLoading } = useRoundData(playerId);
  const { aggregateStats, progression } = usePlayerStats(rounds);
  
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');

  // Diagnostic logging
  useEffect(() => {
    if (rounds.length > 0) {
      console.log('=== Round Data Diagnostic ===');
      console.log('First Round Data:', rounds[0]);
      console.log('Holes Array:', rounds[0].holes);
      console.log('Holes Array Length:', rounds[0].holes?.length);
      console.log('First Hole:', rounds[0].holes?.[0]);
      console.log('First Hole Score:', rounds[0].holes?.[0]?.score);
      console.log('All Hole Scores:', rounds[0].holes?.map((h: any, i: number) => ({ hole: i + 1, score: h.score, par: h.par })));
      console.log('Total Score:', rounds[0].total_score);
      console.log('===========================');
    }
  }, [rounds]);

  const player = players.find(p => p.id === playerId);

  // Calculate stats for each tab
  const offTheTeeStats = useMemo(() => 
    rounds.length > 0 ? calculateOffTheTeeStats(rounds) : null,
    [rounds]
  );
  const approachStats = useMemo(() => 
    rounds.length > 0 ? calculateApproachStats(rounds) : null,
    [rounds]
  );
  const shortGameStats = useMemo(() => 
    rounds.length > 0 ? calculateShortGameStats(rounds) : null,
    [rounds]
  );
  const puttingStats = useMemo(() => 
    rounds.length > 0 ? calculatePuttingStats(rounds) : null,
    [rounds]
  );

  if (playersLoading || roundsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-light">Loading player data...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-12 bg-white">
        <h2 className="text-2xl font-semibold text-black mb-4 tracking-tight">Player Not Found</h2>
        <Link to="/" className="text-black hover:text-gray-600 font-medium">
          ← Back to Strategy Generator
        </Link>
      </div>
    );
  }

  if (rounds.length === 0 && activeTab !== 'clippd') {
    return (
      <div className="space-y-6 w-full max-w-[2000px] mx-auto px-6 lg:px-8 xl:px-12 py-8 bg-white">
        <div>
          <Link to="/" className="text-black hover:text-gray-600 text-sm mb-3 inline-block font-medium">
            ← Back to Strategy Generator
          </Link>
          <h1 className="text-4xl font-semibold text-black tracking-tight">Coach Recommendations</h1>
          <div className="mt-3 text-sm text-gray-500 font-light">
            {player.name} • Handicap: {player.handicap}
          </div>
        </div>
        <TabNavigation playerId={playerId!} activeTab={activeTab} />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Round Data</h2>
          <p className="text-gray-600 mb-4">No practice rounds found for {player.name}. Switch to the ClippD Data tab to view imported performance data.</p>
        </div>
      </div>
    );
  }

  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);
  const availableRounds = sortedRounds.map(r => r.round_number);
  
  const displayRounds = selectedRound === 'all' 
    ? sortedRounds 
    : sortedRounds.filter(r => r.round_number === selectedRound);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'clippd':
        return <ClippDTab player={player} />;
      
      case 'performance':
        return (
          <div className="space-y-6">
            {/* Round Selector */}
            <div className="flex justify-end">
              <RoundSelector
                selectedRound={selectedRound}
                onRoundChange={setSelectedRound}
                availableRounds={availableRounds}
              />
            </div>

            {/* Aggregate Stats Summary (only show when 'all' is selected) */}
            {selectedRound === 'all' && aggregateStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm font-medium text-gray-600 uppercase">Avg Score</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {aggregateStats.avg_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Best: {aggregateStats.best_score} • Worst: {aggregateStats.worst_score}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm font-medium text-gray-600 uppercase">Fairways Hit</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {(aggregateStats.avg_fairways_pct * 100).toFixed(1)}%
                  </div>
                  {progression && (
                    <div className={`text-sm mt-1 ${progression.score_trend === 'improving' ? 'text-green-600' : 'text-gray-500'}`}>
                      {progression.score_trend === 'improving' ? '↗ Improving' : '→ Stable'}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm font-medium text-gray-600 uppercase">GIR</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {(aggregateStats.avg_gir_pct * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-sm font-medium text-gray-600 uppercase">Avg Putts/Round</div>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {aggregateStats.avg_putts_per_round.toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {/* Scorecards */}
            <div className="space-y-4">
              {displayRounds.map((round, idx) => (
                <ScoreCard 
                  key={round.round_number} 
                  round={round}
                  showComparison={selectedRound === 'all' && idx > 0}
                  comparisonRound={idx > 0 ? displayRounds[0] : undefined}
                />
              ))}
            </div>

            {/* Charts and Analysis (only when 'all' is selected) */}
            {selectedRound === 'all' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aggregateStats && (
                    <StrokesGainedBreakdown aggregateStats={aggregateStats} />
                  )}
                  <ProgressionChart rounds={sortedRounds} />
                </div>

                <RoundComparison rounds={sortedRounds} />

                {/* Progression Insights */}
                {progression && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Progression Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Score Trend</h4>
                        <div className={`text-2xl font-bold ${
                          progression.score_trend === 'improving' ? 'text-green-600' :
                          progression.score_trend === 'declining' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {progression.score_trend.charAt(0).toUpperCase() + progression.score_trend.slice(1)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {progression.score_change_r1_to_r3 > 0 ? '+' : ''}{progression.score_change_r1_to_r3.toFixed(1)} strokes from Round 1 to {sortedRounds.length}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Strongest Category</h4>
                        <div className="text-2xl font-bold text-golf-green-600">
                          {progression.strongest_category.toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Most improved: {progression.most_improved_category.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      
      case 'offTee':
        return offTheTeeStats ? (
          <OffTheTeeStatsComponent stats={offTheTeeStats} />
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No data available for Off The Tee statistics.</p>
          </div>
        );
      
      case 'approach':
        return approachStats ? (
          <ApproachStatsComponent stats={approachStats} />
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No data available for Approach statistics.</p>
          </div>
        );
      
      case 'shortGame':
        return shortGameStats ? (
          <ShortGameStatsComponent stats={shortGameStats} />
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No data available for Short Game statistics.</p>
          </div>
        );
      
      case 'putting':
        return puttingStats ? (
          <PuttingStatsComponent stats={puttingStats} />
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">No data available for Putting statistics.</p>
          </div>
        );
      
      case 'course':
        return <CourseView rounds={rounds} />;
      
      default:
        return <ClippDTab player={player} />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-[2000px] mx-auto px-6 lg:px-8 xl:px-12 py-8 bg-white">
      {/* Header */}
      <div>
        <Link
          to="/"
          className="text-black hover:text-gray-600 text-sm mb-3 inline-block font-medium"
        >
          ← Back to Strategy Generator
        </Link>
        <h1 className="text-4xl font-semibold text-black tracking-tight">Coach Recommendations</h1>
        <p className="mt-3 text-base text-gray-600 font-light">
          Review AI-generated course management strategies and access comprehensive player performance data to make informed coaching decisions
        </p>
        <div className="mt-3 text-sm text-gray-500 font-light">
          {player.name} • Handicap: {player.handicap} • {rounds.length} Rounds Completed
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation playerId={playerId!} activeTab={activeTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
