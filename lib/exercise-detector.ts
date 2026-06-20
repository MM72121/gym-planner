import { supabase } from "./supabase";
import { getMuscleGroups } from "./recommendations";

export interface NewExercise {
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
}

export async function detectNewExercises(
  exerciseNames: string[]
): Promise<string[]> {
  if (exerciseNames.length === 0) return [];

  // Get all existing exercise names
  const { data: existing, error } = await supabase
    .from("exercises")
    .select("name");

  if (error || !existing) {
    console.error("Error checking existing exercises:", error);
    return [];
  }

  const existingNames = new Set(existing.map((e) => e.name));
  const newNames = exerciseNames.filter((name) => !existingNames.has(name));

  return Array.from(new Set(newNames)); // Remove duplicates
}

export function getMuscleGroupOptions(): string[] {
  return getMuscleGroups();
}

export async function addNewExercises(
  exercises: NewExercise[]
): Promise<{ success: boolean; error?: string }> {
  if (exercises.length === 0) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from("exercises").insert(
      exercises.map((ex) => ({
        name: ex.name,
        primary_muscles: [ex.primary_muscle],
        secondary_muscles: ex.secondary_muscles,
        tags: [],
      }))
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
