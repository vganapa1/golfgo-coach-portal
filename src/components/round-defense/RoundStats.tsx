import { useState } from 'react';
import { Round, Player } from '../../types';
import { mapToClippDFormat } from '../../utils/clippDMapping';
import ClippDCategorySection from '../clippd/ClippDCategorySection';

interface RoundStatsProps {
  round: Round;
  player: Player;
  allRounds: Round[];
}

export default function RoundStats({ round, player, allRounds }: RoundStatsProps) {
  const [selectedClippDCategory, setSelectedClippDCategory] = useState<string | null>(null);
  
  // Get ClippD data
  const clippDData = allRounds.length > 0 ? mapToClippDFormat(player, allRounds) : null;
  const { summary } = round;
  
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const formatStrokesGained = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
  };

  const getStrokesGainedColor = (value: number) => {
    if (value > 0.5) return 'text-green-600';
    if (value < -0.5) return 'text-red-600';
    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-apple shadow-apple border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Round Statistics</h3>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-semibold text-gray-900">ClippD Data:</label>
          <select
            value={selectedClippDCategory || ''}
            onChange={(e) => setSelectedClippDCategory(e.target.value || null)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-apple text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="">Select Category</option>
            {clippDData?.categories.map((category, index) => (
              <option key={index} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* ClippD Category Display */}
      {selectedClippDCategory && clippDData && (
        <div className="mb-6">
          {clippDData.categories
            .filter(cat => cat.name === selectedClippDCategory)
            .map((category, index) => (
              <ClippDCategorySection key={index} category={category} />
            ))}
        </div>
      )}
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-apple p-4 text-center">
          <p className="text-xs text-gray-500 font-light uppercase tracking-wide mb-1">Fairways</p>
          <p className="text-2xl font-semibold text-black">
            {summary.fairways_hit}/{summary.fairways_possible}
          </p>
          <p className="text-sm text-gray-600">{formatPercentage(summary.fairways_pct)}</p>
        </div>
        
        <div className="bg-gray-50 rounded-apple p-4 text-center">
          <p className="text-xs text-gray-500 font-light uppercase tracking-wide mb-1">GIR</p>
          <p className="text-2xl font-semibold text-black">
            {summary.gir}/{summary.gir_possible}
          </p>
          <p className="text-sm text-gray-600">{formatPercentage(summary.gir_pct)}</p>
        </div>
        
        <div className="bg-gray-50 rounded-apple p-4 text-center">
          <p className="text-xs text-gray-500 font-light uppercase tracking-wide mb-1">Total Putts</p>
          <p className="text-2xl font-semibold text-black">{summary.total_putts}</p>
          <p className="text-sm text-gray-600">{summary.putts_per_hole.toFixed(1)} per hole</p>
        </div>
        
        <div className="bg-gray-50 rounded-apple p-4 text-center">
          <p className="text-xs text-gray-500 font-light uppercase tracking-wide mb-1">3-Putts</p>
          <p className="text-2xl font-semibold text-black">{summary.three_putts}</p>
          <p className="text-sm text-gray-600">this round</p>
        </div>
      </div>

      {/* Scrambling Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-apple p-4">
          <p className="text-xs text-gray-500 font-light uppercase tracking-wide mb-1">Up & Downs</p>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-semibold text-black">
              {summary.up_and_downs}/{summary.up_and_down_attempts}
            </p>
            <p className="text-sm text-gray-600">{formatPercentage(summary.up_and_down_pct)}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-apple p-4">
          <p className="text-xs text-gray-500 font-light uppercase tracking-wide mb-1">Scrambling</p>
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-semibold text-black">
              {summary.scrambles}/{summary.scramble_attempts}
            </p>
            <p className="text-sm text-gray-600">{formatPercentage(summary.scramble_pct)}</p>
          </div>
        </div>
      </div>

      {/* Strokes Gained */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Strokes Gained</h4>
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Off Tee</p>
            <p className={`text-lg font-semibold ${getStrokesGainedColor(summary.strokes_gained.ott)}`}>
              {formatStrokesGained(summary.strokes_gained.ott)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Approach</p>
            <p className={`text-lg font-semibold ${getStrokesGainedColor(summary.strokes_gained.app)}`}>
              {formatStrokesGained(summary.strokes_gained.app)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Short Game</p>
            <p className={`text-lg font-semibold ${getStrokesGainedColor(summary.strokes_gained.arg)}`}>
              {formatStrokesGained(summary.strokes_gained.arg)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Putting</p>
            <p className={`text-lg font-semibold ${getStrokesGainedColor(summary.strokes_gained.putt)}`}>
              {formatStrokesGained(summary.strokes_gained.putt)}
            </p>
          </div>
          <div className="text-center bg-gray-100 rounded-apple py-1">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className={`text-lg font-bold ${getStrokesGainedColor(summary.strokes_gained.total)}`}>
              {formatStrokesGained(summary.strokes_gained.total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
