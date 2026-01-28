import { Player, Round } from '../../types';
import { useRoundData } from '../../hooks/useRoundData';
import ScoreCard from '../player/ScoreCard';
import RoundStats from './RoundStats';
import HoleAudioClips from './HoleAudioClips';
import PressConference from './PressConference';

interface PlayerRoundDefenseProps {
  player: Player;
}

export default function PlayerRoundDefense({ player }: PlayerRoundDefenseProps) {
  const { rounds, loading, error } = useRoundData(player.id);

  // Get the most recent round only
  const sortedRounds = [...rounds].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return b.round_number - a.round_number;
  });

  const selectedRound: Round | undefined = sortedRounds[0];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-light">Loading round data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-apple p-6 text-center">
        <p className="text-red-700 font-medium">Error loading data</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (sortedRounds.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-apple p-6 text-center">
        <p className="text-gray-700 font-medium">No rounds available</p>
        <p className="text-gray-500 text-sm mt-1">This player has no recorded rounds yet.</p>
      </div>
    );
  }

  if (!selectedRound) {
    return null;
  }

  const roundId = `${player.id}_round_${selectedRound.round_number}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-black">{player.name}</h2>
        <p className="text-gray-600 font-light">
          The Floridian Open • {formatDate(selectedRound.date)}
        </p>
      </div>

      {/* Score Summary Banner */}
      <div className="bg-black text-white rounded-apple p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-light">Total Score</p>
          <p className="text-3xl font-bold">{selectedRound.total_score}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 font-light">To Par</p>
          <p className={`text-2xl font-bold ${
            selectedRound.total_score - selectedRound.total_par < 0 
              ? 'text-green-400' 
              : selectedRound.total_score - selectedRound.total_par > 0 
                ? 'text-red-400' 
                : 'text-white'
          }`}>
            {selectedRound.total_score - selectedRound.total_par === 0 
              ? 'E' 
              : selectedRound.total_score - selectedRound.total_par > 0 
                ? `+${selectedRound.total_score - selectedRound.total_par}`
                : selectedRound.total_score - selectedRound.total_par}
          </p>
        </div>
      </div>

      {/* Scorecard */}
      <ScoreCard round={selectedRound} displayRoundNumber={1} />

      {/* Round Statistics */}
      <RoundStats round={selectedRound} player={player} allRounds={sortedRounds} />

      {/* Hole Audio Clips */}
      <HoleAudioClips round={selectedRound} playerId={player.id} />

      {/* Press Conference */}
      <PressConference 
        playerId={player.id} 
        roundId={roundId} 
        playerName={player.name}
      />
    </div>
  );
}
