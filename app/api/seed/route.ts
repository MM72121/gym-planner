import { seedExercises } from "@/lib/seed-exercises";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await seedExercises();

    if (result) {
      return NextResponse.json({
        success: true,
        message: "Exercises seeded successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to seed exercises" },
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
