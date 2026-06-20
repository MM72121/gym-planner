import Papa from "papaparse";
import { supabase } from "./supabase";
import { detectNewExercises } from "./exercise-detector";

export interface ParsedRow {
  Date: string;
  "Workout Name": string;
  "Exercise Name": string;
  "Set Order": string;
  Weight: string;
  Reps: string;
  Notes?: string;
}

export interface ParsedWorkout {
  date: string;
  name: string;
  sets: Array<{
    exercise_name: string;
    set_order: number;
    weight_kg: number;
    reps: number;
    notes: string | null;
  }>;
}

export interface ImportPreview {
  workouts: ParsedWorkout[];
  totalSets: number;
  errors: string[];
  newExercises: string[];
}

export async function parseStrongCSV(csvText: string): Promise<ImportPreview> {
  const errors: string[] = [];
  const workoutMap = new Map<string, ParsedWorkout>();

  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as ParsedRow[];

        rows.forEach((row, idx) => {
          try {
            // Validate required fields
            if (!row.Date || !row["Workout Name"] || !row["Exercise Name"]) {
              errors.push(`Row ${idx + 2}: Missing required fields`);
              return;
            }

            const reps = parseInt(row.Reps);
            if (isNaN(reps) || reps === 0) {
              return; // Skip rows with 0 or invalid reps
            }

            const weight = parseFloat(row.Weight);
            const workoutKey = `${row.Date.split(" ")[0]}|${row["Workout Name"]}`;

            if (!workoutMap.has(workoutKey)) {
              workoutMap.set(workoutKey, {
                date: row.Date.split(" ")[0],
                name: row["Workout Name"],
                sets: [],
              });
            }

            const workout = workoutMap.get(workoutKey)!;
            workout.sets.push({
              exercise_name: row["Exercise Name"].trim(),
              set_order: parseInt(row["Set Order"]) || workout.sets.length + 1,
              weight_kg: isNaN(weight) ? 0 : weight,
              reps: reps,
              notes: row.Notes?.trim() || null,
            });
          } catch (e) {
            errors.push(
              `Row ${idx + 2}: ${e instanceof Error ? e.message : "Parse error"}`
            );
          }
        });

        const workouts = Array.from(workoutMap.values());
        const totalSets = workouts.reduce((sum, w) => sum + w.sets.length, 0);

        // Detect new exercises
        const exerciseNames = rows
          .map((row) => row["Exercise Name"]?.trim())
          .filter((name) => name && name.length > 0);
        detectNewExercises(exerciseNames).then((newExercises) => {
          resolve({ workouts, totalSets, errors, newExercises });
        });

        return; // Don't resolve yet, wait for detectNewExercises
      },
      error: (parseError: { message: string }) => {
        errors.push(`CSV parse error: ${parseError.message}`);
        resolve({ workouts: [], totalSets: 0, errors, newExercises: [] });
      },
    });
  });
}

export async function saveWorkouts(
  workouts: ParsedWorkout[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert workouts
    const workoutRecords = workouts.map((w) => ({
      date: w.date,
      name: w.name,
      source: "csv",
    }));

    const { data: insertedWorkouts, error: workoutError } = await supabase
      .from("workouts")
      .insert(workoutRecords)
      .select("id, date, name");

    if (workoutError) {
      return { success: false, error: workoutError.message };
    }

    // Map old workouts to new IDs and insert sets
    const setRecords = [];
    for (let i = 0; i < workouts.length; i++) {
      const workout = workouts[i];
      const insertedWorkout = insertedWorkouts?.[i];

      if (insertedWorkout) {
        for (const set of workout.sets) {
          // Use workout date as created_at, not today's date
          const workoutDateTime = new Date(insertedWorkout.date).toISOString();
          setRecords.push({
            workout_id: insertedWorkout.id,
            exercise_name: set.exercise_name,
            set_order: set.set_order,
            weight_kg: set.weight_kg,
            reps: set.reps,
            notes: set.notes,
            created_at: workoutDateTime,
          });
        }
      }
    }

    if (setRecords.length > 0) {
      const { error: setError } = await supabase
        .from("workout_sets")
        .insert(setRecords);

      if (setError) {
        return { success: false, error: setError.message };
      }
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
