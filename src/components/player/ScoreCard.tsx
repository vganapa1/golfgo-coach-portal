import { Round } from '../../types';
import { formatScore } from '../../utils/statsCalculations';

interface ScoreCardProps {
  round: Round;
  showComparison?: boolean;
  comparisonRound?: Round;
}

export default function ScoreCard({ round, showComparison, comparisonRound }: ScoreCardProps) {
  // CRITICAL: Ensure holes array exists and has 18 holes
  if (!round || !round.holes || round.holes.length !== 18) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">
          Error: Round data incomplete. Expected 18 holes, got {round?.holes?.length || 0}.
        </p>
        <p className="text-red-600 text-sm mt-2">
          Round {round?.round_number || '?'} - {round?.course_name || 'Unknown Course'}
        </p>
      </div>
    );
  }

  const frontNine = round.holes.slice(0, 9);
  const backNine = round.holes.slice(9, 18);
  
  const frontNineScore = frontNine.reduce((sum, h) => sum + (h.score || 0), 0);
  const backNineScore = backNine.reduce((sum, h) => sum + (h.score || 0), 0);

  const getDelta = (holeNum: number) => {
    if (!showComparison || !comparisonRound) return null;
    
    const currentHole = round.holes[holeNum - 1];
    const compHole = comparisonRound.holes[holeNum - 1];
    
    if (!currentHole || !compHole) return null;
    
    const delta = (currentHole.score || 0) - (compHole.score || 0);
    if (delta === 0) return null;
    return delta;
  };

  const renderHole = (hole: typeof round.holes[0], index: number) => {
    // CRITICAL: Check if hole and hole.score exist
    if (!hole || typeof hole.score !== 'number') {
      return (
        <td key={index} className="px-3 py-2 text-center border bg-gray-100">
          <div className="text-red-500 text-xs">?</div>
        </td>
      );
    }

    const delta = getDelta(hole.hole_number);
    const parDiff = hole.score - hole.par;
    
    let bgColor = 'bg-white';
    if (parDiff <= -2) bgColor = 'bg-gray-100';
    else if (parDiff === -1) bgColor = 'bg-gray-50';
    else if (parDiff === 1) bgColor = 'bg-gray-100';
    else if (parDiff >= 2) bgColor = 'bg-gray-200';

    return (
      <td key={index} className={`px-3 py-2 text-center border ${bgColor}`}>
        <div className="font-semibold text-gray-900">{hole.score}</div>
        {delta !== null && (
          <div className={`text-xs ${delta < 0 ? 'text-green-600' : 'text-red-600'}`}>
            {delta > 0 ? `+${delta}` : delta}
          </div>
        )}
      </td>
    );
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  return (
    <div className="bg-white rounded-apple shadow-apple p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-xl font-semibold text-black tracking-tight">
            Round {round.round_number} Scorecard
          </h3>
          {round.date && (
            <p className="text-sm text-gray-600 mt-2 font-light">
              {round.course_name && `${round.course_name} • `}
              {formatDate(round.date)}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-semibold text-black">{round.total_score}</div>
          <div className={`text-sm font-medium mt-1 ${round.total_score < round.total_par ? 'text-gray-600' : 'text-gray-700'}`}>
            {formatScore(round.total_score, round.total_par)}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Hole</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((h) => (
                <th key={h} className="px-3 py-2 text-center font-semibold text-gray-700">
                  {h}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-semibold text-gray-700 bg-gray-200">Out</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2 font-medium text-gray-600">Par</td>
              {frontNine.map((hole, i) => (
                <td key={i} className="px-3 py-2 text-center text-gray-600 border">
                  {hole.par}
                </td>
              ))}
              <td className="px-3 py-2 text-center font-semibold text-gray-700 bg-gray-100 border">
                {frontNine.reduce((sum, h) => sum + h.par, 0)}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-gray-700">Score</td>
              {frontNine.map((hole, i) => renderHole(hole, i))}
              <td className="px-3 py-2 text-center font-bold text-gray-900 bg-gray-100 border">
                {frontNineScore}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full text-sm mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Hole</th>
              {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => (
                <th key={h} className="px-3 py-2 text-center font-semibold text-gray-700">
                  {h}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-semibold text-gray-700 bg-gray-200">In</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700 bg-gray-300">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2 font-medium text-gray-600">Par</td>
              {backNine.map((hole, i) => (
                <td key={i} className="px-3 py-2 text-center text-gray-600 border">
                  {hole.par}
                </td>
              ))}
              <td className="px-3 py-2 text-center font-semibold text-gray-700 bg-gray-100 border">
                {backNine.reduce((sum, h) => sum + h.par, 0)}
              </td>
              <td className="px-3 py-2 text-center font-semibold text-gray-700 bg-gray-200 border">
                {round.total_par}
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium text-gray-700">Score</td>
              {backNine.map((hole, i) => renderHole(hole, i + 9))}
              <td className="px-3 py-2 text-center font-bold text-gray-900 bg-gray-100 border">
                {backNineScore}
              </td>
              <td className="px-3 py-2 text-center font-bold text-gray-900 bg-gray-200 border">
                {round.total_score}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {showComparison && comparisonRound && (
        <div className="mt-3 text-xs text-gray-500 flex items-center">
          <span className="inline-block w-3 h-3 bg-green-200 mr-2"></span>
          <span className="mr-4">Better than Round {comparisonRound.round_number}</span>
          <span className="inline-block w-3 h-3 bg-red-200 mr-2"></span>
          <span>Worse than Round {comparisonRound.round_number}</span>
        </div>
      )}
    </div>
  );
}
