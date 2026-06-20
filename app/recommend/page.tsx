"use client";

import { useState, useEffect } from "react";
import { getMuscleGroups, getMinorMuscles, getRecommendations, type RecommendedExercise } from "@/lib/recommendations";
import { getFocusMuscles } from "@/lib/preferences";

export default function RecommendPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusMuscles, setFocusMuscles] = useState<string[]>([]);

  useEffect(() => {
    setFocusMuscles(getFocusMuscles());
  }, []);

  const handleSelectMuscle = async (muscle: string) => {
    setSelectedMuscle(muscle);
    setLoading(true);

    try {
      const recs = await getRecommendations(muscle);
      setRecommendations(recs);
    } catch (e) {
      console.error("Error fetching recommendations:", e);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const majorMuscles = getMuscleGroups();
  const minorMuscles = getMinorMuscles();
  const isFocused = selectedMuscle && focusMuscles.includes(selectedMuscle);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
        Recommend Exercises
      </h1>
      <p className="text-sm sm:text-base text-stone-600 mb-6 sm:mb-8">
        Select a muscle group to get personalized exercise recommendations based on your recent activity.
      </p>

      {/* Muscle Group Grid */}
      <div className="mb-8 sm:mb-12">
        <h2 className="font-semibold text-stone-900 mb-3 sm:mb-4 text-sm sm:text-base">Select Muscle Group</h2>

        {/* Major Muscles */}
        <div className="mb-6 sm:mb-6">
          <p className="text-xs sm:text-sm text-stone-600 mb-2 sm:mb-3">Major Muscles</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {majorMuscles.map((muscle) => (
              <button
                key={muscle}
                onClick={() => handleSelectMuscle(muscle)}
                className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-base transition-colors whitespace-nowrap ${
                  selectedMuscle === muscle
                    ? "bg-red-600 text-white"
                    : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>

        {/* Minor Muscles */}
        <div>
          <p className="text-xs sm:text-sm text-stone-600 mb-2 sm:mb-3">Isolation Muscles</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
            {minorMuscles.map((muscle) => (
              <button
                key={muscle}
                onClick={() => handleSelectMuscle(muscle)}
                className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-base transition-colors whitespace-nowrap ${
                  selectedMuscle === muscle
                    ? "bg-red-600 text-white"
                    : "bg-stone-100 text-stone-900 hover:bg-stone-200"
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {selectedMuscle && (
        <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6">
            <h2 className="text-base sm:text-xl font-semibold text-stone-900">
              Top Exercises for {selectedMuscle}
            </h2>
            {isFocused && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap w-fit">
                Focus
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-sm sm:text-base text-stone-600">Loading recommendations...</p>
          ) : recommendations.length === 0 ? (
            <p className="text-sm sm:text-base text-stone-600">
              No exercises found for {selectedMuscle}. Add more workouts to get recommendations.
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recommendations.map((exercise, idx) => (
                <div
                  key={exercise.id}
                  className="border border-stone-200 rounded-lg p-3 sm:p-4 hover:bg-stone-50 transition-colors"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-base sm:text-lg font-semibold text-stone-900 break-words">
                        {idx + 1}. {exercise.name}
                      </p>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1">
                        {exercise.days_since === 999
                          ? "Never done"
                          : exercise.days_since === 0
                          ? "Done today"
                          : exercise.days_since === 1
                          ? "Done yesterday"
                          : `Last done ${exercise.days_since} days ago`}
                      </p>
                      {exercise.last_done && (
                        <p className="text-xs text-stone-500 mt-1">
                          {new Date(exercise.last_done).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${
                          exercise.days_since >= 14
                            ? "bg-red-100 text-red-700"
                            : exercise.days_since >= 7
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {exercise.days_since >= 14
                          ? "High priority"
                          : exercise.days_since >= 7
                          ? "Medium priority"
                          : "Recent"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
