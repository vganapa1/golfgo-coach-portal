import { useState } from 'react';
import { usePlayerData } from '../hooks/usePlayerData';
import { useRoundData } from '../hooks/useRoundData';
import { mapToClippDFormat, getSyncCompatibility, generateClippDJSON } from '../utils/clippDMapping';
import PlayerSelector from '../components/strategy/PlayerSelector';
import ClippDCategorySection from '../components/clippd/ClippDCategorySection';
import SyncStatusPanel from '../components/clippd/SyncStatusPanel';

export default function ClippDIntegration() {
  const { players, loading: playersLoading } = usePlayerData();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const { rounds, loading: roundsLoading } = useRoundData(selectedPlayerId || undefined);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setSyncSuccess(false);
  };

  const handleSync = () => {
    if (!selectedPlayerId || rounds.length === 0) return;

    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      const player = players.find(p => p.id === selectedPlayerId)!;
      const exportData = mapToClippDFormat(player, rounds);
      const jsonData = generateClippDJSON(exportData);
      
      // Log to console for demo
      console.log('ClippD Export Data:', jsonData);
      
      setIsSyncing(false);
      setSyncSuccess(true);
      
      // Show success message
      alert(
        `✓ Successfully synced to ClippD!\n\n` +
        `Player: ${player.name}\n` +
        `Rounds: ${rounds.length}\n` +
        `Metrics: ${exportData.categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}\n\n` +
        `In production, this data would be sent to ClippD's API.\n` +
        `Check console for JSON export.`
      );
    }, 2000);
  };

  if (playersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  const player = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) : null;
  const exportData = player && rounds.length > 0 ? mapToClippDFormat(player, rounds) : null;
  const syncStatus = rounds.length > 0 ? getSyncCompatibility(rounds) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ClippD Integration
        </h1>
        <p className="mt-2 text-gray-600">
          Sync GolfGo practice data with ClippD performance tracking
        </p>
      </div>

      {/* Player Selection */}
      {!selectedPlayerId && (
        <PlayerSelector
          players={players}
          selectedPlayerId={selectedPlayerId}
          onPlayerSelect={handlePlayerSelect}
        />
      )}

      {/* Loading State */}
      {selectedPlayerId && roundsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golf-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading round data...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {selectedPlayerId && !roundsLoading && rounds.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">No Practice Data Available</h3>
          <p className="text-yellow-800">
            {player?.name} needs to complete practice rounds before data can be synced to ClippD.
          </p>
          <button
            onClick={() => setSelectedPlayerId(null)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Select Different Player
          </button>
        </div>
      )}

      {/* Data Display */}
      {exportData && syncStatus && (
        <>
          {/* Player Header */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-golf-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {player?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{player?.name}</h2>
                <p className="text-sm text-gray-600">
                  ClippD ID: {player?.clippd_id} • {exportData.rounds_included} rounds
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(exportData.date_range.start).toLocaleDateString()} - {new Date(exportData.date_range.end).toLocaleDateString()}
                </p>
              </div>
            </div>
            {!syncSuccess && (
              <button
                onClick={() => setSelectedPlayerId(null)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Change Player
              </button>
            )}
          </div>

          {/* Success Banner */}
          {syncSuccess && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-900">Successfully Synced to ClippD</h3>
                    <p className="text-sm text-green-700">Data is now available in the player's ClippD account</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlayerId(null);
                    setSyncSuccess(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Sync Another Player
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Sections */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-gray-900">ClippD Category Mapping</h3>
              {exportData.categories.map((category, index) => (
                <ClippDCategorySection key={index} category={category} />
              ))}
            </div>

            {/* Sync Panel */}
            {!syncSuccess && (
              <div className="lg:col-span-1">
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
          </div>
        </>
      )}
    </div>
  );
}
