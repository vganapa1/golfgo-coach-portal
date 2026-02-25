import { useState, useMemo } from 'react';
import { Player, Round } from '../../types';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { calculateOffTheTeeStats, calculateApproachStats, calculateShortGameStats, calculatePuttingStats } from '../../utils/playerTendencies';
import ClippDTab from './ClippDTab';
import OffTheTeeStatsComponent from './OffTheTeeStats';
import ApproachStatsComponent from './ApproachStats';
import ShortGameStatsComponent from './ShortGameStats';
import PuttingStatsComponent from './PuttingStats';
import CourseView from './CourseView';
import RoundSelector from './RoundSelector';
import ScoreCard from './ScoreCard';
import StrokesGainedBreakdown from './StrokesGainedBreakdown';

interface Player360PanelProps {
  player: Player;
  rounds: Round[];
}

export default function Player360Panel({ player, rounds }: Player360PanelProps) {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const { aggregateStats, progression } = usePlayerStats(rounds);

  // Calculate stats for each tab with error handling
  const offTheTeeStats = useMemo(() => {
    try {
      return rounds.length > 0 ? calculateOffTheTeeStats(rounds) : null;
    } catch (error) {
      console.error('Error calculating Off The Tee stats:', error);
      return null;
    }
  }, [rounds]);
  
  const approachStats = useMemo(() => {
    try {
      return rounds.length > 0 ? calculateApproachStats(rounds) : null;
    } catch (error) {
      console.error('Error calculating Approach stats:', error);
      return null;
    }
  }, [rounds]);
  
  const shortGameStats = useMemo(() => {
    try {
      return rounds.length > 0 ? calculateShortGameStats(rounds) : null;
    } catch (error) {
      console.error('Error calculating Short Game stats:', error);
      return null;
    }
  }, [rounds]);
  
  const puttingStats = useMemo(() => {
    try {
      return rounds.length > 0 ? calculatePuttingStats(rounds) : null;
    } catch (error) {
      console.error('Error calculating Putting stats:', error);
      return null;
    }
  }, [rounds]);

  const [activeSystemTab, setActiveSystemTab] = useState<'golfgo' | 'clippd'>('golfgo');

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
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="text-xs font-medium text-gray-600 uppercase">Avg Score</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {aggregateStats.avg_score.toFixed(1)}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="text-xs font-medium text-gray-600 uppercase">Fairways Hit</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {(aggregateStats.avg_fairways_pct * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="text-xs font-medium text-gray-600 uppercase">GIR</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {(aggregateStats.avg_gir_pct * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="text-xs font-medium text-gray-600 uppercase">Avg Putts</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {aggregateStats.avg_putts_per_round.toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {/* Scorecards - Compact View */}
            <div className="space-y-3">
              {displayRounds.slice(0, 2).map((round) => (
                <ScoreCard 
                  key={round.round_number} 
                  round={round}
                  showComparison={false}
                />
              ))}
            </div>

            {/* Compact Charts */}
            {selectedRound === 'all' && aggregateStats && (
              <div className="space-y-4">
                <StrokesGainedBreakdown aggregateStats={aggregateStats} />
                {progression && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Trend</h4>
                    <div className={`text-lg font-bold ${
                      progression.score_trend === 'improving' ? 'text-green-600' :
                      progression.score_trend === 'declining' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {progression.score_trend.charAt(0).toUpperCase() + progression.score_trend.slice(1)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 'offTee':
        return offTheTeeStats ? (
          <OffTheTeeStatsComponent stats={offTheTeeStats} />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-apple p-4">
            <p className="text-gray-600 text-sm font-light">No data available for Off The Tee statistics.</p>
          </div>
        );
      
      case 'approach':
        return approachStats ? (
          <ApproachStatsComponent stats={approachStats} />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-apple p-4">
            <p className="text-gray-600 text-sm font-light">No data available for Approach statistics.</p>
          </div>
        );
      
      case 'shortGame':
        return shortGameStats ? (
          <ShortGameStatsComponent stats={shortGameStats} />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-apple p-4">
            <p className="text-gray-600 text-sm font-light">No data available for Short Game statistics.</p>
          </div>
        );
      
      case 'putting':
        return puttingStats ? (
          <PuttingStatsComponent stats={puttingStats} />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-apple p-4">
            <p className="text-gray-600 text-sm font-light">No data available for Putting statistics.</p>
          </div>
        );
      
      case 'course':
        return <CourseView rounds={rounds} />;
      
      default:
        return <ClippDTab player={player} />;
    }
  };

  // If rounds is empty, only allow ClippD system tab
  if (!rounds || rounds.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white w-full">
        <div className="bg-black border-b border-white flex-shrink-0">
          <div className="flex">
            <button
              className="px-6 py-3 text-sm font-medium border-b-2 border-white text-white bg-gray-900"
            >
              <span className="underline decoration-wavy decoration-red-500">ClippD System</span>
            </button>
          </div>
        </div>
        <div className="bg-black border-b border-gray-900 px-6 py-4 flex-shrink-0">
          <p className="text-sm text-white font-medium">
            {player.name} • HCP: {player.handicap}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ClippDTab player={player} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white w-full">
      {/* System Tabs */}
      <div className="bg-black border-b border-white flex-shrink-0">
        <div className="flex">
          <button
            onClick={() => {
              setActiveSystemTab('golfgo');
              setActiveTab('performance'); // Reset to performance when switching to Golf Go
            }}
            className={`
              px-6 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeSystemTab === 'golfgo'
                ? 'border-white text-white bg-gray-900'
                : 'border-transparent text-gray-400 hover:text-white'
              }
            `}
          >
            Player Profile Powered by Golf Go
          </button>
          <button
            onClick={() => setActiveSystemTab('clippd')}
            className={`
              px-6 py-3 text-sm font-medium border-b-2 transition-colors relative
              ${activeSystemTab === 'clippd'
                ? 'border-white text-white bg-gray-900'
                : 'border-transparent text-gray-400 hover:text-white'
              }
            `}
          >
            <span className="underline decoration-wavy decoration-red-500">ClippD System</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-black border-b border-gray-900 px-6 py-4 flex-shrink-0">
        <p className="text-sm text-white font-medium">
          {player.name} • HCP: {player.handicap} • {rounds.length} Rounds
        </p>
      </div>

      {/* Tab Navigation - Only show for Golf Go profile */}
      {activeSystemTab === 'golfgo' && (
        <div className="bg-black border-b border-gray-900 flex-shrink-0">
          <nav className="flex space-x-0 overflow-x-auto scrollbar-hide" aria-label="Tabs">
            {[
              { id: 'performance', label: 'Performance', icon: '📈' },
              { id: 'offTee', label: 'Off The Tee', icon: '🏌️' },
              { id: 'approach', label: 'Approach', icon: '🎯' },
              { id: 'shortGame', label: 'Around G', icon: '⛳' },
              { id: 'putting', label: 'Putting', icon: '🏌️‍♂️' },
              { id: 'course', label: 'Course View', icon: '🗺️' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0
                    ${isActive
                      ? 'border-white text-white bg-gray-900'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-900'
                    }
                  `}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {(() => {
          try {
            // Show ClippD data when ClippD System tab is active
            if (activeSystemTab === 'clippd') {
              return <ClippDTab player={player} />;
            }
            // Otherwise show regular tab content
            return renderTabContent();
          } catch (error) {
            console.error('Error rendering tab content:', error);
            return (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <h4 className="text-red-800 font-semibold mb-2">Error Loading Content</h4>
                <p className="text-red-600 text-sm">
                  An error occurred while loading this tab. Please try refreshing the page.
                </p>
                <p className="text-red-500 text-xs mt-2">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
}
