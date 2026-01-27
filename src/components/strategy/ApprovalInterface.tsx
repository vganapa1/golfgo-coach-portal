import { useState } from 'react';
import { CourseStrategy } from '../../types';
import ConfidenceKey from './ConfidenceKey';

interface ApprovalInterfaceProps {
  strategy: CourseStrategy;
  onApprove?: (notes?: string) => void; // Optional - no longer used with new approval workflow
  onReject?: () => void; // Optional - no longer used with new approval workflow
  coachNotes?: string;
  onNotesChange?: (notes: string) => void;
  onScrollToPending?: () => void;
  onSignOff?: () => void;
  canSignOff?: boolean;
}

export default function ApprovalInterface({ 
  strategy, 
  onApprove: _onApprove, 
  onReject: _onReject,
  coachNotes: externalCoachNotes,
  onNotesChange,
  onScrollToPending,
  onSignOff,
  canSignOff = false
}: ApprovalInterfaceProps) {
  const [internalCoachNotes, setInternalCoachNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  
  const coachNotes = externalCoachNotes !== undefined ? externalCoachNotes : internalCoachNotes;
  const handleNotesChange = (value: string) => {
    if (onNotesChange) {
      onNotesChange(value);
    } else {
      setInternalCoachNotes(value);
    }
  };

  // Calculate approval progress
  const totalRequiringApproval = strategy.holes.filter(h => 
    h.confidence_level === 'medium' || h.confidence_level === 'low'
  ).length;
  
  const approvedCount = strategy.holes.filter(h => {
    const requiresApproval = h.confidence_level === 'medium' || h.confidence_level === 'low';
    return requiresApproval && (strategy.hole_approvals?.[h.hole_number]?.approved || false);
  }).length;

  const pendingHoles = strategy.holes.filter(h => {
    const requiresApproval = h.confidence_level === 'medium' || h.confidence_level === 'low';
    return requiresApproval && !(strategy.hole_approvals?.[h.hole_number]?.approved || false);
  });

  const highConfidence = strategy.holes.filter(h => h.confidence_level === 'high').length;
  const mediumConfidence = strategy.holes.filter(h => h.confidence_level === 'medium').length;
  const lowConfidence = strategy.holes.filter(h => h.confidence_level === 'low').length;

  return (
    <div className="bg-black rounded-apple shadow-apple-lg p-5 sticky top-4 border border-gray-900">
      <h3 className="text-base font-semibold text-white mb-4 tracking-tight">Strategy Review</h3>
      
      {/* Approval Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400">Approval Progress</span>
          <span className="text-xs font-semibold text-white">
            {approvedCount}/{totalRequiringApproval}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalRequiringApproval > 0 ? (approvedCount / totalRequiringApproval) * 100 : 100}%` }}
          ></div>
        </div>
        {pendingHoles.length > 0 && (
          <p className="text-xs text-gray-400 mt-1 font-light">
            {pendingHoles.length} hole{pendingHoles.length > 1 ? 's' : ''} pending approval
          </p>
        )}
      </div>

      {/* Pending Holes List */}
      {pendingHoles.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-white mb-2">Pending Holes:</p>
          <div className="flex flex-wrap gap-1">
            {pendingHoles.slice(0, 6).map(hole => (
              <button
                key={hole.hole_number}
                onClick={() => {
                  const element = document.getElementById(`hole-${hole.hole_number}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="px-2 py-1 bg-gray-800 text-white rounded-full text-xs font-medium hover:bg-gray-700 transition-colors border border-gray-700"
              >
                {hole.hole_number}
              </button>
            ))}
            {pendingHoles.length > 6 && (
              <span className="px-2 py-1 text-xs text-gray-500 font-light">+{pendingHoles.length - 6} more</span>
            )}
          </div>
        </div>
      )}

      {/* Confidence Summary with Counts */}
      <div className="mb-4">
        <ConfidenceKey />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-600 font-light">High: <span className="font-semibold text-black">{highConfidence}</span></span>
          <span className="text-gray-600 font-light">Medium: <span className="font-semibold text-black">{mediumConfidence}</span></span>
          <span className="text-gray-600 font-light">Low: <span className="font-semibold text-black">{lowConfidence}</span></span>
        </div>
      </div>

      {/* Overall Coach Notes */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-white mb-1.5">
          Overall Strategy Notes
        </label>
        {!showNotesInput ? (
          <button
            onClick={() => setShowNotesInput(true)}
            className="w-full px-4 py-2.5 text-sm border border-gray-700 text-white rounded-apple font-medium hover:bg-gray-900 transition-colors"
          >
            + Add Overall Coaching Notes
          </button>
        ) : (
          <textarea
            value={coachNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add overall coaching notes for this strategy..."
            className="w-full px-4 py-2.5 text-sm border border-gray-700 rounded-apple focus:ring-2 focus:ring-white focus:border-white transition bg-gray-900 text-white placeholder-gray-500"
            rows={4}
          />
        )}
      </div>

      {/* Quick Actions */}
      {onScrollToPending && pendingHoles.length > 0 && (
        <button
          onClick={onScrollToPending}
          className="w-full mb-2 px-4 py-2.5 text-sm bg-gray-800 text-white rounded-apple font-medium hover:bg-gray-700 transition-colors border border-gray-700"
        >
          Review Approvals
        </button>
      )}

      {onSignOff && (
        <button
          onClick={onSignOff}
          disabled={!canSignOff}
          className={`w-full px-4 py-2.5 text-sm rounded-apple font-medium transition-colors ${
            canSignOff
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          Sign Off & Send to Player
        </button>
      )}

      <p className="mt-4 text-xs text-gray-400 text-center font-light">
        Generated on {new Date(strategy.generated_date).toLocaleDateString()}
      </p>
    </div>
  );
}
