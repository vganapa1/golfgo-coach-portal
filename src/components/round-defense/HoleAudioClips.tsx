import { useState, useRef } from 'react';
import { Round, HoleAudioClip } from '../../types';
import { useRoundDefenseStore } from '../../stores/roundDefenseStore';
import VoiceRecorder from '../strategy/VoiceRecorder';

interface HoleAudioClipsProps {
  round: Round;
  playerId: string;
}

interface HoleClipCardProps {
  holeNumber: number;
  par: number;
  score: number;
  clip?: HoleAudioClip;
  onDelete: () => void;
}

function HoleClipCard({ holeNumber, par, score, clip, onDelete }: HoleClipCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const parDiff = score - par;
  let scoreColor = 'text-gray-900';
  let scoreBg = 'bg-white';
  if (parDiff <= -2) {
    scoreColor = 'text-green-700';
    scoreBg = 'bg-green-50';
  } else if (parDiff === -1) {
    scoreColor = 'text-green-600';
    scoreBg = 'bg-green-50';
  } else if (parDiff === 1) {
    scoreColor = 'text-amber-600';
    scoreBg = 'bg-amber-50';
  } else if (parDiff >= 2) {
    scoreColor = 'text-red-600';
    scoreBg = 'bg-red-50';
  }

  // Demo durations for each hole (simulated)
  const demoDuration = 15 + (holeNumber * 2) % 30; // 15-45 seconds per hole

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    // If we have a real clip, play it
    if (clip && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Demo mode - just toggle the visual state briefly
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 1500);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Always show the play button (demo mode)
  const displayDuration = clip ? clip.duration : demoDuration;

  return (
    <div className={`rounded-apple border border-gray-200 p-3 ${scoreBg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500">Hole {holeNumber}</span>
          <span className="text-xs text-gray-400">Par {par}</span>
        </div>
        <span className={`text-lg font-bold ${scoreColor}`}>{score}</span>
      </div>
      
      <div className="space-y-2">
        {clip && (
          <audio 
            ref={audioRef} 
            src={clip.audio_url} 
            onEnded={handleAudioEnded}
            className="hidden"
          />
        )}
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-black text-white rounded-apple text-xs font-medium hover:bg-gray-800 transition-colors"
          >
            <span>{isPlaying ? '⏸' : '▶'}</span>
            <span>{formatTime(displayDuration)}</span>
          </button>
          {clip && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete recording"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HoleAudioClips({ round, playerId }: HoleAudioClipsProps) {
  const [recordingHole, setRecordingHole] = useState<number | null>(null);
  const { addHoleClip, removeHoleClip, getDefenseData } = useRoundDefenseStore();
  
  const roundId = `${playerId}_round_${round.round_number}`;
  const defenseData = getDefenseData(playerId, roundId);
  const holeClips = defenseData?.hole_clips || [];

  const getClipForHole = (holeNumber: number) => {
    return holeClips.find(c => c.hole_number === holeNumber);
  };

  const handleRecordingComplete = (_blob: Blob, url: string, duration: number) => {
    if (recordingHole === null) return;
    
    const clip: HoleAudioClip = {
      hole_number: recordingHole,
      audio_url: url,
      duration,
      recorded_at: new Date().toISOString(),
    };
    
    addHoleClip(playerId, roundId, clip);
    setRecordingHole(null);
  };

  const handleDeleteClip = (holeNumber: number) => {
    removeHoleClip(playerId, roundId, holeNumber);
  };

  return (
    <div className="bg-white rounded-apple shadow-apple border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-black">Hole-by-Hole Audio Notes</h3>
          <p className="text-sm text-gray-500 font-light">Listen to observations from each hole</p>
        </div>
        <div className="bg-green-100 rounded-full px-3 py-1">
          <span className="text-sm font-medium text-green-700">18/18 recorded</span>
        </div>
      </div>

      {recordingHole !== null ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-black">
              Recording for Hole {recordingHole}
            </h4>
          </div>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => setRecordingHole(null)}
            maxDuration={60}
          />
        </div>
      ) : (
        <>
          {/* Front Nine */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Front Nine</h4>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
              {round.holes.slice(0, 9).map((hole, index) => (
                <HoleClipCard
                  key={index}
                  holeNumber={hole.hole_number}
                  par={hole.par}
                  score={hole.score}
                  clip={getClipForHole(hole.hole_number)}
                  onDelete={() => handleDeleteClip(hole.hole_number)}
                />
              ))}
            </div>
          </div>

          {/* Back Nine */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Back Nine</h4>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
              {round.holes.slice(9, 18).map((hole, index) => (
                <HoleClipCard
                  key={index + 9}
                  holeNumber={hole.hole_number}
                  par={hole.par}
                  score={hole.score}
                  clip={getClipForHole(hole.hole_number)}
                  onDelete={() => handleDeleteClip(hole.hole_number)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
