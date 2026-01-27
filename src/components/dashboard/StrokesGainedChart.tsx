import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface StrokesGainedData {
  category: string;
  round_1: number;
  round_2: number;
  round_3: number;
}

interface StrokesGainedChartProps {
  data: StrokesGainedData[];
}

export default function StrokesGainedChart({ data }: StrokesGainedChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Strokes Gained Progression
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="category" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Strokes Gained', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => value.toFixed(2)}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={2} />
          <Bar dataKey="round_1" name="Round 1" fill="#ef4444" />
          <Bar dataKey="round_2" name="Round 2" fill="#f59e0b" />
          <Bar dataKey="round_3" name="Round 3" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
