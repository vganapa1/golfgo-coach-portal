import { Round } from '../../types';

interface RoundComparisonProps {
  rounds: Round[];
}

export default function RoundComparison({ rounds }: RoundComparisonProps) {
  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);

  const metrics = [
    { key: 'total_score', label: 'Score', format: (v: number) => v.toString() },
    { key: 'fairways_pct', label: 'Fairways Hit', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'gir_pct', label: 'GIR', format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { key: 'total_putts', label: 'Total Putts', format: (v: number) => v.toString() },
    { key: 'up_and_down_pct', label: 'Up & Down %', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  ];

  const getDelta = (metric: string, currentIdx: number) => {
    if (currentIdx === 0) return null;
    
    const current = sortedRounds[currentIdx];
    const previous = sortedRounds[currentIdx - 1];
    
    let currentVal: number;
    let previousVal: number;

    if (metric === 'total_score') {
      currentVal = current.total_score;
      previousVal = previous.total_score;
    } else {
      currentVal = (current.summary as any)[metric];
      previousVal = (previous.summary as any)[metric];
    }

    const delta = currentVal - previousVal;
    
    // For score, lower is better
    if (metric === 'total_score') {
      if (delta < 0) return { value: delta, good: true };
      if (delta > 0) return { value: delta, good: false };
      return null;
    }
    
    // For other metrics, higher is better
    if (delta > 0) return { value: delta, good: true };
    if (delta < 0) return { value: delta, good: false };
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Round-by-Round Comparison
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Metric</th>
              {sortedRounds.map((round) => (
                <th key={round.round_number} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Round {round.round_number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, idx) => (
              <tr key={metric.key} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {metric.label}
                </td>
                {sortedRounds.map((round, roundIdx) => {
                  const value = metric.key === 'total_score' 
                    ? round.total_score 
                    : (round.summary as any)[metric.key];
                  const delta = getDelta(metric.key, roundIdx);

                  return (
                    <td key={round.round_number} className="px-4 py-3 text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {metric.format(value)}
                      </div>
                      {delta && (
                        <div className={`text-xs font-medium ${delta.good ? 'text-green-600' : 'text-red-600'}`}>
                          {delta.value > 0 ? '+' : ''}{metric.format(delta.value)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Key Insights</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {sortedRounds.length >= 2 && (
            <>
              <li>
                • Score change from R1 to R{sortedRounds.length}: {' '}
                <span className="font-semibold">
                  {sortedRounds[sortedRounds.length - 1].total_score - sortedRounds[0].total_score > 0 ? '+' : ''}
                  {sortedRounds[sortedRounds.length - 1].total_score - sortedRounds[0].total_score} strokes
                </span>
              </li>
              <li>
                • Best round: Round {sortedRounds.reduce((best, r) => r.total_score < best.total_score ? r : best).round_number}
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
