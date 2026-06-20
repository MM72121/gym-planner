import { supabase } from "./supabase";
import { isMajorMuscle } from "./recommendations";

export interface MuscleGroupVolume {
  muscle_group: string;
  set_count: number;
  tonnage: number; // weight * reps sum
}

export interface VolumeData {
  volumes: MuscleGroupVolume[];
  imbalances: string[]; // muscle groups at <50% of median
  maxVolume: number;
}

export async function getVolumeData(): Promise<VolumeData> {
  const days = 21;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const dateStr = cutoffDate.toISOString().split("T")[0];

  // Query all workout sets from past 21 days
  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select("exercise_name, weight_kg, reps")
    .gte("created_at", `${dateStr}T00:00:00Z`);

  if (setsError) {
    console.error("Volume query error:", setsError);
    return { volumes: [], imbalances: [], maxVolume: 0 };
  }

  if (!sets || sets.length === 0) {
    return { volumes: [], imbalances: [], maxVolume: 0 };
  }

  // Get unique exercise names
  const exerciseNames = Array.from(new Set(sets.map((s) => s.exercise_name)));

  // Query all exercises that match those names
  const { data: exercises, error: exercisesError } = await supabase
    .from("exercises")
    .select("name, primary_muscles")
    .in("name", exerciseNames);

  if (exercisesError) {
    console.error("Exercises query error:", exercisesError);
    return { volumes: [], imbalances: [], maxVolume: 0 };
  }

  // Build exercise lookup map
  const exerciseMap = new Map<
    string,
    { primary_muscles: string[] }
  >();
  exercises?.forEach((ex) => {
    exerciseMap.set(ex.name, { primary_muscles: ex.primary_muscles });
  });

  // Aggregate by muscle group
  const volumeMap = new Map<string, MuscleGroupVolume>();

  sets.forEach((set) => {
    const exercise = exerciseMap.get(set.exercise_name);
    if (!exercise) return;

    const weight = set.weight_kg || 0;
    const reps = set.reps || 0;
    const tonnage = weight * reps;

    // Count sets for each primary muscle
    exercise.primary_muscles.forEach((muscle) => {
      const current = volumeMap.get(muscle) || {
        muscle_group: muscle,
        set_count: 0,
        tonnage: 0,
      };
      current.set_count += 1;
      current.tonnage += tonnage;
      volumeMap.set(muscle, current);
    });
  });

  let volumes = Array.from(volumeMap.values());

  // Get all possible muscle groups from exercises and add zeros for untrained
  const { data: allExercises } = await supabase.from("exercises").select("primary_muscles");
  const allMuscleGroups = new Set<string>();
  allExercises?.forEach((ex: { primary_muscles: string[] }) => {
    ex.primary_muscles.forEach((m) => allMuscleGroups.add(m));
  });

  // Add missing muscle groups with 0 volume
  allMuscleGroups.forEach((muscle) => {
    if (!volumeMap.has(muscle)) {
      volumes.push({
        muscle_group: muscle,
        set_count: 0,
        tonnage: 0,
      });
    }
  });

  volumes = volumes.sort((a, b) => b.set_count - a.set_count);

  // Calculate imbalances with different thresholds for major vs minor muscles
  const setCountValues = volumes.map((v) => v.set_count).filter((v) => v > 0);
  const medianSetCount =
    setCountValues.length > 0
      ? setCountValues[Math.floor(setCountValues.length / 2)]
      : 0;

  const imbalances = volumes
    .filter((v) => {
      if (v.set_count === 0) return true; // Always flag untrained
      if (medianSetCount === 0) return false;

      const ratio = v.set_count / medianSetCount;
      // Major muscles: < 50% of median
      // Minor muscles: < 25% of median
      const threshold = isMajorMuscle(v.muscle_group) ? 0.5 : 0.25;
      return ratio < threshold;
    })
    .map((v) => v.muscle_group);

  const maxVolume =
    volumes.length > 0 ? Math.max(...volumes.map((v) => v.set_count)) : 0;

  return { volumes, imbalances, maxVolume };
}
