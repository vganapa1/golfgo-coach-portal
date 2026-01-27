import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AggregateStats } from '../../types';

interface StrokesGainedBreakdownProps {
  aggregateStats: AggregateStats;
}

export default function StrokesGainedBreakdown({ aggregateStats }: StrokesGainedBreakdownProps) {
  const data = [
    { category: 'Off Tee', value: aggregateStats.avg_strokes_gained.ott, fullName: 'Off the Tee' },
    { category: 'Approach', value: aggregateStats.avg_strokes_gained.app, fullName: 'Approach' },
    { category: 'Around Green', value: aggregateStats.avg_strokes_gained.arg, fullName: 'Around the Green' },
    { category: 'Putting', value: aggregateStats.avg_strokes_gained.putt, fullName: 'Putting' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Average Strokes Gained Breakdown
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="category"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number) => value.toFixed(2)}
            labelFormatter={(label) => {
              const item = data.find(d => d.category === label);
              return item?.fullName || label;
            }}
          />
          <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} />
          <Bar 
            dataKey="value" 
            fill="#22c55e"
            name="Strokes Gained"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.category} className="text-center">
            <div className="text-2xl font-bold" style={{ color: item.value >= 0 ? '#22c55e' : '#ef4444' }}>
              {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">{item.fullName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
