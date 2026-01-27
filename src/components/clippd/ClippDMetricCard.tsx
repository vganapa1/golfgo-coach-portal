import { ClippDSubcategory } from '../../utils/clippDMapping';

interface ClippDMetricCardProps {
  subcategory: ClippDSubcategory;
}

export default function ClippDMetricCard({ subcategory }: ClippDMetricCardProps) {
  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'strokes') return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
    if (unit === 'yards' || unit === 'feet') return `${value.toFixed(1)} ${unit}`;
    return `${value.toFixed(1)} ${unit}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">{subcategory.name}</h4>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓ Ready
        </span>
      </div>
      <div className="text-2xl font-bold text-golf-green-600 mb-1">
        {formatValue(subcategory.value, subcategory.unit)}
      </div>
      <div className="text-xs text-gray-500">
        Source: {subcategory.source}
      </div>
    </div>
  );
}
