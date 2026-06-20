import { supabase } from "./supabase";

const DEFAULT_EXERCISES = [
  // Chest
  { name: "Barbell Bench Press", primary: ["Chest"], secondary: ["Triceps", "Shoulders"] },
  { name: "Dumbbell Bench Press", primary: ["Chest"], secondary: ["Triceps", "Shoulders"] },
  { name: "Incline Dumbbell Press", primary: ["Chest"], secondary: ["Shoulders"] },
  { name: "Cable Chest Fly", primary: ["Chest"], secondary: [] },
  { name: "Machine Chest Press", primary: ["Chest"], secondary: ["Triceps"] },

  // Back
  { name: "Deadlift", primary: ["Back"], secondary: ["Glutes", "Hamstrings"] },
  { name: "Barbell Row", primary: ["Back"], secondary: ["Biceps"] },
  { name: "Lat Pulldown", primary: ["Back"], secondary: ["Biceps"] },
  { name: "Pull-ups", primary: ["Back"], secondary: ["Biceps"] },
  { name: "Machine Row", primary: ["Back"], secondary: ["Biceps"] },

  // Shoulders
  { name: "Overhead Press", primary: ["Shoulders"], secondary: ["Triceps"] },
  { name: "Dumbbell Shoulder Press", primary: ["Shoulders"], secondary: ["Triceps"] },
  { name: "Lateral Raise", primary: ["Shoulders"], secondary: [] },
  { name: "Face Pulls", primary: ["Shoulders"], secondary: [] },
  { name: "Machine Shoulder Press", primary: ["Shoulders"], secondary: ["Triceps"] },

  // Biceps
  { name: "Barbell Curl", primary: ["Biceps"], secondary: [] },
  { name: "Dumbbell Curl", primary: ["Biceps"], secondary: [] },
  { name: "Cable Curl", primary: ["Biceps"], secondary: [] },
  { name: "Machine Curl", primary: ["Biceps"], secondary: [] },
  { name: "Preacher Curl", primary: ["Biceps"], secondary: [] },

  // Triceps
  { name: "Tricep Dips", primary: ["Triceps"], secondary: ["Chest", "Shoulders"] },
  { name: "Tricep Rope Pushdown", primary: ["Triceps"], secondary: [] },
  { name: "Skull Crushers", primary: ["Triceps"], secondary: [] },
  { name: "Dumbbell Tricep Extension", primary: ["Triceps"], secondary: [] },
  { name: "Close Grip Bench Press", primary: ["Triceps"], secondary: ["Chest"] },

  // Quads
  { name: "Barbell Back Squat", primary: ["Quads"], secondary: ["Glutes"] },
  { name: "Leg Press", primary: ["Quads"], secondary: ["Glutes"] },
  { name: "Leg Extension", primary: ["Quads"], secondary: [] },
  { name: "Hack Squat", primary: ["Quads"], secondary: ["Glutes"] },
  { name: "Goblet Squat", primary: ["Quads"], secondary: ["Glutes"] },

  // Hamstrings
  { name: "Romanian Deadlift", primary: ["Hamstrings"], secondary: ["Back"] },
  { name: "Leg Curl", primary: ["Hamstrings"], secondary: [] },
  { name: "Machine Leg Curl", primary: ["Hamstrings"], secondary: [] },
  { name: "Nordic Curl", primary: ["Hamstrings"], secondary: [] },
  { name: "Good Mornings", primary: ["Hamstrings"], secondary: ["Back"] },

  // Glutes
  { name: "Hip Thrust", primary: ["Glutes"], secondary: [] },
  { name: "Bulgarian Split Squat", primary: ["Glutes"], secondary: ["Quads"] },
  { name: "Leg Press", primary: ["Glutes"], secondary: ["Quads"] },
  { name: "Smith Machine Squat", primary: ["Glutes"], secondary: ["Quads"] },
  { name: "Sumo Deadlift", primary: ["Glutes"], secondary: ["Hamstrings"] },

  // Calves
  { name: "Standing Calf Raise", primary: ["Calves"], secondary: [] },
  { name: "Seated Calf Raise", primary: ["Calves"], secondary: [] },
  { name: "Leg Press Calf Raise", primary: ["Calves"], secondary: [] },
  { name: "Dumbbell Calf Raise", primary: ["Calves"], secondary: [] },

  // Core
  { name: "Weighted Crunch", primary: ["Core"], secondary: [] },
  { name: "Ab Wheel", primary: ["Core"], secondary: [] },
  { name: "Hanging Leg Raise", primary: ["Core"], secondary: [] },
  { name: "Weighted Dip", primary: ["Core"], secondary: ["Triceps", "Chest"] },
  { name: "Cable Wood Chop", primary: ["Core"], secondary: [] },
];

export async function seedExercises() {
  try {
    // Check if "Bench Press" exists as a simple marker
    const { data: sample, error: checkError } = await supabase
      .from("exercises")
      .select("id")
      .eq("name", "Barbell Bench Press")
      .limit(1);

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Seed check error:", checkError);
      return false;
    }

    // If exercises exist, skip seeding
    if (sample && sample.length > 0) {
      console.log("Exercises already seeded, skipping");
      return true;
    }

    const exercises = DEFAULT_EXERCISES.map((ex) => ({
      name: ex.name,
      primary_muscles: ex.primary,
      secondary_muscles: ex.secondary,
      tags: [],
    }));

    console.log(`Attempting to insert ${exercises.length} exercises`);

    const { data, error } = await supabase
      .from("exercises")
      .insert(exercises)
      .select("id");

    if (error) {
      // Unique constraint error means exercises already exist
      if (error.code === "23505") {
        console.log("Exercises already exist (unique constraint), skipping");
        return true;
      }
      console.error("Seed insert error:", error.message, error.code);
      return false;
    }

    console.log(`Successfully seeded ${data?.length || 0} exercises`);
    return true;
  } catch (e) {
    console.error("Seed failed:", e);
    return false;
  }
}
