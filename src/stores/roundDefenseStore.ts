import { create } from 'zustand';
import { HoleAudioClip, PressConference, RoundDefenseData } from '../types';

interface RoundDefenseState {
  // Map of player_id -> round_id -> RoundDefenseData
  defenseData: Record<string, Record<string, RoundDefenseData>>;
  
  // Actions
  addHoleClip: (playerId: string, roundId: string, clip: HoleAudioClip) => void;
  removeHoleClip: (playerId: string, roundId: string, holeNumber: number) => void;
  setPressConference: (playerId: string, roundId: string, conference: PressConference) => void;
  removePressConference: (playerId: string, roundId: string) => void;
  getDefenseData: (playerId: string, roundId: string) => RoundDefenseData | null;
  clearAll: () => void;
}

const createEmptyDefenseData = (playerId: string, roundId: string): RoundDefenseData => ({
  player_id: playerId,
  round_id: roundId,
  hole_clips: [],
  press_conference: undefined,
});

export const useRoundDefenseStore = create<RoundDefenseState>((set, get) => ({
  defenseData: {},

  addHoleClip: (playerId: string, roundId: string, clip: HoleAudioClip) => {
    set((state) => {
      const playerData = state.defenseData[playerId] || {};
      const roundData = playerData[roundId] || createEmptyDefenseData(playerId, roundId);
      
      // Remove existing clip for this hole if any
      const filteredClips = roundData.hole_clips.filter(c => c.hole_number !== clip.hole_number);
      
      return {
        defenseData: {
          ...state.defenseData,
          [playerId]: {
            ...playerData,
            [roundId]: {
              ...roundData,
              hole_clips: [...filteredClips, clip],
            },
          },
        },
      };
    });
  },

  removeHoleClip: (playerId: string, roundId: string, holeNumber: number) => {
    set((state) => {
      const playerData = state.defenseData[playerId];
      if (!playerData) return state;
      
      const roundData = playerData[roundId];
      if (!roundData) return state;
      
      // Revoke the object URL to free memory
      const clipToRemove = roundData.hole_clips.find(c => c.hole_number === holeNumber);
      if (clipToRemove) {
        URL.revokeObjectURL(clipToRemove.audio_url);
      }
      
      return {
        defenseData: {
          ...state.defenseData,
          [playerId]: {
            ...playerData,
            [roundId]: {
              ...roundData,
              hole_clips: roundData.hole_clips.filter(c => c.hole_number !== holeNumber),
            },
          },
        },
      };
    });
  },

  setPressConference: (playerId: string, roundId: string, conference: PressConference) => {
    set((state) => {
      const playerData = state.defenseData[playerId] || {};
      const roundData = playerData[roundId] || createEmptyDefenseData(playerId, roundId);
      
      // Revoke old URL if exists
      if (roundData.press_conference) {
        URL.revokeObjectURL(roundData.press_conference.audio_url);
      }
      
      return {
        defenseData: {
          ...state.defenseData,
          [playerId]: {
            ...playerData,
            [roundId]: {
              ...roundData,
              press_conference: conference,
            },
          },
        },
      };
    });
  },

  removePressConference: (playerId: string, roundId: string) => {
    set((state) => {
      const playerData = state.defenseData[playerId];
      if (!playerData) return state;
      
      const roundData = playerData[roundId];
      if (!roundData || !roundData.press_conference) return state;
      
      // Revoke the object URL
      URL.revokeObjectURL(roundData.press_conference.audio_url);
      
      return {
        defenseData: {
          ...state.defenseData,
          [playerId]: {
            ...playerData,
            [roundId]: {
              ...roundData,
              press_conference: undefined,
            },
          },
        },
      };
    });
  },

  getDefenseData: (playerId: string, roundId: string) => {
    const state = get();
    return state.defenseData[playerId]?.[roundId] || null;
  },

  clearAll: () => {
    // Revoke all URLs before clearing
    const state = get();
    Object.values(state.defenseData).forEach(playerData => {
      Object.values(playerData).forEach(roundData => {
        roundData.hole_clips.forEach(clip => URL.revokeObjectURL(clip.audio_url));
        if (roundData.press_conference) {
          URL.revokeObjectURL(roundData.press_conference.audio_url);
        }
      });
    });
    
    set({ defenseData: {} });
  },
}));
