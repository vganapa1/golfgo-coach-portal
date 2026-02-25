import { Player } from '../../types';
import { useClippDData } from '../../hooks/useClippDData';
import ClippDDataView from '../clippd/ClippDDataView';

interface ClippDTabProps {
  player: Player;
}

export default function ClippDTab({ player }: ClippDTabProps) {
  const { clippDData, loading } = useClippDData(player.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (!clippDData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No ClippD Data Available</h3>
        <p className="text-sm text-gray-500">
          No ClippD performance data has been imported for {player.name} yet.
        </p>
      </div>
    );
  }

  return <ClippDDataView data={clippDData} />;
}
