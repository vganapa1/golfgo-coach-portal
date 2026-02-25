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
  onRecord: () => void;
  onEditScore: (holeNumber: number, newScore: number) => void;
  editedScore?: number | null;
}

function HoleClipCard({ holeNumber, par, score, clip, onRecord, onDelete, onEditScore, editedScore }: HoleClipCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [scoreInput, setScoreInput] = useState<string>('');

  // Use edited score if available, otherwise use original score
  const displayScore = editedScore !== null && editedScore !== undefined ? editedScore : score;
  const isScoreMissing = displayScore === 0 || displayScore === undefined || displayScore === null;
  const hasBeenEdited = editedScore !== null && editedScore !== undefined;
  const needsAttention = isScoreMissing || !clip;

  const parDiff = isScoreMissing ? 0 : displayScore - par;
  let scoreColor = 'text-gray-900';
  let scoreBg = 'bg-white';
  if (!isScoreMissing) {
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

  const handleScoreSave = () => {
    const newScore = parseInt(scoreInput);
    if (!isNaN(newScore) && newScore > 0 && newScore <= 15) {
      onEditScore(holeNumber, newScore);
      setIsEditingScore(false);
      setScoreInput('');
    }
  };

  const handleScoreCancel = () => {
    setIsEditingScore(false);
    setScoreInput('');
  };

  const handleScoreClick = () => {
    // Always allow editing scores
    setIsEditingScore(true);
    setScoreInput(displayScore > 0 ? displayScore.toString() : '');
  };

  return (
    <div className={`rounded-apple border p-3 ${scoreBg} ${needsAttention ? 'border-dashed border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500">Hole {holeNumber}</span>
          <span className="text-xs text-gray-400">Par {par}</span>
        </div>
        {isEditingScore ? (
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="1"
              max="15"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScoreSave();
                if (e.key === 'Escape') handleScoreCancel();
              }}
              className="w-12 px-1 py-0.5 text-lg font-bold text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
            <button
              onClick={handleScoreSave}
              className="p-1 text-green-600 hover:text-green-700"
              title="Save"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleScoreCancel}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Cancel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={handleScoreClick}
            className={`text-lg font-bold ${isScoreMissing ? 'text-amber-600' : scoreColor} ${hasBeenEdited ? 'underline decoration-blue-500 decoration-2' : ''} hover:opacity-70 transition-opacity cursor-pointer`}
            title="Click to edit score"
          >
            {isScoreMissing ? '?' : displayScore}
            {hasBeenEdited && <span className="ml-1 text-xs text-blue-500">✓</span>}
          </button>
        )}
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
          {clip ? (
            <>
              <button
                onClick={togglePlay}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-black text-white rounded-apple text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                <span>{isPlaying ? '⏸' : '▶'}</span>
                <span>{formatTime(displayDuration)}</span>
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete recording"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={togglePlay}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-200 text-gray-500 rounded-apple text-xs font-medium hover:bg-gray-300 transition-colors"
                title="Demo playback (no recording)"
              >
                <span>{isPlaying ? '⏸' : '▶'}</span>
                <span>{formatTime(displayDuration)}</span>
              </button>
              <button
                onClick={onRecord}
                className="p-2 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded-lg transition-colors"
                title="Record audio clip"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HoleAudioClips({ round, playerId }: HoleAudioClipsProps) {
  const [recordingHole, setRecordingHole] = useState<number | null>(null);
  const { addHoleClip, removeHoleClip, getDefenseData, setHoleScore, getHoleScore } = useRoundDefenseStore();
  
  const roundId = `${playerId}_round_${round.round_number}`;
  const defenseData = getDefenseData(playerId, roundId);
  const holeClips = defenseData?.hole_clips || [];

  const getClipForHole = (holeNumber: number) => {
    return holeClips.find(c => c.hole_number === holeNumber);
  };

  // Count holes needing attention (missing score or no clip recorded)
  const holesNeedingAttention = round.holes.filter(hole => {
    const editedScore = getHoleScore(playerId, roundId, hole.hole_number);
    const currentScore = editedScore !== null ? editedScore : hole.score;
    const hasClip = holeClips.some(c => c.hole_number === hole.hole_number);
    const scoreMissing = currentScore === 0 || currentScore === undefined || currentScore === null;
    return scoreMissing || !hasClip;
  }).length;

  const recordedClipsCount = holeClips.length;

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

  const handleEditScore = (holeNumber: number, newScore: number) => {
    setHoleScore(playerId, roundId, holeNumber, newScore);
  };

  const getEditedScore = (holeNumber: number) => {
    return getHoleScore(playerId, roundId, holeNumber);
  };

  return (
    <div className="bg-white rounded-apple shadow-apple border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-black">Hole-by-Hole Audio Notes</h3>
          <p className="text-sm text-gray-500 font-light">Click any score to edit • Click mic icon to record missing clips</p>
        </div>
        <div className="flex items-center space-x-2">
          {holesNeedingAttention > 0 && (
            <div className="bg-amber-100 rounded-full px-3 py-1">
              <span className="text-sm font-medium text-amber-700">{holesNeedingAttention} need attention</span>
            </div>
          )}
          <div className={`rounded-full px-3 py-1 ${recordedClipsCount === 18 ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span className={`text-sm font-medium ${recordedClipsCount === 18 ? 'text-green-700' : 'text-gray-600'}`}>
              {recordedClipsCount}/18 recorded
            </span>
          </div>
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
                  onRecord={() => setRecordingHole(hole.hole_number)}
                  onDelete={() => handleDeleteClip(hole.hole_number)}
                  onEditScore={handleEditScore}
                  editedScore={getEditedScore(hole.hole_number)}
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
                  onRecord={() => setRecordingHole(hole.hole_number)}
                  onDelete={() => handleDeleteClip(hole.hole_number)}
                  onEditScore={handleEditScore}
                  editedScore={getEditedScore(hole.hole_number)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
