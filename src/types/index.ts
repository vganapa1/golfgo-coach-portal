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
