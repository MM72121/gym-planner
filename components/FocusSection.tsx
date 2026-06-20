"use client";

import { useEffect, useState } from "react";
import { getFocusMuscles } from "@/lib/preferences";

interface VolumeData {
  muscle_group: string;
  set_count: number;
  tonnage: number;
}

interface FocusSectionProps {
  volumes: VolumeData[];
}

export default function FocusSection({ volumes }: FocusSectionProps) {
  const [focusMuscles, setFocusMuscles] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFocusMuscles(getFocusMuscles());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (focusMuscles.length === 0) {
    return null;
  }

  const getStatusColor = (setCount: number, medianVolume: number) => {
    if (setCount === 0) {
      return { bar: "bg-red-600", status: "Not Trained", badge: "bg-red-100 text-red-700" };
    }
    if (medianVolume === 0) {
      return { bar: "bg-red-600", status: "Undertrained", badge: "bg-red-100 text-red-700" };
    }

    const ratio = setCount / medianVolume;
    // Focused muscles have higher thresholds to encourage more volume
    if (ratio >= 2.0) {
      return { bar: "bg-orange-500", status: "Overtrained", badge: "bg-orange-100 text-orange-700" };
    } else if (ratio >= 0.33) {
      return { bar: "bg-green-600", status: "Optimal", badge: "bg-green-100 text-green-700" };
    } else {
      return { bar: "bg-red-600", status: "Undertrained", badge: "bg-red-100 text-red-700" };
    }
  };

  const focusData = focusMuscles
    .map((muscle) => {
      const volumeData = volumes.find((v) => v.muscle_group === muscle);
      return {
        muscle,
        sets: volumeData?.set_count || 0,
      };
    })
    .sort((a, b) => b.sets - a.sets);

  const trainedVolumes = volumes
    .filter((v) => v.set_count > 0)
    .map((v) => v.set_count)
    .sort((a, b) => a - b);

  const medianVolume =
    trainedVolumes.length > 0 ? trainedVolumes[Math.floor(trainedVolumes.length / 2)] : 0;

  const maxSets = Math.max(...focusData.map((f) => f.sets), 1);

  return (
    <div className="mb-12 bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-red-900 mb-4">
        🎯 Your Focus Muscles
      </h2>
      <div className="space-y-4">
        {focusData.map((focus) => {
          const { bar, status, badge } = getStatusColor(focus.sets, medianVolume);
          return (
            <div key={focus.muscle}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-stone-900">{focus.muscle}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${badge}`}>
                    {status}
                  </span>
                  <span className="text-sm text-stone-600">{focus.sets} sets</span>
                </div>
              </div>
              <div className="bg-stone-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`${bar} h-full`}
                  style={{ width: `${(focus.sets / maxSets) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-red-700 mt-4">
        💡 Keep training these muscles to reach your goals. Visit the Recommend
        page for targeted exercises.
      </p>
    </div>
  );
}
