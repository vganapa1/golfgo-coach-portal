import { useState } from 'react';
import { Player } from '../types';
import { usePlayerData } from '../hooks/usePlayerData';
import PlayerRoundDefense from '../components/round-defense/PlayerRoundDefense';

export default function RoundDefense() {
  const { players, loading, error } = usePlayerData();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Get selected player or default to first player
  const selectedPlayer: Player | undefined = selectedPlayerId 
    ? players.find(p => p.id === selectedPlayerId)
    : players[0];

  // Set default selection when players load
  if (!selectedPlayerId && players.length > 0 && !loading) {
    setSelectedPlayerId(players[0].id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 rounded-apple p-6 text-center max-w-md">
          <p className="text-red-700 font-medium">Error loading players</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Player Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">Players</h2>
          <p className="text-xs text-gray-500 font-light mt-1">Select a player to review</p>
        </div>
        
        <div className="py-2">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className={`w-full px-4 py-3 flex items-center space-x-3 transition-colors ${
                selectedPlayer?.id === player.id
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${
                selectedPlayer?.id === player.id
                  ? 'bg-white text-black'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {player.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{player.name}</p>
                <p className={`text-xs ${
                  selectedPlayer?.id === player.id ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  1 round
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          {selectedPlayer ? (
            <PlayerRoundDefense player={selectedPlayer} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👤</span>
                </div>
                <p className="text-gray-700 font-medium">Select a player</p>
                <p className="text-gray-500 text-sm mt-1">Choose a player from the sidebar to view their round defense</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
