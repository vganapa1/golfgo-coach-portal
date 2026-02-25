import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerData } from '../hooks/usePlayerData';
import { useRoundData } from '../hooks/useRoundData';
import { CourseStrategy, HoleStrategy } from '../types';
import Player360Panel from '../components/player/Player360Panel';

export default function CreateStrategy() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { players } = usePlayerData();
  const { rounds, loading: roundsLoading } = useRoundData(playerId);
  
  const player = players.find(p => p.id === playerId);
  const [activeTab, setActiveTab] = useState<'strategy' | 'player360' | 'course'>('strategy');
  const [strategy, setStrategy] = useState<CourseStrategy | null>(null);
  const [coachNotes, setCoachNotes] = useState('');

  const initializeStrategy = () => {
    if (!strategy) {
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
        player_id: playerId!,
        generated_date: new Date().toISOString(),
        holes,
        overall_notes: '',
        approved: false,
        edited_holes: [],
        hole_approvals: {},
      });
    }
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
    if (!strategy) {
      alert('Please initialize the strategy first by clicking "Start Creating Strategy"');
      return;
    }
    
    const finalStrategy: CourseStrategy = {
      ...strategy,
      coach_notes: coachNotes,
      approved: true,
    };
    
    // In production, this would save to database
    console.log('Strategy saved:', finalStrategy);
    
    alert(`Custom strategy sent to ${player?.name}!\n\nIn production, this would:\n- Save to database\n- Generate player-facing PDF\n- Send to player's mobile app`);
    
    navigate('/tournaments');
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-black mb-4">Player Not Found</h2>
          <button
            onClick={() => navigate('/tournaments')}
            className="px-5 py-2.5 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  if (roundsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-light">Loading player data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-black border-b border-gray-900 flex-shrink-0 z-10">
        <div className="px-6 lg:px-8 xl:px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white tracking-tight">
                Create Custom Strategy
              </h1>
              <p className="text-gray-300 font-light mt-2">
                {player.name} • PGA Tour Americas Q-School • Country Club of Ocala • March 17-20, 2026
              </p>
            </div>
            <button
              onClick={() => navigate('/tournaments')}
              className="px-5 py-2.5 bg-gray-800 text-white rounded-apple font-medium hover:bg-gray-700 transition-colors text-sm border border-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-black border-b border-gray-900 sticky top-[120px] z-10">
        <div className="px-6 lg:px-8 xl:px-12">
          <nav className="flex space-x-1">
            {[
              { id: 'strategy', label: 'Strategy Builder' },
              { id: 'player360', label: 'Player360 Profile' },
              { id: 'course', label: 'Course Tour' },
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
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 xl:px-12 py-8 pb-16">
        {activeTab === 'strategy' && (
          <div className="space-y-6 pb-8">
            {!strategy ? (
              <div className="bg-gray-50 rounded-apple p-12 border border-gray-200 text-center">
                <h3 className="text-2xl font-semibold text-black mb-4 tracking-tight">
                  Start Creating Strategy
                </h3>
                <p className="text-gray-600 font-light mb-6 max-w-2xl mx-auto">
                  Create a custom hole-by-hole strategy for {player.name} based on their performance data, 
                  scorecard, and course layout. Use the tabs above to reference player stats, scorecards, 
                  and course information as you build the strategy.
                </p>
                <button
                  onClick={initializeStrategy}
                  className="px-8 py-4 bg-black text-white rounded-apple font-semibold hover:bg-gray-800 transition-colors text-base"
                >
                  Start Creating Strategy
                </button>
              </div>
            ) : (
              <>
                {strategy.holes.map(hole => (
                  <div key={hole.hole_number} className="bg-white rounded-apple border border-gray-200 p-6 shadow-apple">
                    <h4 className="text-xl font-semibold text-black mb-4">Hole {hole.hole_number}</h4>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">Tee Shot</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <input
                              type="text"
                              placeholder="Recommended club (e.g., Driver, 3-wood)"
                              value={hole.tee_shot.recommended_club}
                              onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                tee_shot: { ...hole.tee_shot, recommended_club: e.target.value }
                              })}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black transition"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Target line (e.g., Center of fairway, Left side)"
                              value={hole.tee_shot.target_line}
                              onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                tee_shot: { ...hole.tee_shot, target_line: e.target.value }
                              })}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black transition"
                            />
                          </div>
                        </div>
                        <textarea
                          placeholder="Rationale for tee shot strategy..."
                          value={hole.tee_shot.rationale}
                          onChange={(e) => handleHoleUpdate(hole.hole_number, {
                            tee_shot: { ...hole.tee_shot, rationale: e.target.value }
                          })}
                          className="w-full mt-3 px-4 py-2.5 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black transition"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">Approach</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <input
                              type="text"
                              placeholder="Target area (e.g., Center of green, Back pin)"
                              value={hole.approach.target_area}
                              onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                approach: { ...hole.approach, target_area: e.target.value }
                              })}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black transition"
                            />
                          </div>
                          <div>
                            <select
                              value={hole.approach.strategy}
                              onChange={(e) => handleHoleUpdate(hole.hole_number, {
                                approach: { ...hole.approach, strategy: e.target.value as 'aggressive' | 'conservative' }
                              })}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black transition"
                            >
                              <option value="conservative">Conservative</option>
                              <option value="aggressive">Aggressive</option>
                            </select>
                          </div>
                        </div>
                        <textarea
                          placeholder="Rationale for approach strategy..."
                          value={hole.approach.rationale}
                          onChange={(e) => handleHoleUpdate(hole.hole_number, {
                            approach: { ...hole.approach, rationale: e.target.value }
                          })}
                          className="w-full mt-3 px-4 py-2.5 border border-gray-300 rounded-apple text-sm focus:ring-2 focus:ring-black focus:border-black transition"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-black rounded-apple p-6 border border-gray-900">
                  <label className="block text-sm font-semibold text-white mb-3">Overall Coach Notes</label>
                  <textarea
                    value={coachNotes}
                    onChange={(e) => setCoachNotes(e.target.value)}
                    placeholder="Add overall coaching notes for this tournament strategy..."
                    className="w-full px-4 py-3 border border-gray-700 rounded-apple text-sm bg-gray-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3 mt-8">
                  <button
                    onClick={handleSendToPlayer}
                    className="flex-1 px-6 py-4 bg-black text-white rounded-apple font-semibold hover:bg-gray-800 transition-colors text-base"
                  >
                    Send Strategy to Player
                  </button>
                  <button
                    onClick={() => navigate('/tournaments')}
                    className="px-6 py-4 bg-gray-100 text-black rounded-apple font-semibold hover:bg-gray-200 transition-colors border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'player360' && (
          <div className="bg-white rounded-apple border border-gray-200" style={{ minHeight: 'calc(100vh - 300px)' }}>
            <Player360Panel player={player} rounds={rounds} />
          </div>
        )}

        {activeTab === 'course' && (
          <div className="space-y-6 pb-8">
            <h3 className="text-xl font-semibold text-black tracking-tight mb-4">Course Layout & Images</h3>
            
            <div className="bg-gray-50 rounded-apple p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-black mb-4">Country Club of Ocala</h4>
              <a
                href="https://pgataqs.bluegolf.com/bluegolf/pgataqs26/event/pgataqs263/course/ccocala/detailedscorecard.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-apple p-6 border border-gray-200 hover:shadow-apple transition-all max-w-md"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <h5 className="font-semibold text-black mb-2">Official Scorecard</h5>
                  <p className="text-sm text-gray-600 font-light">View detailed hole-by-hole scorecard on BlueGolf</p>
                </div>
              </a>
            </div>

            <div className="bg-gray-50 rounded-apple p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-black mb-3">Course Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-light">Course:</p>
                  <p className="font-semibold text-black">Country Club of Ocala</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Location:</p>
                  <p className="font-semibold text-black">Ocala, FL</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Par:</p>
                  <p className="font-semibold text-black">72</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Yardage:</p>
                  <p className="font-semibold text-black">6,920 yards</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Rating / Slope:</p>
                  <p className="font-semibold text-black">74.1 / 140</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Tees:</p>
                  <p className="font-semibold text-black">Q-School — Black</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Tournament:</p>
                  <p className="font-semibold text-black">PGA Tour Americas Q-School</p>
                </div>
                <div>
                  <p className="text-gray-600 font-light">Dates:</p>
                  <p className="font-semibold text-black">March 17-20, 2026</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
