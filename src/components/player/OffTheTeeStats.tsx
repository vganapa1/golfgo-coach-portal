import { OffTheTeeStats } from '../../utils/playerTendencies';

interface OffTheTeeStatsProps {
  stats: OffTheTeeStats;
}

export default function OffTheTeeStatsComponent({ stats }: OffTheTeeStatsProps) {
  // Create 18-hole grid for fairways
  const holeNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Avg Driving Distance</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats.avg_driving_distance.toFixed(0)} yds
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Fairways Hit</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {(stats.fairways_hit_pct * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Miss Pattern</div>
          <div className="text-lg font-bold text-gray-900 mt-2">
            Left: {(stats.miss_pattern.left).toFixed(0)}% | Right: {(stats.miss_pattern.right).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Fairways by Hole Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Fairways Hit by Hole</h3>
        <div className="grid grid-cols-9 gap-2">
          {holeNumbers.map(hole => {
            const holeData = stats.fairways_by_hole[hole];
            if (!holeData || holeData.total === 0) {
              return (
                <div key={hole} className="text-center p-2 bg-gray-100 rounded">
                  <div className="text-xs font-semibold text-gray-500">H{hole}</div>
                  <div className="text-xs text-gray-400">N/A</div>
                </div>
              );
            }
            const pct = holeData.pct * 100;
            const colorClass = pct >= 70 ? 'bg-green-100 text-green-800' : 
                              pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800';
            return (
              <div key={hole} className={`text-center p-2 rounded ${colorClass}`}>
                <div className="text-xs font-semibold">H{hole}</div>
                <div className="text-sm font-bold">{pct.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">{holeData.hit}/{holeData.total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Miss Pattern Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Miss Pattern</h3>
        <div className="flex items-end space-x-4 h-48">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-red-200 rounded-t" style={{ height: `${stats.miss_pattern.left}%` }}></div>
            <div className="mt-2 text-sm font-semibold text-gray-700">Left</div>
            <div className="text-xs text-gray-600">{stats.miss_pattern.left.toFixed(1)}%</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-green-200 rounded-t" style={{ height: `${stats.miss_pattern.fairway}%` }}></div>
            <div className="mt-2 text-sm font-semibold text-gray-700">Fairway</div>
            <div className="text-xs text-gray-600">{stats.miss_pattern.fairway.toFixed(1)}%</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-red-200 rounded-t" style={{ height: `${stats.miss_pattern.right}%` }}></div>
            <div className="mt-2 text-sm font-semibold text-gray-700">Right</div>
            <div className="text-xs text-gray-600">{stats.miss_pattern.right.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Strokes Gained by Hole */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Strokes Gained: Off The Tee by Hole</h3>
        <div className="space-y-2">
          {Object.entries(stats.strokes_gained_by_hole)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([hole, sg]) => (
              <div key={hole} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-semibold text-gray-700">Hole {hole}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-full ${sg >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(sg) * 20, 100)}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                    {sg > 0 ? '+' : ''}{sg.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Best/Worst Holes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg shadow-md p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-2">Best Holes</h3>
          <div className="space-y-1">
            {stats.best_holes.map(hole => (
              <div key={hole} className="text-green-800">
                Hole {hole}: +{stats.strokes_gained_by_hole[hole]?.toFixed(2) || '0.00'} SG
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-6 border-2 border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-2">Worst Holes</h3>
          <div className="space-y-1">
            {stats.worst_holes.map(hole => (
              <div key={hole} className="text-red-800">
                Hole {hole}: {stats.strokes_gained_by_hole[hole]?.toFixed(2) || '0.00'} SG
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
