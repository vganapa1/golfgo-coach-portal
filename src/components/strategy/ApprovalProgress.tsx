import { useState } from 'react';
import { CourseStrategy } from '../../types';

interface ApprovalProgressProps {
  strategy: CourseStrategy;
  onFilterChange?: (filter: 'all' | 'pending' | 'approved') => void;
  currentFilter?: 'all' | 'pending' | 'approved';
}

export default function ApprovalProgress({ 
  strategy, 
  onFilterChange,
  currentFilter = 'all'
}: ApprovalProgressProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Calculate approval statistics
  const stats = {
    high: { total: 0, approved: 0 },
    medium: { total: 0, approved: 0 },
    low: { total: 0, approved: 0 }
  };

  let totalRequiringApproval = 0;
  let totalApproved = 0;

  strategy.holes.forEach(hole => {
    const requiresApproval = hole.confidence_level === 'medium' || hole.confidence_level === 'low';
    const isApproved = strategy.hole_approvals?.[hole.hole_number]?.approved || false;
    
    if (hole.confidence_level === 'high') {
      stats.high.total++;
      stats.high.approved++; // High confidence auto-approved
      totalApproved++;
    } else if (hole.confidence_level === 'medium') {
      stats.medium.total++;
      if (isApproved) {
        stats.medium.approved++;
        totalApproved++;
      }
      if (requiresApproval) totalRequiringApproval++;
    } else if (hole.confidence_level === 'low') {
      stats.low.total++;
      if (isApproved) {
        stats.low.approved++;
        totalApproved++;
      }
      if (requiresApproval) totalRequiringApproval++;
    }
  });

  const pendingCount = totalRequiringApproval - (totalApproved - stats.high.approved);
  const progressPercentage = totalRequiringApproval > 0 
    ? ((totalApproved - stats.high.approved) / totalRequiringApproval) * 100 
    : 100;

  const scrollToHole = (holeNumber: number) => {
    const element = document.getElementById(`hole-${holeNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight briefly
      element.classList.add('ring-4', 'ring-golf-green-400');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-golf-green-400');
      }, 2000);
    }
  };

  const getPendingHoles = () => {
    return strategy.holes
      .filter(hole => {
        const requiresApproval = hole.confidence_level === 'medium' || hole.confidence_level === 'low';
        const isApproved = strategy.hole_approvals?.[hole.hole_number]?.approved || false;
        return requiresApproval && !isApproved;
      })
      .map(hole => hole.hole_number);
  };

  const pendingHoles = getPendingHoles();

  return (
    <div className="bg-black rounded-apple shadow-apple-lg mb-6 border border-gray-900">
      {/* Header - Always Visible */}
      <div 
        className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-900 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-white tracking-tight">Approval Status</h3>
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium border border-gray-700">
              {pendingCount} holes require approval
            </span>
          )}
          {pendingCount === 0 && totalRequiringApproval > 0 && (
            <span className="px-3 py-1 bg-white text-black rounded-full text-sm font-medium">
              ✓ All holes approved
            </span>
          )}
        </div>
        <button className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
          {isCollapsed ? '▼ Expand' : '▲ Collapse'}
        </button>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="px-6 pb-6 border-t border-gray-200 pt-4">

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2 font-light">
              <span>Progress</span>
              <span className="font-semibold text-black">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-black h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Confidence breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* HIGH */}
            <div className={`rounded-apple p-4 border ${
              stats.high.approved === stats.high.total
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-800 border-gray-700'
            }`}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">High</div>
              <div className="text-2xl font-semibold text-white mt-1">
                {stats.high.approved}/{stats.high.total}
              </div>
              <div className="text-xs text-gray-400 font-light mt-1">Auto-approved</div>
            </div>

            {/* MEDIUM */}
            <div className={`rounded-apple p-4 border ${
              stats.medium.approved === stats.medium.total
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-800 border-gray-700'
            }`}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Medium</div>
              <div className="text-2xl font-semibold text-white mt-1">
                {stats.medium.approved}/{stats.medium.total}
              </div>
              <div className="text-xs text-gray-400 font-light mt-1">
                {stats.medium.approved === stats.medium.total 
                  ? 'All approved' 
                  : `${stats.medium.total - stats.medium.approved} pending`}
              </div>
            </div>

            {/* LOW */}
            <div className={`rounded-apple p-4 border ${
              stats.low.approved === stats.low.total
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-800 border-gray-700'
            }`}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Low</div>
              <div className="text-2xl font-semibold text-white mt-1">
                {stats.low.approved}/{stats.low.total}
              </div>
              <div className="text-xs text-gray-400 font-light mt-1">
                {stats.low.approved === stats.low.total 
                  ? 'All approved' 
                  : stats.low.total === 0 
                    ? 'No low confidence holes'
                    : `${stats.low.total - stats.low.approved} pending`}
              </div>
            </div>
          </div>

          {/* Filter buttons */}
          {onFilterChange && (
            <div className="flex space-x-2 mb-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange('all');
                }}
                className={`px-4 py-2 rounded-apple font-medium transition-colors text-sm ${
                  currentFilter === 'all'
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Show All
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange('pending');
                }}
                className={`px-4 py-2 rounded-apple font-medium transition-colors text-sm ${
                  currentFilter === 'pending'
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Pending Only ({pendingHoles.length})
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterChange('approved');
                }}
                className={`px-4 py-2 rounded-apple font-medium transition-colors text-sm ${
                  currentFilter === 'approved'
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Approved Only
              </button>
            </div>
          )}

          {/* Pending holes list */}
          {pendingHoles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Pending Holes:</h4>
              <div className="flex flex-wrap gap-2">
                {pendingHoles.map(holeNum => (
                  <button
                    key={holeNum}
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToHole(holeNum);
                    }}
                    className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    Hole {holeNum}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
