import { ShortGameStats } from '../../utils/playerTendencies';

interface ShortGameStatsProps {
  stats: ShortGameStats;
}

export default function ShortGameStatsComponent({ stats }: ShortGameStatsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Up & Down %</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {(stats.up_and_down_pct * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Scrambling %</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {(stats.scrambling_pct * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Total Attempts</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {Object.values(stats.outcomes_by_lie).reduce((sum, lie) => sum + lie.attempts, 0)}
          </div>
        </div>
      </div>

      {/* Outcomes by Lie Type */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Success Rate by Lie Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.outcomes_by_lie).map(([lie, data]) => (
            <div key={lie} className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-700 mb-2 capitalize">{lie}</h4>
              <div className="text-2xl font-bold text-gray-900">
                {(data.pct * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {data.successes} / {data.attempts} attempts
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-golf-green-600 h-2 rounded-full"
                  style={{ width: `${data.pct * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strokes Gained by Hole */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Strokes Gained: Around The Green by Hole</h3>
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
          <h3 className="text-lg font-bold text-green-900 mb-2">Best Scrambling Holes</h3>
          <div className="space-y-1">
            {stats.best_holes.map(hole => (
              <div key={hole} className="text-green-800">
                Hole {hole}: +{stats.strokes_gained_by_hole[hole]?.toFixed(2) || '0.00'} SG
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-6 border-2 border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-2">Worst Scrambling Holes</h3>
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
