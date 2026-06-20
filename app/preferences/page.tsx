"use client";

import { useState, useEffect } from "react";
import { getMuscleGroups, getMinorMuscles } from "@/lib/recommendations";
import { getPreferences, setPreferences, isFocused } from "@/lib/preferences";

export default function PreferencesPage() {
  const [focusMuscles, setFocusMuscles] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const prefs = getPreferences();
    setFocusMuscles(prefs.focusMuscles);
    setLoaded(true);
  }, []);

  const handleToggle = (muscle: string) => {
    let newFocus = [...focusMuscles];
    if (newFocus.includes(muscle)) {
      newFocus = newFocus.filter((m) => m !== muscle);
    } else {
      newFocus.push(muscle);
    }
    setFocusMuscles(newFocus);
    setPreferences({ focusMuscles: newFocus });
  };

  const muscleGroups = getMuscleGroups();
  const minorMuscles = getMinorMuscles();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Preferences</h1>
      <p className="text-stone-600 mb-8">
        Select which muscle groups you want to focus on. Your recommendations
        will prioritize these groups.
      </p>

      {loaded ? (
        <div className="bg-white border border-stone-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-stone-900 mb-6">
            Focus Muscle Groups
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {muscleGroups.map((muscle) => {
              const isSelected = focusMuscles.includes(muscle);
              return (
                <button
                  key={muscle}
                  onClick={() => handleToggle(muscle)}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    isSelected
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-stone-200 bg-white text-stone-900 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-red-600 border-red-600"
                          : "border-stone-300"
                      }`}
                    >
                      {isSelected && <span className="text-white text-sm">✓</span>}
                    </div>
                    {muscle}
                  </div>
                </button>
              );
            })}
          </div>

          {focusMuscles.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Focus set to:</strong> {focusMuscles.join(", ")}
              </p>
              <p className="text-xs text-red-700 mt-2">
                Your recommendations will prioritize exercises for these muscle
                groups.
              </p>
            </div>
          )}

          {focusMuscles.length === 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
              <p className="text-sm text-stone-600">
                No focus set. All muscle groups are equally recommended.
              </p>
            </div>
          )}

          {/* Minor/Isolation Muscles */}
          <div className="mt-8 pt-8 border-t border-stone-200">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">
              Isolation Muscles (Optional)
            </h2>
            <p className="text-stone-600 mb-4">
              Focus on smaller muscle groups if you like to isolate them:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {minorMuscles.map((muscle) => {
                const isSelected = focusMuscles.includes(muscle);
                return (
                  <button
                    key={muscle}
                    onClick={() => handleToggle(muscle)}
                    className={`p-4 rounded-lg border-2 font-medium transition-all ${
                      isSelected
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-stone-200 bg-white text-stone-900 hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-red-600 border-red-600"
                            : "border-stone-300"
                        }`}
                      >
                        {isSelected && <span className="text-white text-sm">✓</span>}
                      </div>
                      {muscle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-stone-600">Loading preferences...</p>
      )}
    </div>
  );
}
