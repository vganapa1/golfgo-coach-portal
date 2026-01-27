import { Link } from 'react-router-dom';
import { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  avgScore?: number;
  scoreTrend?: 'improving' | 'declining' | 'stable';
  roundsCompleted?: number;
}

export default function PlayerCard({ 
  player, 
  avgScore, 
  scoreTrend,
  roundsCompleted = 3 
}: PlayerCardProps) {
  const trendIcons = {
    improving: '↗️',
    declining: '↘️',
    stable: '→'
  };

  const trendColors = {
    improving: 'bg-green-100 text-green-800',
    declining: 'bg-red-100 text-red-800',
    stable: 'bg-gray-100 text-gray-800'
  };

  const trendText = {
    improving: 'Improving',
    declining: 'Needs Work',
    stable: 'Consistent'
  };

  return (
    <Link 
      to={`/player/${player.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border-2 border-transparent hover:border-golf-green-500"
    >
      <div className="p-6">
        {/* Player Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-golf-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
            <p className="text-sm text-gray-500">Handicap: {player.handicap}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Rounds Completed</span>
            <span className="font-semibold text-gray-900">{roundsCompleted}/3</span>
          </div>
          
          {avgScore && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Score</span>
              <span className="font-semibold text-gray-900">{avgScore.toFixed(1)}</span>
            </div>
          )}

          {scoreTrend && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${trendColors[scoreTrend]}`}>
                <span className="mr-1">{trendIcons[scoreTrend]}</span>
                {trendText[scoreTrend]}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
