import { useState } from 'react';
import { Player, CourseStrategy, HoleStrategy } from '../../types';
import { useRoundData } from '../../hooks/useRoundData';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import Player360Panel from '../player/Player360Panel';
import ScoreCard from '../player/ScoreCard';
import CourseImageGallery from '../course/CourseImageGallery';

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
                  {player.name} • PGA Tour Americas Q-School • Country Club of Ocala
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
              {/* Course header with info + scorecard link */}
              <div className="bg-gray-50 rounded-apple p-6 border border-gray-200">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-black tracking-tight">Country Club of Ocala</h3>
                    <p className="text-sm text-gray-500 mt-1">Ocala, FL &middot; Par 72 &middot; 6,920 yds &middot; Rating 74.1 / Slope 140 &middot; Q-School Black</p>
                  </div>
                  <a
                    href="https://pgataqs.bluegolf.com/bluegolf/pgataqs26/event/pgataqs263/course/ccocala/detailedscorecard.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-apple text-sm font-medium hover:bg-gray-800 transition-colors flex-shrink-0"
                  >
                    Official Scorecard
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-xs text-center">
                  <div className="text-gray-500 font-medium">Tournament</div>
                  <div className="col-span-3 md:col-span-3 text-left font-semibold text-black">PGA Tour Americas Q-School &middot; March 17-20, 2026</div>
                </div>
              </div>

              {/* Hole-by-hole course guide */}
              <div className="bg-white rounded-apple border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-black mb-4">Hole-by-Hole Course Guide</h4>
                <CourseImageGallery />
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
