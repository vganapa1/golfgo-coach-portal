import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  round: string;
  [key: string]: string | number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  dataKeys: { key: string; name: string; color: string; }[];
  title: string;
  yAxisLabel?: string;
}

export default function PerformanceChart({ 
  data, 
  dataKeys, 
  title,
  yAxisLabel 
}: PerformanceChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="round" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          {dataKeys.map((dk) => (
            <Line 
              key={dk.key}
              type="monotone" 
              dataKey={dk.key} 
              name={dk.name}
              stroke={dk.color} 
              strokeWidth={2}
              dot={{ fill: dk.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
