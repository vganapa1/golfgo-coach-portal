import { ClippDHeatmapValues } from '../../types';

interface Props {
  label: string;
  values: ClippDHeatmapValues;
}

const POSITIONS: (keyof ClippDHeatmapValues)[] = [
  'top_left', 'top_center', 'top_right',
  'middle_left', 'middle_center', 'middle_right',
  'bottom_left', 'bottom_center', 'bottom_right',
];

function cellColor(val: number): string {
  if (val >= 120) return 'bg-emerald-600 text-white';
  if (val >= 110) return 'bg-emerald-500 text-white';
  if (val >= 100) return 'bg-emerald-300 text-emerald-900';
  if (val >= 90) return 'bg-emerald-100 text-emerald-800';
  if (val >= 80) return 'bg-amber-100 text-amber-800';
  if (val >= 70) return 'bg-amber-200 text-amber-900';
  return 'bg-red-200 text-red-900';
}

export default function PinLocationHeatmap({ label, values }: Props) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-xs font-semibold text-gray-600 text-center mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-1">
        {POSITIONS.map((pos) => {
          const val = values[pos];
          return (
            <div
              key={pos}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold ${cellColor(val)}`}
            >
              {val}
            </div>
          );
        })}
      </div>
    </div>
  );
}
