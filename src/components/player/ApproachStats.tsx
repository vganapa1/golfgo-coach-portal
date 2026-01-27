import { ApproachStats } from '../../utils/playerTendencies';

interface ApproachStatsProps {
  stats: ApproachStats;
}

export default function ApproachStatsComponent({ stats }: ApproachStatsProps) {
  const holeNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">GIR %</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {(stats.gir_pct * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Avg Proximity</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats.avg_proximity.toFixed(1)} ft
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Miss Pattern</div>
          <div className="text-lg font-bold text-gray-900 mt-2">
            S: {(stats.miss_pattern.short).toFixed(0)}% | L: {(stats.miss_pattern.long).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* GIR by Hole Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">GIR by Hole</h3>
        <div className="grid grid-cols-9 gap-2">
          {holeNumbers.map(hole => {
            const holeData = stats.gir_by_hole[hole];
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

      {/* Miss Pattern */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Miss Pattern</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Distance</h4>
            <div className="flex items-end space-x-4 h-32">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-red-200 rounded-t" style={{ height: `${stats.miss_pattern.short}%` }}></div>
                <div className="mt-2 text-sm font-semibold text-gray-700">Short</div>
                <div className="text-xs text-gray-600">{stats.miss_pattern.short.toFixed(1)}%</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-red-200 rounded-t" style={{ height: `${stats.miss_pattern.long}%` }}></div>
                <div className="mt-2 text-sm font-semibold text-gray-700">Long</div>
                <div className="text-xs text-gray-600">{stats.miss_pattern.long.toFixed(1)}%</div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Direction</h4>
            <div className="flex items-end space-x-4 h-32">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-red-200 rounded-t" style={{ height: `${stats.miss_pattern.left}%` }}></div>
                <div className="mt-2 text-sm font-semibold text-gray-700">Left</div>
                <div className="text-xs text-gray-600">{stats.miss_pattern.left.toFixed(1)}%</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-red-200 rounded-t" style={{ height: `${stats.miss_pattern.right}%` }}></div>
                <div className="mt-2 text-sm font-semibold text-gray-700">Right</div>
                <div className="text-xs text-gray-600">{stats.miss_pattern.right.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strokes Gained by Hole */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Strokes Gained: Approach by Hole</h3>
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
