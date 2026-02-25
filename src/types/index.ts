// ============================================================================
// PLAYER TYPES
// ============================================================================

export interface Player {
  id: string;
  name: string;
  handicap: number;
  clippd_id: string;
  rounds_completed: number;
  avatar?: string;
}

// ============================================================================
// COURSE TYPES
// ============================================================================

export interface Course {
  name: string;
  holes: number;
  par: number;
  rating: number;
  slope: number;
}

export interface Hole {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
}

// ============================================================================
// SHOT TYPES
// ============================================================================

export interface Shot {
  shot_number: number;
  club: string;
  distance_yards: number;
  outcome: 'fairway' | 'rough' | 'bunker' | 'green' | 'water' | 'penalty';
  lie: string;
  start_x?: number;
  start_y?: number;
  end_x?: number;
  end_y?: number;
  to_pin_distance?: number;
}

// ============================================================================
// HOLE RESULT TYPES
// ============================================================================

export interface HoleResult {
  hole_number: number;
  par: number;
  score: number;
  shots: Shot[];
  fairway_hit?: boolean;
  gir?: boolean;
  putts: number;
  up_and_down?: boolean;
  scramble?: boolean;
  strokes_gained?: {
    ott?: number;  // Off the tee
    app?: number;  // Approach
    arg?: number;  // Around the green
    putt?: number; // Putting
    total?: number;
  };
}

// ============================================================================
// ROUND TYPES
// ============================================================================

export interface Round {
  player_id: string;
  round_number: number;
  date: string;
  course_name: string;
  total_score: number;
  total_par: number;
  holes: HoleResult[];
  summary: RoundSummary;
}

export interface RoundSummary {
  total_score: number;
  total_par: number;
  score_to_par: number;
  fairways_hit: number;
  fairways_possible: number;
  fairways_pct: number;
  gir: number;
  gir_possible: number;
  gir_pct: number;
  total_putts: number;
  putts_per_hole: number;
  three_putts: number;
  up_and_downs: number;
  up_and_down_attempts: number;
  up_and_down_pct: number;
  scrambles: number;
  scramble_attempts: number;
  scramble_pct: number;
  strokes_gained: {
    ott: number;
    app: number;
    arg: number;
    putt: number;
    total: number;
  };
}

// ============================================================================
// MULTI-ROUND ANALYSIS TYPES
// ============================================================================

export interface PlayerRoundData {
  player: Player;
  rounds: Round[];
  aggregate_stats: AggregateStats;
  progression: ProgressionMetrics;
}

export interface AggregateStats {
  rounds_played: number;
  avg_score: number;
  best_score: number;
  worst_score: number;
  score_std_dev: number;
  avg_fairways_pct: number;
  avg_gir_pct: number;
  avg_putts_per_round: number;
  avg_strokes_gained: {
    ott: number;
    app: number;
    arg: number;
    putt: number;
    total: number;
  };
}

export interface ProgressionMetrics {
  score_trend: 'improving' | 'declining' | 'stable';
  score_change_r1_to_r3: number;
  consistency_improving: boolean;
  strongest_category: 'ott' | 'app' | 'arg' | 'putt';
  weakest_category: 'ott' | 'app' | 'arg' | 'putt';
  most_improved_category: 'ott' | 'app' | 'arg' | 'putt';
}

// ============================================================================
// GROUP ANALYTICS TYPES
// ============================================================================

export interface GroupAnalytics {
  total_rounds: number;
  total_players: number;
  group_avg_score: number;
  avg_by_round: {
    round_1: number;
    round_2: number;
    round_3: number;
  };
  group_strokes_gained: {
    ott: number;
    app: number;
    arg: number;
    putt: number;
    total: number;
  };
  best_player: {
    player_id: string;
    avg_score: number;
  };
  most_improved: {
    player_id: string;
    improvement: number;
  };
}

// ============================================================================
// STRATEGY TYPES
// ============================================================================

export interface HoleStrategy {
  hole_number: number;
  tee_shot: {
    recommended_club: string;
    target_line: string;
    rationale: string;
  };
  approach: {
    target_area: string;
    strategy: 'aggressive' | 'conservative';
    rationale: string;
  };
  short_game?: {
    focus_area: string;
    rationale: string;
  };
  putting?: {
    emphasis: 'speed' | 'line' | 'both';
    rationale: string;
  };
  confidence_level: 'high' | 'medium' | 'low';
  based_on_rounds: number[];
  
  // New fields for editing
  coach_notes?: string;
  has_voice_note?: boolean;
  voice_note_url?: string;
  voice_note_duration?: number;
  edited_by_coach?: boolean;
  edited_at?: string;
}

export interface CourseStrategy {
  player_id: string;
  generated_date: string;
  holes: HoleStrategy[];
  overall_notes: string;
  approved: boolean;
  coach_notes?: string;
  
  // Track which holes have been edited
  edited_holes?: number[]; // Array of hole numbers that were edited
  
  // Track approval status per hole
  hole_approvals?: {
    [hole_number: number]: {
      approved: boolean;
      requires_approval: boolean; // true for medium/low confidence
      approved_at?: string;
    };
  };
}

// ============================================================================
// CLIPPD DATA TYPES
// ============================================================================

export interface ClippDHeatmapValues {
  top_left: number;
  top_center: number;
  top_right: number;
  middle_left: number;
  middle_center: number;
  middle_right: number;
  bottom_left: number;
  bottom_center: number;
  bottom_right: number;
}

export interface ClippDPinLocationHeatmap {
  distance_range: string;
  values: ClippDHeatmapValues;
}

export interface ClippDPuttingProfile {
  distance_range: string;
  rounds_analyzed: number;
  speed_control: string;
  straight_putts: string;
  l_to_r_putts: string;
  r_to_l_putts: string;
}

export interface ClippDPlayerData {
  player_id: string;
  player_name: string;
  rounds_analyzed: number;
  last_updated: string;

  off_the_tee: {
    overall_shot_quality: number;
    dna: { category: string; avg_shot_quality: number }[];
  };

  approach: {
    overall: {
      shot_quality: number;
      strokes_gained: number;
      gir_pct: number;
      accuracy_pct: number;
      avg_proximity: string;
      tour_t25_avg_proximity: string;
      miss_tendency: {
        left_pct: number;
        right_pct: number;
        short_pct: number;
        long_pct: number;
      };
    };
    shot_quality_zones_top3: {
      range_yards: string;
      shot_quality: number;
      avg_proximity: string;
    }[];
    avoid_zone: {
      range_yards: string;
      shot_quality: number;
      avg_proximity: string;
    };
    pin_location_heatmaps: ClippDPinLocationHeatmap[];
  };

  around_the_green: {
    player_quality: number;
    tour_top_25: number;
    importance_to_scoring_pct: number;
    work_on: {
      category: string;
      importance_pct: number;
      opportunity: string;
      sq_trend: number;
    };
    breakdown: {
      from_fairway: { up_and_down_pct: number; strokes_gained: number };
      from_rough: { up_and_down_pct: number; strokes_gained: number };
      from_sand: { up_and_down_pct: number; strokes_gained: number };
    };
  };

  putting: {
    overall: {
      player_quality: number;
      tour_top_25: number;
      strokes_gained: number;
      shot_quality: number;
      importance_to_scoring_pct: number;
      birdie_conversion_pct: number;
      tour_t25_birdie_conversion_pct: number;
      one_putt_pct: number;
      three_putt_pct: number;
      putts_per_round: number;
      putts_per_gir: number;
      avg_putts_made_distance: string;
      total_putts: number;
      one_putts: number;
      two_putts: number;
      three_putts: number;
      putts_made_distance: string;
      tour_t25_putts_made_distance: string;
    };
    work_on: {
      focus_area: string;
      importance_pct: number;
      opportunity: string;
      sq_trend: number;
      trending: string;
    };
    profiles: ClippDPuttingProfile[];
  };
}

// ============================================================================
// ROUND DEFENSE TYPES
// ============================================================================

export interface HoleAudioClip {
  hole_number: number;
  audio_url: string;
  duration: number;
  recorded_at: string;
  notes?: string;
}

export interface PressConference {
  audio_url: string;
  duration: number;
  recorded_at: string;
  title?: string;
}

export interface RoundDefenseData {
  player_id: string;
  round_id: string;
  hole_clips: HoleAudioClip[];
  press_conference?: PressConference;
}
