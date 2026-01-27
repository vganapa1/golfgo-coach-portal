import { useState } from 'react';
import { HoleStrategy, CourseStrategy } from '../../types';
import VoiceRecorder from './VoiceRecorder';

interface StrategyCardProps {
  strategy: HoleStrategy;
  courseStrategy: CourseStrategy;
  onUpdate?: (updatedStrategy: HoleStrategy) => void;
  onApprove?: (holeNumber: number) => void;
  onReject?: (holeNumber: number) => void;
}

export default function StrategyCard({ 
  strategy, 
  courseStrategy,
  onUpdate,
  onApprove,
  onReject
}: StrategyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [coachNotes, setCoachNotes] = useState(strategy.coach_notes || '');
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(strategy.voice_note_url || null);
  const [voiceNoteDuration, setVoiceNoteUrlDuration] = useState<number | undefined>(strategy.voice_note_duration);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  
  const requiresApproval = strategy.confidence_level === 'medium' || strategy.confidence_level === 'low';
  const isApproved = courseStrategy.hole_approvals?.[strategy.hole_number]?.approved || false;
  const isEdited = strategy.edited_by_coach || false;
  const approvalInfo = courseStrategy.hole_approvals?.[strategy.hole_number];
  
  const confidenceColors = {
    high: 'bg-gray-100 text-black border-gray-300',
    medium: 'bg-gray-100 text-black border-gray-400',
    low: 'bg-gray-100 text-black border-gray-500',
  };

  const confidenceIcons = {
    high: '✓',
    medium: '○',
    low: '!',
  };

  // Determine border color based on approval status
  const getBorderColor = () => {
    if (isApproved) return 'border-black';
    if (requiresApproval) return 'border-gray-400';
    if (isEdited) return 'border-gray-600';
    return 'border-gray-200';
  };

  const handleSave = () => {
    const updatedStrategy: HoleStrategy = {
      ...strategy,
      coach_notes: coachNotes,
      voice_note_url: voiceNoteUrl || undefined,
      voice_note_duration: voiceNoteDuration,
      has_voice_note: !!voiceNoteUrl,
      edited_by_coach: true,
      edited_at: new Date().toISOString(),
    };
    
    if (onUpdate) {
      onUpdate(updatedStrategy);
    }
    
    setIsEditing(false);
    setShowVoiceRecorder(false);
  };

  const handleCancel = () => {
    setCoachNotes(strategy.coach_notes || '');
    setVoiceNoteUrl(strategy.voice_note_url || null);
    setVoiceNoteUrlDuration(strategy.voice_note_duration);
    setIsEditing(false);
    setShowVoiceRecorder(false);
  };

  const handleVoiceRecordingComplete = (_blob: Blob, url: string, duration: number) => {
    setVoiceNoteUrl(url);
    setVoiceNoteUrlDuration(duration);
    setShowVoiceRecorder(false);
  };

  return (
    <div 
      id={`hole-${strategy.hole_number}`}
      className={`bg-white rounded-apple shadow-apple border ${getBorderColor()} overflow-hidden hover:shadow-apple-lg transition-all`}
    >
      {/* Header */}
      <div 
        className={`p-5 cursor-pointer flex items-center justify-between transition-colors ${
          isApproved 
            ? 'bg-black hover:bg-gray-900' 
            : requiresApproval 
              ? 'bg-gray-900 hover:bg-gray-800'
              : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
            isApproved || requiresApproval
              ? 'bg-white text-black'
              : 'bg-black text-white'
          }`}>
            {strategy.hole_number}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${
                isApproved || requiresApproval ? 'text-white' : 'text-black'
              }`}>Hole {strategy.hole_number}</h3>
              {isEdited && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  isApproved || requiresApproval
                    ? 'bg-gray-800 text-white border-gray-700'
                    : 'bg-gray-100 text-black border-gray-200'
                }`}>
                  ✏️ Edited
                </span>
              )}
              {isApproved && (
                <span className="px-2 py-0.5 bg-white text-black rounded-full text-xs font-medium">
                  ✓ Approved
                </span>
              )}
              {requiresApproval && !isApproved && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  isApproved || requiresApproval
                    ? 'bg-gray-800 text-white border-gray-700'
                    : 'bg-gray-100 text-black border-gray-300'
                }`}>
                  ⚠️ Requires Approval
                </span>
              )}
              {strategy.confidence_level === 'high' && !isApproved && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  isApproved || requiresApproval
                    ? 'bg-gray-800 text-gray-300 border-gray-700'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                  ✓ Auto-Approved
                </span>
              )}
            </div>
            <p className={`text-sm font-light mt-0.5 ${
              isApproved || requiresApproval ? 'text-gray-300' : 'text-gray-600'
            }`}>{strategy.tee_shot.recommended_club} off tee</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${confidenceColors[strategy.confidence_level]}`}>
            {confidenceIcons[strategy.confidence_level]} {strategy.confidence_level.toUpperCase()}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Approval Status (if approved) */}
          {isApproved && approvalInfo?.approved_at && (
            <div className="bg-gray-50 border border-gray-200 rounded-apple p-3">
              <p className="text-sm text-black font-light">
                ✓ Approved on {new Date(approvalInfo.approved_at).toLocaleString()}
              </p>
            </div>
          )}

          {/* Edit Mode */}
          {isEditing ? (
            <div className="space-y-4 border border-gray-300 rounded-apple p-5 bg-gray-50">
              <h4 className="font-semibold text-black">Edit Strategy</h4>
              
              {/* Text Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Coach Notes
                </label>
                <textarea
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder="Add custom notes or modify this strategy..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {coachNotes.length}/500 characters
                </div>
              </div>

              {/* Voice Recording */}
              {!showVoiceRecorder && !voiceNoteUrl && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Voice Note (Optional)
                  </label>
                  <button
                    onClick={() => setShowVoiceRecorder(true)}
                    className="w-full px-4 py-3 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 text-sm"
                  >
                    <span className="text-xl">🎤</span>
                    <span>Record Voice Note</span>
                  </button>
                </div>
              )}

              {showVoiceRecorder && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Voice Note
                  </label>
                  <VoiceRecorder
                    onRecordingComplete={handleVoiceRecordingComplete}
                    onCancel={() => setShowVoiceRecorder(false)}
                  />
                </div>
              )}

              {voiceNoteUrl && !showVoiceRecorder && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Voice Note
                  </label>
                  <div className="bg-white rounded-lg p-3 border border-gray-300">
                    <audio src={voiceNoteUrl} controls className="w-full mb-2" />
                    <button
                      onClick={() => {
                        setVoiceNoteUrl(null);
                        setVoiceNoteUrlDuration(undefined);
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove recording
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Actions */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-golf-green-600 text-white rounded-lg font-medium hover:bg-golf-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Display Coach Notes if exists */}
              {strategy.coach_notes && (
                <div className="bg-gray-50 border border-gray-200 rounded-apple p-4">
                  <h4 className="text-sm font-semibold text-black mb-2 flex items-center">
                    <span className="mr-2">✏️</span>
                    Coach Notes
                  </h4>
                  <p className="text-sm text-gray-700 font-light whitespace-pre-wrap">{strategy.coach_notes}</p>
                </div>
              )}

              {/* Display Voice Note if exists */}
              {strategy.has_voice_note && strategy.voice_note_url && (
                <div className="bg-gray-50 border border-gray-200 rounded-apple p-4">
                  <h4 className="text-sm font-semibold text-black mb-2 flex items-center">
                    <span className="mr-2">🎤</span>
                    Voice Note
                    {strategy.voice_note_duration && (
                      <span className="ml-2 text-xs text-gray-600 font-light">
                        ({Math.floor(strategy.voice_note_duration / 60)}:{(strategy.voice_note_duration % 60).toString().padStart(2, '0')})
                      </span>
                    )}
                  </h4>
                  <audio src={strategy.voice_note_url} controls className="w-full" />
                </div>
              )}

              {/* Tee Shot */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  Tee Shot Strategy
                </h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Club</span>
                      <div className="text-sm font-bold text-gray-900">{strategy.tee_shot.recommended_club}</div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Target</span>
                      <div className="text-sm font-bold text-gray-900">{strategy.tee_shot.target_line}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{strategy.tee_shot.rationale}</p>
                </div>
              </div>

              {/* Approach */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Approach Strategy
                </h4>
                <div className="bg-gray-50 rounded-apple p-4 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Target</span>
                      <div className="text-sm font-bold text-gray-900">{strategy.approach.target_area}</div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-600">Style</span>
                      <div className="text-sm font-bold text-gray-900 capitalize">{strategy.approach.strategy}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{strategy.approach.rationale}</p>
                </div>
              </div>

              {/* Short Game (if applicable) */}
              {strategy.short_game && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                    Short Game Focus
                  </h4>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">{strategy.short_game.focus_area}</p>
                    <p className="text-sm text-gray-700">{strategy.short_game.rationale}</p>
                  </div>
                </div>
              )}

              {/* Putting */}
              {strategy.putting && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Putting Strategy
                  </h4>
                  <div className="bg-gray-50 rounded-apple p-4 border border-gray-100">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-600">Emphasis: </span>
                      <span className="text-sm font-bold text-gray-900 capitalize">{strategy.putting.emphasis}</span>
                    </div>
                    <p className="text-sm text-gray-700">{strategy.putting.rationale}</p>
                  </div>
                </div>
              )}

              {/* Data Source */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Based on rounds: {strategy.based_on_rounds.join(', ')} • 
                  Confidence: {strategy.confidence_level}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                {!isApproved && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full px-5 py-2.5 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm"
                  >
                    Edit Strategy
                  </button>
                )}

                {/* Approval Buttons */}
                {requiresApproval && !isApproved && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onApprove && onApprove(strategy.hole_number)}
                      className="flex-1 px-5 py-2.5 bg-black text-white rounded-apple font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      ✓ Approve This Hole
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        if (onReject) onReject(strategy.hole_number);
                      }}
                      className="flex-1 px-5 py-2.5 bg-white text-black rounded-apple font-medium hover:bg-gray-50 transition-colors text-sm border border-gray-300"
                    >
                      ✗ Reject & Edit
                    </button>
                  </div>
                )}

                {/* High confidence - can still approve manually */}
                {strategy.confidence_level === 'high' && !isApproved && onApprove && (
                  <button
                    onClick={() => onApprove(strategy.hole_number)}
                    className="w-full px-5 py-2.5 bg-gray-100 text-black rounded-apple font-medium hover:bg-gray-200 transition-colors text-sm border border-gray-200"
                  >
                    ✓ Approve (Optional)
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
