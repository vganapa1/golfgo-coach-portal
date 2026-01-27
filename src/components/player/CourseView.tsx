import { useState } from 'react';
import { Round } from '../../types';

interface CourseViewProps {
  rounds: Round[];
}

export default function CourseView({ rounds }: CourseViewProps) {
  const [selectedHole, setSelectedHole] = useState(1);

  // Calculate hole statistics
  const holeStats = () => {
    const holeData = rounds.flatMap(round => 
      round.holes.filter(h => h.hole_number === selectedHole)
    );

    if (holeData.length === 0) {
      return null;
    }

    const avgScore = holeData.reduce((sum, h) => sum + h.score, 0) / holeData.length;
    const par = holeData[0].par;
    const fairwayHits = holeData.filter(h => h.fairway_hit).length;
    const fairwayTotal = holeData.filter(h => h.par >= 4).length;
    const girHits = holeData.filter(h => h.gir).length;
    const avgPutts = holeData.reduce((sum, h) => sum + h.putts, 0) / holeData.length;

    return {
      par,
      avgScore,
      fairwayPct: fairwayTotal > 0 ? (fairwayHits / fairwayTotal) * 100 : null,
      girPct: (girHits / holeData.length) * 100,
      avgPutts,
      rounds: holeData.length,
    };
  };

  const stats = holeStats();

  return (
    <div className="space-y-6">
      {/* Hole Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Hole
        </label>
        <select
          value={selectedHole}
          onChange={(e) => setSelectedHole(parseInt(e.target.value))}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-golf-green-500"
        >
          {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => (
            <option key={hole} value={hole}>
              Hole {hole}
            </option>
          ))}
        </select>
      </div>

      {/* Yardage Book Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Yardage Book</h3>
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Yardage book image will display here</p>
          <p className="text-gray-400 text-sm mt-2">Integration coming in next release</p>
        </div>
      </div>

      {/* Google Maps Aerial View Placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Aerial View</h3>
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Google Maps aerial view will display here</p>
          <p className="text-gray-400 text-sm mt-2">Integration coming in next release</p>
        </div>
      </div>

      {/* Hole Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Hole {selectedHole} Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600 uppercase">Par</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.par}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 uppercase">Avg Score</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.avgScore.toFixed(1)}</div>
            </div>
            {stats.fairwayPct !== null && (
              <div>
                <div className="text-sm font-medium text-gray-600 uppercase">Fairway %</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{stats.fairwayPct.toFixed(0)}%</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-gray-600 uppercase">GIR %</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.girPct.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 uppercase">Avg Putts</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.avgPutts.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 uppercase">Rounds</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.rounds}</div>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Integration Note</h4>
        <p className="text-sm text-blue-800">
          Integration with yardage book imagery and Google Maps API coming in next release. 
          This will provide visual course context alongside performance statistics.
        </p>
      </div>
    </div>
  );
}
