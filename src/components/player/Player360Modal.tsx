import { useState, useMemo, useEffect } from 'react';
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
import ProgressionChart from './ProgressionChart';
import RoundComparison from './RoundComparison';

interface Player360ModalProps {
  player: Player;
  rounds: Round[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Player360Modal({ player, rounds, isOpen, onClose }: Player360ModalProps) {
  const [activeTab, setActiveTab] = useState('clippd');
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const { aggregateStats, progression } = usePlayerStats(rounds);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

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
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Player360 Profile</h2>
              <p className="text-sm text-gray-600 mt-1">
                {player.name} • Handicap: {player.handicap} • {rounds.length} Rounds Completed
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
              {[
                { id: 'clippd', label: 'ClippD Data', icon: '📊' },
                { id: 'performance', label: 'Performance', icon: '📈' },
                { id: 'offTee', label: 'Off The Tee', icon: '🏌️' },
                { id: 'approach', label: 'Approach', icon: '🎯' },
                { id: 'shortGame', label: 'Around Green', icon: '⛳' },
                { id: 'putting', label: 'Putting', icon: '🏌️‍♂️' },
                { id: 'course', label: 'Course View', icon: '🗺️' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition
                      ${isActive
                        ? 'border-golf-green-600 text-golf-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
}
