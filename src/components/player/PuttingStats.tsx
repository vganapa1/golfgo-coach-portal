import { PuttingStats } from '../../utils/playerTendencies';

interface PuttingStatsProps {
  stats: PuttingStats;
}

export default function PuttingStatsComponent({ stats }: PuttingStatsProps) {
  const holeNumbers = Array.from({ length: 18 }, (_, i) => i + 1);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Putts/Round</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats.putts_per_round.toFixed(1)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Putts/GIR</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats.putts_per_gir.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">3-Putt Avoidance</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {(stats.three_putt_avoidance_pct * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm font-medium text-gray-600 uppercase">Total Holes</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {Object.keys(stats.putting_heatmap).length}
          </div>
        </div>
      </div>

      {/* Make % by Distance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Make Percentage by Distance</h3>
        <div className="space-y-4">
          {Object.entries(stats.make_pct_by_distance).map(([distance, data]) => (
            <div key={distance}>
              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                <span>{distance}</span>
                <span>{(data.pct * 100).toFixed(1)}% ({data.made}/{data.attempts})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-golf-green-600 h-4 rounded-full"
                  style={{ width: `${data.pct * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Putting Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Putting Heatmap (Avg Putts per Hole)</h3>
        <div className="grid grid-cols-9 gap-2">
          {holeNumbers.map(hole => {
            const avgPutts = stats.putting_heatmap[hole];
            if (avgPutts === undefined) {
              return (
                <div key={hole} className="text-center p-2 bg-gray-100 rounded">
                  <div className="text-xs font-semibold text-gray-500">H{hole}</div>
                  <div className="text-xs text-gray-400">N/A</div>
                </div>
              );
            }
            const colorClass = avgPutts <= 1.5 ? 'bg-green-100 text-green-800' : 
                              avgPutts <= 2.0 ? 'bg-yellow-100 text-yellow-800' : 
                              avgPutts <= 2.5 ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800';
            return (
              <div key={hole} className={`text-center p-2 rounded ${colorClass}`}>
                <div className="text-xs font-semibold">H{hole}</div>
                <div className="text-sm font-bold">{avgPutts.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strokes Gained by Hole */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Strokes Gained: Putting by Hole</h3>
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
    </div>
  );
}
