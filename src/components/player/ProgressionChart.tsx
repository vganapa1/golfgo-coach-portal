import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Round } from '../../types';

interface ProgressionChartProps {
  rounds: Round[];
}

export default function ProgressionChart({ rounds }: ProgressionChartProps) {
  const sortedRounds = [...rounds].sort((a, b) => a.round_number - b.round_number);

  const data = sortedRounds.map(round => ({
    round: `Round ${round.round_number}`,
    score: round.total_score,
    fairways: round.summary.fairways_pct * 100,
    gir: round.summary.gir_pct * 100,
    putts: round.summary.total_putts,
    sg_total: round.summary.strokes_gained.total,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Performance Progression
      </h3>

      <div className="space-y-6">
        {/* Score Trend */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Score Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="round" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Stats Trend */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Metrics Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="round" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Fairways %' || name === 'GIR %') {
                    return `${value.toFixed(1)}%`;
                  }
                  return value;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="fairways" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Fairways %"
              />
              <Line 
                type="monotone" 
                dataKey="gir" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="GIR %"
              />
              <Line 
                type="monotone" 
                dataKey="putts" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                name="Total Putts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
