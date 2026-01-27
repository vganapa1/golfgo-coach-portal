import { ClippDCategory } from '../../utils/clippDMapping';
import ClippDMetricCard from './ClippDMetricCard';

interface ClippDCategorySectionProps {
  category: ClippDCategory;
}

export default function ClippDCategorySection({ category }: ClippDCategorySectionProps) {
  const categoryIcons: { [key: string]: string } = {
    'Driving': '🏌️',
    'Iron Play': '🎯',
    'Short Game': '⛳',
    'Putting': '🏌️‍♂️',
  };

  const categoryColors: { [key: string]: string } = {
    'Driving': 'bg-blue-50 border-blue-200',
    'Iron Play': 'bg-purple-50 border-purple-200',
    'Short Game': 'bg-orange-50 border-orange-200',
    'Putting': 'bg-green-50 border-green-200',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${categoryColors[category.name] || 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-2xl">{categoryIcons[category.name] || '📊'}</span>
        <div>
          <h3 className="text-base font-bold text-gray-900">{category.name}</h3>
          <p className="text-xs text-gray-600">{category.subcategories.length} metrics ready</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {category.subcategories.map((subcategory, index) => (
          <ClippDMetricCard key={index} subcategory={subcategory} />
        ))}
      </div>
    </div>
  );
}
