import { Player } from '../../types';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerId: string | null;
  onPlayerSelect: (playerId: string) => void;
}

export default function PlayerSelector({ 
  players, 
  selectedPlayerId, 
  onPlayerSelect 
}: PlayerSelectorProps) {
  return (
    <div className="bg-black rounded-apple shadow-apple-lg p-8 border border-gray-900">
      <h3 className="text-2xl font-semibold text-white mb-6 tracking-tight">Select Player</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => onPlayerSelect(player.id)}
            className={`p-5 rounded-apple border transition-all ${
              selectedPlayerId === player.id
                ? 'border-white bg-gray-900 shadow-apple'
                : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800'
            }`}
          >
            <div className="text-center">
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-semibold mb-3 ${
                selectedPlayerId === player.id ? 'bg-white text-black' : 'bg-gray-700 text-white'
              }`}>
                {player.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`font-medium text-sm ${
                selectedPlayerId === player.id ? 'text-white' : 'text-gray-400'
              }`}>{player.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
