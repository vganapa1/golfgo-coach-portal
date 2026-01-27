import { useState } from 'react';
import { Player, CourseStrategy, HoleStrategy } from '../../types';
import { useRoundData } from '../../hooks/useRoundData';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import Player360Panel from '../player/Player360Panel';
import ScoreCard from '../player/ScoreCard';

interface CustomStrategyBuilderProps {
  player: Player;
  onSave: (strategy: CourseStrategy) => void;
  onCancel: () => void;
}

export default function CustomStrategyBuilder({ 
  player, 
  onSave, 
  onCancel 
}: CustomStrategyBuilderProps) {
  const { rounds, loading: roundsLoading } = useRoundData(player.id);
  const { aggregateStats } = usePlayerStats(rounds);
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'stats' | 'scorecard' | 'course' | 'strategy'>('stats');
  const [strategy, setStrategy] = useState<CourseStrategy | null>(null);
  const [coachNotes, setCoachNotes] = useState('');

  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);
  const displayRound = selectedRound === 'all' 
    ? sortedRounds[0] 
    : sortedRounds.find(r => r.round_number === selectedRound);

  const handleCreateStrategy = () => {
    if (!strategy) {
      // Initialize empty strategy
      const holes: HoleStrategy[] = [];
      for (let i = 1; i <= 18; i++) {
        holes.push({
          hole_number: i,
          tee_shot: {
            recommended_club: '',
            target_line: '',
            rationale: '',
          },
          approach: {
            target_area: '',
            strategy: 'conservative',
            rationale: '',
          },
          confidence_level: 'medium',
          based_on_rounds: rounds.map(r => r.round_number),
        });
      }
      
      setStrategy({
        player_id: player.id,
        generated_date: new Date().toISOString(),
        holes,
        overall_notes: '',
        approved: false,
        edited_holes: [],
        hole_approvals: {},
      });
    }
    setActiveTab('strategy');
  };

  const handleHoleUpdate = (holeNumber: number, updatedHole: Partial<HoleStrategy>) => {
    if (!strategy) return;
    
    const updatedHoles = strategy.holes.map(hole => 
      hole.hole_number === holeNumber 
        ? { ...hole, ...updatedHole }
        : hole
    );
    
    setStrategy({
      ...strategy,
      holes: updatedHoles,
    });
  };

  const handleSendToPlayer = () => {
    if (!strategy) return;
    
    const finalStrategy: CourseStrategy = {
      ...strategy,
      coach_notes: coachNotes,
      approved: true,
    };
    
    onSave(finalStrategy);
    
    // Show success message
    alert(`Custom strategy sent to ${player.name}!\n\nIn production, this would:\n- Save to database\n- Generate player-facing PDF\n- Send to player's mobile app`);
  };

  if (roundsLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-apple-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-light text-center">Loading player data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-black border-b border-gray-900 sticky top-0 z-10">
          <div className="px-6 lg:px-8 xl:px-12 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white tracking-tight">
                  Create Custom Strategy
                </h2>
                <p className="text-gray-300 font-light mt-2">
                  {player.name} • Okeeheelee February Classic
                </p>
              </div>
              <button
                onClick={onCancel}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-apple font-medium hover:bg-gray-700 transition-colors text-sm border border-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black border-b border-gray-900 sticky top-[88px] z-10">
          <div className="px-6 lg:px-8 xl:px-12">
            <nav className="flex space-x-1">
              {[
                { id: 'stats', label: 'Player Stats' },
                { id: 'scorecard', label: 'Scorecard' },
                { id: 'course', label: 'Course Images' },
                { id: 'strategy', label: 'Strategy Builder' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-white text-white'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 xl:px-12 py-8">
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-apple p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-black mb-4 tracking-tight">Player Performance Overview</h3>
                {aggregateStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-apple p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 font-light">Average Score</p>
                      <p className="text-2xl font-semibold text-black mt-1">
                        {aggregateStats.avg_score.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-white rounded-apple p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 font-light">Fairways Hit %</p>
                      <p className="text-2xl font-semibold text-black mt-1">
                        {(aggregateStats.avg_fairways_pct * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-apple p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 font-light">GIR %</p>
                      <p className="text-2xl font-semibold text-black mt-1">
                        {(aggregateStats.avg_gir_pct * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-apple p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 font-light">Putts per Round</p>
                      <p className="text-2xl font-semibold text-black mt-1">
                        {aggregateStats.avg_putts_per_round.toFixed(1)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-apple border border-gray-200">
                <Player360Panel player={player} rounds={rounds} />
              </div>
            </div>
          )}

          {activeTab === 'scorecard' && displayRound && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-black tracking-tight">Round Scorecard</h3>
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-apple text-sm"
                >
                  <option value="all">Latest Round</option>
                  {sortedRounds.map(round => (
                    <option key={round.round_number} value={round.round_number}>
                      Round {round.round_number}
                    </option>
                  ))}
                </select>
              </div>
              <ScoreCard round={displayRound} />
            </div>
          )}

          {activeTab === 'course' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-black tracking-tight mb-4">Course Layout & Images</h3>
              
              <div className="bg-gray-50 rounded-apple p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-black mb-4">Okeeheelee Golf Course</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="https://www.minorleaguegolf.com/scorecardview.asp?record_ID=132"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-apple p-6 border border-gray-200 hover:shadow-apple transition-all"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">📊</div>
                      <h5 className="font-semibold text-black mb-2">Official Scorecard</h5>
                      <p className="text-sm text-gray-600 font-light">View detailed hole-by-hole scorecard</p>
                    </div>
                  </a>
                  
                  <a
                    href="https://www.pbcokeeheeleegolf.com/golf-course/2016-08-29-17-45-26#prettyPhoto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-apple p-6 border border-gray-200 hover:shadow-apple transition-all"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🗺️</div>
                      <h5 className="font-semibold text-black mb-2">Course Layout Gallery</h5>
                      <p className="text-sm text-gray-600 font-light">View hole-by-hole course images</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 rounded-apple p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-black mb-3">Course Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-light">Course:</p>
                    <p className="font-semibold text-black">Okeeheelee Golf Course</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-light">Par:</p>
                    <p className="font-semibold text-black">70</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-light">Yardage:</p>
                    <p className="font-semibold text-black">6,713 yards</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-light">Tournament Date:</p>
                    <p className="font-semibold text-black">February 16, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-black tracking-tight">Hole-by-Hole Strategy</h3>
                {!strategy && (
                  <button
                    onClick={handleCreateStrategy}
                    className="px-5 py-2.5 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm"
                  >
                    Initialize Strategy
                  </button>
                )}
              </div>

              {strategy ? (
                <>
                  {strategy.holes.map(hole => (
                    <div key={hole.hole_number} className="bg-white rounded-apple border border-gray-200 p-6">
                      <h4 className="text-lg font-semibold text-black mb-4">Hole {hole.hole_number}</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-black mb-2">Tee Shot</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <input
                                type="text"
                                placeholder="Recommended club"
                                value={hole.tee_shot.recommended_club}
                                onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                  tee_shot: { ...hole.tee_shot, recommended_club: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                placeholder="Target line"
                                value={hole.tee_shot.target_line}
                                onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                  tee_shot: { ...hole.tee_shot, target_line: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black"
                              />
                            </div>
                          </div>
                          <textarea
                            placeholder="Rationale..."
                            value={hole.tee_shot.rationale}
                            onChange={(e) => handleHoleUpdate(hole.hole_number, {
                              tee_shot: { ...hole.tee_shot, rationale: e.target.value }
                            })}
                            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black"
                            rows={2}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-black mb-2">Approach</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <input
                                type="text"
                                placeholder="Target area"
                                value={hole.approach.target_area}
                                onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                  approach: { ...hole.approach, target_area: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black"
                              />
                            </div>
                            <div>
                              <select
                                value={hole.approach.strategy}
                                onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                  approach: { ...hole.approach, strategy: e.target.value as 'aggressive' | 'conservative' }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black"
                              >
                                <option value="conservative">Conservative</option>
                                <option value="aggressive">Aggressive</option>
                              </select>
                            </div>
                          </div>
                          <textarea
                            placeholder="Rationale..."
                            value={hole.approach.rationale}
                            onChange={(e) => handleHoleUpdate(hole.hole_number, {
                              approach: { ...hole.approach, rationale: e.target.value }
                            })}
                            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-black rounded-apple p-6 border border-gray-900">
                    <label className="block text-sm font-semibold text-white mb-2">Overall Coach Notes</label>
                    <textarea
                      value={coachNotes}
                      onChange={(e) => setCoachNotes(e.target.value)}
                      placeholder="Add overall coaching notes for this tournament strategy..."
                      className="w-full px-4 py-2 border border-gray-700 rounded-apple text-sm bg-gray-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSendToPlayer}
                      className="flex-1 px-6 py-4 bg-black text-white rounded-apple font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Send Strategy to Player
                    </button>
                    <button
                      onClick={onCancel}
                      className="px-6 py-4 bg-gray-100 text-black rounded-apple font-semibold hover:bg-gray-200 transition-colors border border-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-apple p-8 border border-gray-200 text-center">
                  <p className="text-gray-600 font-light mb-4">
                    Click "Initialize Strategy" to start creating a custom strategy for all 18 holes.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
