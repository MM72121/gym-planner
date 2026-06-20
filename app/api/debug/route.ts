import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [exercises, workouts, sets] = await Promise.all([
      supabase.from("exercises").select("count"),
      supabase.from("workouts").select("count"),
      supabase.from("workout_sets").select("count"),
    ]);

    const [exercisesSample, setsSample] = await Promise.all([
      supabase.from("exercises").select("name").limit(5),
      supabase.from("workout_sets").select("exercise_name, created_at").limit(5),
    ]);

    return NextResponse.json({
      tables: {
        exercises: exercises.count,
        workouts: workouts.count,
        workout_sets: sets.count,
      },
      samples: {
        exercises: exercisesSample.data,
        workout_sets: setsSample.data,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
