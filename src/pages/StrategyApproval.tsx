import { useState, useEffect } from 'react';
import { usePlayerData } from '../hooks/usePlayerData';
import { useRoundData } from '../hooks/useRoundData';
import { generateCourseStrategy } from '../utils/strategyEngine';
import { CourseStrategy, HoleStrategy } from '../types';
import PlayerSelector from '../components/strategy/PlayerSelector';
import StrategyCard from '../components/strategy/StrategyCard';
import ApprovalInterface from '../components/strategy/ApprovalInterface';
import ApprovalProgress from '../components/strategy/ApprovalProgress';
import ConfidenceKey from '../components/strategy/ConfidenceKey';
import Player360Panel from '../components/player/Player360Panel';

export default function StrategyApproval() {
  const { players, loading: playersLoading } = usePlayerData();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const { rounds, loading: roundsLoading } = useRoundData(selectedPlayerId || undefined);
  const [strategy, setStrategy] = useState<CourseStrategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coachNotes, setCoachNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showSignOffModal, setShowSignOffModal] = useState(false);

  // Generate strategy when player is selected and rounds are loaded
  useEffect(() => {
    if (selectedPlayerId && rounds.length > 0 && !strategy) {
      setIsGenerating(true);
      setTimeout(() => {
        const generatedStrategy = generateCourseStrategy(selectedPlayerId, rounds);
        setStrategy(generatedStrategy);
        setIsGenerating(false);
      }, 1500);
    }
  }, [selectedPlayerId, rounds, strategy]);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setStrategy(null);
    setCoachNotes('');
    setFilter('all');
  };

  const handleHoleUpdate = (updatedHole: HoleStrategy) => {
    if (!strategy) return;
    
    const updatedHoles = strategy.holes.map(h => 
      h.hole_number === updatedHole.hole_number ? updatedHole : h
    );
    
    const editedHoles = strategy.edited_holes || [];
    if (!editedHoles.includes(updatedHole.hole_number)) {
      editedHoles.push(updatedHole.hole_number);
    }
    
    setStrategy({
      ...strategy,
      holes: updatedHoles,
      edited_holes: editedHoles,
    });
  };

  const handleHoleApprove = (holeNumber: number) => {
    if (!strategy) return;
    
    const updatedApprovals = {
      ...strategy.hole_approvals,
      [holeNumber]: {
        approved: true,
        requires_approval: strategy.hole_approvals?.[holeNumber]?.requires_approval || false,
        approved_at: new Date().toISOString(),
      },
    };
    
    setStrategy({
      ...strategy,
      hole_approvals: updatedApprovals,
    });
  };

  const handleHoleReject = (_holeNumber: number) => {
    // Reject just marks it for editing, which is handled in the card
    // The actual rejection/editing happens in the card component
  };

  const handleApproveAllHigh = () => {
    if (!strategy) return;
    
    const updatedApprovals = { ...strategy.hole_approvals };
    strategy.holes.forEach(hole => {
      if (hole.confidence_level === 'high' && !updatedApprovals[hole.hole_number]?.approved) {
        updatedApprovals[hole.hole_number] = {
          approved: true,
          requires_approval: false,
          approved_at: new Date().toISOString(),
        };
      }
    });
    
    setStrategy({
      ...strategy,
      hole_approvals: updatedApprovals,
    });
  };

  const canSignOff = () => {
    if (!strategy) return false;
    
    // Check if all medium/low confidence holes are approved
    const allApproved = strategy.holes.every(hole => {
      const requiresApproval = hole.confidence_level === 'medium' || hole.confidence_level === 'low';
      if (!requiresApproval) return true; // High confidence auto-approved
      
      return strategy.hole_approvals?.[hole.hole_number]?.approved || false;
    });
    
    return allApproved;
  };

  const handleSignOff = () => {
    if (!strategy || !canSignOff()) return;
    setShowSignOffModal(true);
  };

  const confirmSignOff = () => {
    if (!strategy) return;
    
    const approvedStrategy: CourseStrategy = {
      ...strategy,
      approved: true,
      coach_notes: coachNotes || undefined,
    };
    
    setStrategy(approvedStrategy);
    setShowSignOffModal(false);
    
    const playerName = players.find(p => p.id === selectedPlayerId)?.name;
    alert(`Strategy approved and sent to ${playerName}!\n\nIn production, this would:\n- Save to database\n- Generate player-facing PDF\n- Send to player's mobile app`);
  };

  const getFilteredHoles = () => {
    if (!strategy) return [];
    
    if (filter === 'all') return strategy.holes;
    if (filter === 'pending') {
      return strategy.holes.filter(hole => {
        const requiresApproval = hole.confidence_level === 'medium' || hole.confidence_level === 'low';
        const isApproved = strategy.hole_approvals?.[hole.hole_number]?.approved || false;
        return requiresApproval && !isApproved;
      });
    }
    if (filter === 'approved') {
      return strategy.holes.filter(hole => 
        strategy.hole_approvals?.[hole.hole_number]?.approved || false
      );
    }
    return strategy.holes;
  };

  const scrollToFirstPending = () => {
    if (!strategy) return;
    
    const pendingHole = strategy.holes.find(hole => {
      const requiresApproval = hole.confidence_level === 'medium' || hole.confidence_level === 'low';
      const isApproved = strategy.hole_approvals?.[hole.hole_number]?.approved || false;
      return requiresApproval && !isApproved;
    });
    
    if (pendingHole) {
      const element = document.getElementById(`hole-${pendingHole.hole_number}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (playersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-light">Loading players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 lg:px-8 xl:px-12 py-10 bg-black border-b border-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-semibold text-white tracking-tight">
              Coach Review and Recommendation System
            </h1>
            <p className="mt-3 text-base text-gray-300 font-light">
              Select a player below to generate personalized course management strategies based on their practice round data
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <p className="text-sm font-medium text-red-500">Logged in as Coach Ryan</p>
            <div className="flex items-center space-x-3">
              <span className="text-red-500 italic font-serif text-lg" style={{ fontStyle: 'italic', fontFamily: 'serif' }}>
                floridian.
              </span>
              <span className="text-sm font-medium text-red-500">|</span>
              <img 
                src="/image 5.png" 
                alt="GolfGo" 
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex w-full">
        {/* Left Side - Strategy Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 xl:px-12 py-6 min-w-0">
          {/* Player Selection */}
          {!selectedPlayerId && (
            <PlayerSelector
              players={players}
              selectedPlayerId={selectedPlayerId}
              onPlayerSelect={handlePlayerSelect}
            />
          )}

          {/* Loading State */}
          {selectedPlayerId && (roundsLoading || isGenerating) && (
            <div className="flex items-center justify-center py-12 bg-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto"></div>
                <p className="mt-4 text-gray-600 font-light">
                  {isGenerating ? 'Analyzing practice rounds and generating strategy...' : 'Loading round data...'}
                </p>
              </div>
            </div>
          )}

          {/* No Data State */}
          {selectedPlayerId && !roundsLoading && rounds.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-apple p-6">
              <h3 className="text-lg font-semibold text-black mb-2 tracking-tight">No Practice Data Available</h3>
              <p className="text-gray-600 font-light">
                {players.find(p => p.id === selectedPlayerId)?.name} needs to complete practice rounds before strategies can be generated.
              </p>
              <button
                onClick={() => setSelectedPlayerId(null)}
                className="mt-4 px-5 py-2.5 bg-black text-white rounded-apple hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Select Different Player
              </button>
            </div>
          )}

          {/* Strategy Display */}
          {strategy && !isGenerating && (
            <div className="space-y-6">
              {/* Player Header */}
              <div className="flex items-center justify-between bg-white rounded-apple shadow-apple p-6 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {players.find(p => p.id === selectedPlayerId)?.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-black tracking-tight">
                      {players.find(p => p.id === selectedPlayerId)?.name}
                    </h2>
                    <p className="text-sm text-gray-600 font-light mt-1">
                      Strategy based on {rounds.length} practice rounds
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlayerId(null);
                    setStrategy(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 text-black rounded-apple font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Change Player
                </button>
              </div>

              {/* Approved Banner */}
              {strategy.approved && (
                <div className="bg-black border border-gray-900 rounded-apple p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black text-xl">
                        ✓
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Strategy Approved</h3>
                        <p className="text-sm text-gray-300 font-light">Ready for player review</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlayerId(null);
                        setStrategy(null);
                      }}
                      className="px-5 py-2.5 bg-white text-black rounded-apple font-medium hover:bg-gray-100 transition-colors text-sm"
                    >
                      Review Another Player
                    </button>
                  </div>
                  {strategy.coach_notes && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-apple border border-gray-800">
                      <h4 className="text-sm font-semibold text-white mb-2">Coach Notes:</h4>
                      <p className="text-sm text-gray-300 font-light">{strategy.coach_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Approval Progress Tracker */}
              {!strategy.approved && (
                <ApprovalProgress 
                  strategy={strategy} 
                  onFilterChange={setFilter}
                  currentFilter={filter}
                />
              )}

              {/* Bulk Actions */}
              {!strategy.approved && (
                <div className="flex space-x-3 bg-black rounded-apple p-4 border border-gray-900">
                  <button
                    onClick={handleApproveAllHigh}
                    className="px-5 py-2.5 bg-white text-black rounded-apple font-medium hover:bg-gray-100 transition-colors text-sm"
                  >
                    Approve All High Confidence
                  </button>
                  <button
                    onClick={() => {
                      setFilter('pending');
                      scrollToFirstPending();
                    }}
                    className="px-5 py-2.5 bg-gray-800 text-white rounded-apple font-medium hover:bg-gray-700 transition-colors text-sm border border-gray-700"
                  >
                    Review Medium & Low Confidence
                  </button>
                </div>
              )}

              {/* Strategy Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-black rounded-apple p-5">
                  <h3 className="text-2xl font-semibold text-white tracking-tight">Hole-by-Hole Strategy</h3>
                </div>
                <ConfidenceKey />
                {getFilteredHoles().map((holeStrategy) => (
                  <StrategyCard
                    key={holeStrategy.hole_number}
                    strategy={holeStrategy}
                    courseStrategy={strategy}
                    onUpdate={handleHoleUpdate}
                    onApprove={handleHoleApprove}
                    onReject={handleHoleReject}
                  />
                ))}
              </div>

              {/* Approval Interface - Sidebar */}
              {!strategy.approved && (
                <div className="sticky top-6">
                  <ApprovalInterface
                    strategy={strategy}
                    coachNotes={coachNotes}
                    onNotesChange={setCoachNotes}
                    onScrollToPending={scrollToFirstPending}
                    onSignOff={handleSignOff}
                    canSignOff={canSignOff()}
                  />
                </div>
              )}

              {/* Final Sign-Off Section */}
              {!strategy.approved && (
                <div className="mt-8 pt-6 border-t border-gray-800 bg-black rounded-apple p-6 border border-gray-900 shadow-apple-lg">
                  <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">Final Approval</h3>
                  
                  {/* Approval Summary */}
                  <div className="bg-gray-900 rounded-apple p-4 mb-4 space-y-2 border border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">High Confidence (Auto-approved):</span>
                      <span className="text-sm font-semibold text-white">
                        {strategy.holes.filter(h => h.confidence_level === 'high').length} holes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Medium Confidence (Reviewed & Approved):</span>
                      <span className="text-sm font-semibold text-white">
                        {strategy.holes.filter(h => 
                          h.confidence_level === 'medium' && strategy.hole_approvals?.[h.hole_number]?.approved
                        ).length} / {strategy.holes.filter(h => h.confidence_level === 'medium').length} holes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Low Confidence (Reviewed & Approved):</span>
                      <span className="text-sm font-semibold text-white">
                        {strategy.holes.filter(h => 
                          h.confidence_level === 'low' && strategy.hole_approvals?.[h.hole_number]?.approved
                        ).length} / {strategy.holes.filter(h => h.confidence_level === 'low').length} holes
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOff}
                    disabled={!canSignOff()}
                    className={`w-full px-6 py-4 rounded-apple font-semibold text-base transition-colors ${
                      canSignOff()
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Sign Off & Send to Player
                  </button>
                  
                  {!canSignOff() && (
                    <p className="text-sm text-gray-400 mt-3 text-center font-light">
                      Please approve all medium and low confidence holes before signing off
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Player360 Panel */}
        {selectedPlayerId && rounds.length > 0 && (
          <div className="w-[42%] min-w-[500px] max-w-[900px] flex-shrink-0 border-l border-gray-300">
            {isGenerating ? (
              <div className="h-full flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golf-green-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading player data...</p>
                </div>
              </div>
            ) : (
              <Player360Panel
                player={players.find(p => p.id === selectedPlayerId)!}
                rounds={rounds}
              />
            )}
          </div>
        )}
      </div>

      {/* Sign-Off Confirmation Modal */}
      {showSignOffModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-apple-lg shadow-apple-lg p-8 max-w-md w-full mx-4 border border-gray-100">
            <h3 className="text-2xl font-semibold text-black mb-4 tracking-tight">Confirm Sign-Off</h3>
            <p className="text-gray-700 mb-4 font-light">
              Are you sure you want to send this strategy to{' '}
              <span className="font-semibold text-black">
                {players.find(p => p.id === selectedPlayerId)?.name}
              </span>?
            </p>
            <p className="text-sm text-gray-600 mb-6 font-light">
              This will mark the strategy as approved and ready for player review.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmSignOff}
                className="flex-1 px-5 py-2.5 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowSignOffModal(false)}
                className="flex-1 px-5 py-2.5 bg-gray-100 text-black rounded-apple font-medium hover:bg-gray-200 transition-colors text-sm border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
