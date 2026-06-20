"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMuscleGroups, getAllMuscles } from "@/lib/recommendations";

interface Exercise {
  id: string;
  name: string;
  primary_muscles: string[];
  secondary_muscles: string[];
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMuscles, setEditMuscles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allMuscles = getAllMuscles();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("name");

    if (!error && data) {
      setExercises(data as Exercise[]);
    }
    setLoading(false);
  };

  const startEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setEditMuscles([...exercise.primary_muscles, ...exercise.secondary_muscles]);
  };

  const handleSaveEdit = async () => {
    if (!editingId || editMuscles.length === 0) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("exercises")
        .update({
          primary_muscles: [editMuscles[0]],
          secondary_muscles: editMuscles.slice(1),
        })
        .eq("id", editingId);

      if (!error) {
        await fetchExercises();
        setEditingId(null);
      }
    } catch (e) {
      console.error("Error saving exercise:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", id);

      if (!error) {
        await fetchExercises();
        setDeleteConfirm(null);
      }
    } catch (e) {
      console.error("Error deleting exercise:", e);
    } finally {
      setSaving(false);
    }
  };

  const muscleGroups = getMuscleGroups();
  const filteredExercises = selectedMuscle
    ? exercises.filter((ex) => ex.primary_muscles.includes(selectedMuscle))
    : exercises;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Exercises</h1>
      <p className="text-stone-600 mb-8">
        Browse all exercises. Click a muscle group to filter. Click edit to adjust muscle groups.
      </p>

      {/* Muscle Group Filter */}
      <div className="mb-8">
        <h2 className="font-semibold text-stone-900 mb-4">Filter by Muscle Group</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMuscle(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMuscle === null
                ? "bg-red-600 text-white"
                : "bg-stone-200 text-stone-900 hover:bg-stone-300"
            }`}
          >
            All
          </button>
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMuscle === muscle
                  ? "bg-red-600 text-white"
                  : "bg-stone-200 text-stone-900 hover:bg-stone-300"
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      {loading ? (
        <p className="text-stone-600">Loading exercises...</p>
      ) : filteredExercises.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg p-8 text-center">
          <p className="text-stone-600">No exercises found.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg divide-y">
          {filteredExercises.map((exercise) =>
            editingId === exercise.id ? (
              // Edit Mode
              <div key={exercise.id} className="p-6 bg-stone-50">
                <h3 className="font-semibold text-stone-900 text-lg mb-4">
                  Edit: {exercise.name}
                </h3>
                <p className="text-sm text-stone-600 mb-3">
                  Select muscle groups this exercise targets:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {allMuscles.map((muscle) => {
                    const isSelected = editMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        onClick={() =>
                          setEditMuscles((prev) =>
                            isSelected
                              ? prev.filter((m) => m !== muscle)
                              : [...prev, muscle]
                          )
                        }
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-red-600 text-white"
                            : "bg-stone-200 text-stone-900 hover:bg-stone-300"
                        }`}
                      >
                        {isSelected && <span>✓</span>}
                        {muscle}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={saving}
                    className="px-4 py-2 border border-stone-300 text-stone-900 rounded hover:bg-stone-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving || editMuscles.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(exercise.id)}
                    className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div key={exercise.id} className="p-6 hover:bg-stone-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-stone-900 text-lg">
                    {exercise.name}
                  </h3>
                  <button
                    onClick={() => startEdit(exercise)}
                    className="text-sm px-3 py-1 bg-stone-200 text-stone-900 rounded hover:bg-stone-300"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {exercise.primary_muscles.map((muscle) => (
                    <span
                      key={`primary-${muscle}`}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {muscle}
                    </span>
                  ))}
                  {exercise.secondary_muscles.map((muscle) => (
                    <span
                      key={`secondary-${muscle}`}
                      className="bg-stone-200 text-stone-700 px-3 py-1 rounded-full text-sm"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="mt-8 text-sm text-stone-600">
        Showing {filteredExercises.length} of {exercises.length} exercises
        {selectedMuscle && ` for ${selectedMuscle}`}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Delete Exercise?</h2>
            <p className="text-stone-600 mb-6">
              Are you sure you want to delete this exercise? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-stone-300 text-stone-900 rounded hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExercise(deleteConfirm)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
