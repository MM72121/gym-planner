import { supabase } from "./supabase";

export interface RecommendedExercise {
  id: string;
  name: string;
  primary_muscles: string[];
  last_done: string | null;
  days_since: number;
}

const MAJOR_MUSCLES = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
];

const MINOR_MUSCLES = [
  "Traps",
  "Forearms",
  "Adductors",
  "Rear Delts",
];

export function getMuscleGroups(): string[] {
  return MAJOR_MUSCLES;
}

export function getMinorMuscles(): string[] {
  return MINOR_MUSCLES;
}

export function getAllMuscles(): string[] {
  return [...MAJOR_MUSCLES, ...MINOR_MUSCLES];
}

export function isMajorMuscle(muscle: string): boolean {
  return MAJOR_MUSCLES.includes(muscle);
}

export async function getRecommendations(
  muscleGroup: string
): Promise<RecommendedExercise[]> {
  // Get all exercises and filter in JS
  const { data: allExercises, error: exercisesError } = await supabase
    .from("exercises")
    .select("id, name, primary_muscles")
    .returns<
      Array<{
        id: string;
        name: string;
        primary_muscles: string[];
      }>
    >();

  if (exercisesError || !allExercises) {
    console.error("Exercises query error:", exercisesError);
    return [];
  }

  // Filter to only exercises for this muscle group
  const exercises = allExercises.filter((ex) =>
    ex.primary_muscles.includes(muscleGroup)
  );

  // For each exercise, get the last date it was done
  const recommendations: RecommendedExercise[] = [];

  for (const exercise of exercises) {
    const { data: lastSet, error: lastSetError } = await supabase
      .from("workout_sets")
      .select("created_at")
      .eq("exercise_name", exercise.name)
      .order("created_at", { ascending: false })
      .limit(1);

    if (lastSetError) {
      console.error(`Error getting last set for ${exercise.name}:`, lastSetError);
      continue;
    }

    let daysSince = 999;
    let lastDone: string | null = null;

    if (lastSet && lastSet.length > 0 && lastSet[0].created_at) {
      lastDone = lastSet[0].created_at;
      const lastDate = new Date(lastSet[0].created_at);
      const today = new Date();
      daysSince = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    recommendations.push({
      id: exercise.id,
      name: exercise.name,
      primary_muscles: exercise.primary_muscles,
      last_done: lastDone,
      days_since: daysSince,
    });
  }

  // Sort by days_since (highest first = haven't done recently)
  return recommendations.sort((a, b) => b.days_since - a.days_since).slice(0, 5);
}
