import { useState, useRef } from 'react';
import { PressConference as PressConferenceType } from '../../types';
import { useRoundDefenseStore } from '../../stores/roundDefenseStore';
import VoiceRecorder from '../strategy/VoiceRecorder';

interface PressConferenceProps {
  playerId: string;
  roundId: string;
  playerName: string;
}

export default function PressConference({ playerId, roundId, playerName }: PressConferenceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { setPressConference, removePressConference, getDefenseData } = useRoundDefenseStore();
  const defenseData = getDefenseData(playerId, roundId);
  const realConference = defenseData?.press_conference;

  // Demo conference data (shown when no real recording exists)
  const demoConference: PressConferenceType = {
    audio_url: '',
    duration: 185, // 3:05
    recorded_at: new Date().toISOString(),
    title: `${playerName}'s Post-Round Reflection`,
  };

  // Use real conference if exists, otherwise use demo
  const conference = realConference || demoConference;
  const isDemo = !realConference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleRecordingComplete = (_blob: Blob, url: string, duration: number) => {
    const newConference: PressConferenceType = {
      audio_url: url,
      duration,
      recorded_at: new Date().toISOString(),
      title: `${playerName}'s Post-Round Reflection`,
    };
    
    setPressConference(playerId, roundId, newConference);
    setIsRecording(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this press conference recording?')) {
      removePressConference(playerId, roundId);
    }
  };

  const togglePlay = () => {
    // If we have a real recording, play it
    if (!isDemo && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Demo mode - just toggle visual state briefly
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white rounded-apple shadow-apple border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-black">Press Conference Review</h3>
          <p className="text-sm text-gray-500 font-light">
            Post-round reflection - what went well and what to improve
          </p>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
          Recorded
        </span>
      </div>

      {isRecording ? (
        <div className="bg-gray-50 rounded-apple p-4">
          <div className="mb-3">
            <p className="text-sm text-gray-700 font-medium mb-1">Recording Post-Round Reflection</p>
            <p className="text-xs text-gray-500 font-light">
              Talk about what went well, areas for improvement, and key takeaways from the round.
            </p>
          </div>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onCancel={() => setIsRecording(false)}
            maxDuration={300} // 5 minutes for press conference
          />
        </div>
      ) : (
        <div className="space-y-4">
          {!isDemo && (
            <audio
              ref={audioRef}
              src={conference.audio_url}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          )}
          
          <div className="bg-gray-50 rounded-apple p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-black">{conference.title || 'Post-Round Reflection'}</p>
                <p className="text-xs text-gray-500 font-light">
                  Recorded {formatDate(conference.recorded_at)} • {formatTime(conference.duration)}
                </p>
              </div>
            </div>
            
            {/* Audio Player */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-100"
                    style={{ width: isPlaying ? '50%' : '0%' }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">{isPlaying ? 'Playing...' : 'Ready'}</span>
                  <span className="text-xs text-gray-500">{formatTime(conference.duration)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setIsRecording(true)}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-black rounded-apple font-medium hover:bg-gray-200 transition-colors text-sm border border-gray-200"
            >
              Re-record
            </button>
            {!isDemo && (
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-apple font-medium transition-colors text-sm border border-red-200"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
