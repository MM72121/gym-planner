"use client";

import { useState } from "react";
import { parseStrongCSV, saveWorkouts, type ImportPreview } from "@/lib/csv-parser";
import { addNewExercises, getMuscleGroupOptions, type NewExercise } from "@/lib/exercise-detector";
import { getAllMuscles } from "@/lib/recommendations";

export default function ImportPage() {
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingExercises, setAddingExercises] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDragover, setIsDragover] = useState(false);
  const [exerciseMuscles, setExerciseMuscles] = useState<Record<string, string[]>>({});
  const muscleOptions = getAllMuscles();

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setMessage({ type: "error", text: "Please select a CSV file" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const result = await parseStrongCSV(text);
      setPreview(result);

      if (result.errors.length > 0) {
        setMessage({
          type: "error",
          text: `Found ${result.errors.length} error(s) during parsing`,
        });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to parse file",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview || preview.workouts.length === 0) return;

    // If there are new exercises, add them first
    if (preview.newExercises.length > 0) {
      const unassignedExercises = preview.newExercises.filter(
        (ex) => !exerciseMuscles[ex] || exerciseMuscles[ex].length === 0
      );

      if (unassignedExercises.length > 0) {
        setMessage({
          type: "error",
          text: `Please assign at least one muscle group to: ${unassignedExercises.join(", ")}`,
        });
        return;
      }

      setAddingExercises(true);
      setMessage(null);

      try {
        const newExercises: NewExercise[] = preview.newExercises.map((name) => {
          const muscles = exerciseMuscles[name] || [];
          return {
            name,
            primary_muscle: muscles[0] || "",
            secondary_muscles: muscles.slice(1),
          };
        });

        const result = await addNewExercises(newExercises);

        if (!result.success) {
          setMessage({
            type: "error",
            text: result.error || "Failed to add exercises",
          });
          setAddingExercises(false);
          return;
        }
      } catch (e) {
        setMessage({
          type: "error",
          text: e instanceof Error ? e.message : "Unknown error",
        });
        setAddingExercises(false);
        return;
      }
      setAddingExercises(false);
    }

    // Now save workouts
    setSaving(true);
    setMessage(null);

    try {
      const result = await saveWorkouts(preview.workouts);

      if (result.success) {
        setMessage({
          type: "success",
          text: `Imported ${preview.workouts.length} workouts and ${preview.totalSets} sets!`,
        });
        setPreview(null);
        setExerciseMuscles({});
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save workouts",
        });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Import Workouts</h1>
      <p className="text-stone-600 mb-8">
        Upload your Strong app CSV export to add workouts to the database.
      </p>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragover(true);
        }}
        onDragLeave={() => setIsDragover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragover(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragover
            ? "border-red-600 bg-red-50"
            : "border-stone-300 bg-stone-50 hover:border-stone-400"
        }`}
      >
        <p className="text-stone-600 mb-4">
          Drag and drop your Strong CSV file here, or click to select
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) handleFileSelect(file);
          }}
          disabled={loading || saving}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input">
          <button
            onClick={() => document.getElementById("file-input")?.click()}
            disabled={loading || saving}
            className="px-6 py-2 bg-black text-white rounded hover:bg-stone-800 disabled:opacity-50 font-medium"
          >
            {loading ? "Parsing..." : "Select File"}
          </button>
        </label>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-8 bg-white border border-stone-200 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-2">Preview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-stone-50 p-4 rounded">
                <p className="text-sm text-stone-600">Workouts</p>
                <p className="text-2xl font-bold text-stone-900">
                  {preview.workouts.length}
                </p>
              </div>
              <div className="bg-stone-50 p-4 rounded">
                <p className="text-sm text-stone-600">Total Sets</p>
                <p className="text-2xl font-bold text-stone-900">
                  {preview.totalSets}
                </p>
              </div>
              <div className="bg-stone-50 p-4 rounded">
                <p className="text-sm text-stone-600">Errors</p>
                <p className="text-2xl font-bold text-stone-900">
                  {preview.errors.length}
                </p>
              </div>
            </div>
          </div>

          {/* Workouts List */}
          <div className="mb-6">
            <h3 className="font-semibold text-stone-900 mb-4">
              Workouts to Import
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {preview.workouts.map((workout, idx) => (
                <div key={idx} className="border border-stone-200 rounded p-3">
                  <p className="font-medium text-stone-900">
                    {workout.date} • {workout.name}
                  </p>
                  <p className="text-sm text-stone-600">
                    {workout.sets.length} sets
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* New Exercises */}
          {preview.newExercises.length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded p-4">
              <p className="font-medium text-blue-900 mb-4">
                Found {preview.newExercises.length} new exercise
                {preview.newExercises.length !== 1 ? "s" : ""} - assign muscle
                groups:
              </p>
              <div className="space-y-4">
                {preview.newExercises.map((exercise) => (
                  <div key={exercise} className="bg-white rounded p-3">
                    <p className="font-medium text-stone-900 mb-2">{exercise}</p>
                    <p className="text-xs text-stone-600 mb-3">
                      Select all muscle groups this exercise targets:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {muscleOptions.map((muscle) => {
                        const isSelected = exerciseMuscles[exercise]?.includes(
                          muscle
                        ) || false;
                        return (
                          <button
                            key={muscle}
                            type="button"
                            onClick={() =>
                              setExerciseMuscles((prev) => {
                                const current = prev[exercise] || [];
                                return {
                                  ...prev,
                                  [exercise]: isSelected
                                    ? current.filter((m) => m !== muscle)
                                    : [...current, muscle],
                                };
                              })
                            }
                            className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-stone-200 text-stone-900 hover:bg-stone-300"
                            }`}
                          >
                            {isSelected && <span>✓</span>}
                            {muscle}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {preview.errors.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded p-4">
              <p className="font-medium text-red-900 mb-2">Parsing Errors</p>
              <ul className="text-sm text-red-800 space-y-1">
                {preview.errors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>• {err}</li>
                ))}
                {preview.errors.length > 5 && (
                  <li>... and {preview.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setPreview(null)}
              disabled={saving || addingExercises}
              className="px-6 py-2 border border-stone-300 text-stone-900 rounded hover:bg-stone-50 disabled:opacity-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving || addingExercises || preview.workouts.length === 0}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium cursor-pointer"
            >
              {addingExercises ? "Adding exercises..." : saving ? "Importing..." : "Confirm & Import"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
