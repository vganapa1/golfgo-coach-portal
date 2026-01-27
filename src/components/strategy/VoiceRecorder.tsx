import { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

export default function VoiceRecorder({ 
  onRecordingComplete, 
  onCancel,
  maxDuration = 120 // 2 minutes default
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.');
      return;
    }

    if (!window.MediaRecorder) {
      setIsSupported(false);
      setError('MediaRecorder API is not supported in your browser.');
      return;
    }

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine MIME type
      const mimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        selectedMimeType = 'audio/webm'; // fallback
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: selectedMimeType });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        setError('An error occurred during recording. Please try again.');
        console.error('MediaRecorder error:', event);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please allow microphone access and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to access microphone. Please check your browser settings and try again.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleConfirm = () => {
    if (audioBlob && audioUrl) {
      onRecordingComplete(audioBlob, audioUrl, recordingTime);
    }
  };

  const handleReRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileSize = (blob: Blob) => {
    const sizeInKB = (blob.size / 1024).toFixed(1);
    return `${sizeInKB} KB`;
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-apple p-4">
        <p className="text-black text-sm font-light">{error}</p>
        <button
          onClick={onCancel}
          className="mt-3 px-4 py-2.5 bg-gray-100 text-black rounded-apple text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Show recording interface
  if (isRecording) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-apple p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-black rounded-full animate-pulse"></div>
            <span className="text-black font-semibold">Recording...</span>
          </div>
          <span className="text-black font-mono text-lg">{formatTime(recordingTime)}</span>
        </div>
        <div className="text-xs text-gray-600 mb-4 font-light">
          Maximum recording time: {formatTime(maxDuration)}
        </div>
        <button
          onClick={stopRecording}
          className="w-full px-4 py-2.5 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm"
        >
          Stop Recording
        </button>
      </div>
    );
  }

  // Show playback interface after recording
  if (audioUrl && audioBlob) {
    return (
      <div className="bg-gray-50 border border-gray-300 rounded-apple p-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-black mb-2">Recording Complete</h4>
          <p className="text-xs text-gray-600 mb-3 font-light">
            Duration: {formatTime(recordingTime)} • Size: {getFileSize(audioBlob)}
          </p>
        </div>

        <div className="bg-white rounded-apple p-3 border border-gray-200">
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="w-full"
          />
        </div>

        {error && (
          <div className="bg-gray-100 border border-gray-300 rounded-apple p-2">
            <p className="text-black text-xs">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            Use This Recording
          </button>
          <button
            onClick={handleReRecord}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-black rounded-apple font-medium hover:bg-gray-200 transition-colors text-sm border border-gray-200"
          >
            Re-record
          </button>
        </div>
      </div>
    );
  }

  // Initial state - show start recording button
  return (
    <div className="border border-dashed border-gray-300 rounded-apple p-4">
      {error && (
        <div className="bg-gray-100 border border-gray-300 rounded-apple p-2 mb-3">
          <p className="text-black text-xs font-light">{error}</p>
        </div>
      )}
      
      <button
        onClick={startRecording}
        className="w-full px-4 py-3 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 text-sm"
      >
        <span className="text-xl">🎤</span>
        <span>Record Voice Note</span>
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center font-light">
        Maximum recording time: {formatTime(maxDuration)}
      </p>
      
      <button
        onClick={onCancel}
        className="w-full mt-2 px-4 py-2.5 bg-gray-100 text-black rounded-apple text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200"
      >
        Cancel
      </button>
    </div>
  );
}
