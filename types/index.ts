export interface Exercise {
  id: string;
  name: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  tags: string[];
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  source: string;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_name: string;
  set_order: number;
  weight_kg: number | null;
  reps: number | null;
  notes: string | null;
  created_at: string;
}

export interface VolumeEntry {
  muscle_group: string;
  set_count: number;
  tonnage: number;
}

export interface RecommendedExercise {
  id: string;
  name: string;
  primary_muscles: string[];
  last_done: string | null;
  days_since: number;
}
