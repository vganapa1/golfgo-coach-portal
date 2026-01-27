import { Round, Player } from '../../types';
import { mapToClippDFormat, getSyncCompatibility } from '../../utils/clippDMapping';
import ClippDCategorySection from '../clippd/ClippDCategorySection';
import SyncStatusPanel from '../clippd/SyncStatusPanel';
import { useState } from 'react';

interface ClippDTabProps {
  player: Player;
  rounds: Round[];
}

export default function ClippDTab({ player, rounds }: ClippDTabProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const exportData = rounds.length > 0 ? mapToClippDFormat(player, rounds) : null;
  const syncStatus = rounds.length > 0 ? getSyncCompatibility(rounds) : null;

  const handleSync = () => {
    if (rounds.length === 0) return;

    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      const jsonData = JSON.stringify(exportData, null, 2);
      console.log('ClippD Export Data:', jsonData);
      
      setIsSyncing(false);
      setSyncSuccess(true);
      
      alert(
        `✓ Successfully synced to ClippD!\n\n` +
        `Player: ${player.name}\n` +
        `Rounds: ${rounds.length}\n` +
        `Metrics: ${exportData?.categories.reduce((sum, cat) => sum + cat.subcategories.length, 0) || 0}\n\n` +
        `In production, this data would be sent to ClippD's API.\n` +
        `Check console for JSON export.`
      );
    }, 2000);
  };

  if (!exportData || !syncStatus) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">No Data Available</h3>
        <p className="text-yellow-800">
          No practice rounds found for {player.name}. Complete practice rounds to sync data to ClippD.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player Header - Compact */}
      <div className="flex items-center space-x-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="w-12 h-12 bg-golf-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {player.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-gray-900 truncate">{player.name}</h2>
          <p className="text-xs text-gray-600">
            ClippD ID: {player.clippd_id} • {exportData.rounds_included} rounds
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {syncSuccess && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="text-sm font-bold text-green-900">Successfully Synced</h3>
              <p className="text-xs text-green-700">Data available in ClippD account</p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Panel - Compact */}
      {!syncSuccess && (
        <div className="mb-4">
          <SyncStatusPanel
            compatible={syncStatus.compatible}
            issues={syncStatus.issues}
            readyMetrics={syncStatus.readyMetrics}
            totalMetrics={syncStatus.totalMetrics}
            onSync={handleSync}
            isSyncing={isSyncing}
          />
        </div>
      )}

      {/* Category Sections */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">ClippD Category Mapping</h3>
        {exportData.categories.map((category, index) => (
          <ClippDCategorySection key={index} category={category} />
        ))}
      </div>
    </div>
  );
}
