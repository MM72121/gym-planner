"use client";

import { useState, useEffect } from "react";
import { getVolumeData } from "@/lib/volume";
import { seedExercises } from "@/lib/seed-exercises";
import { isMajorMuscle } from "@/lib/recommendations";
import { getFocusMuscles } from "@/lib/preferences";

interface VolumeData {
  muscle_group: string;
  set_count: number;
  tonnage: number;
}

export default function VolumePage() {
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [imbalances, setImbalances] = useState<string[]>([]);
  const [maxVolume, setMaxVolume] = useState(0);
  const [showMinor, setShowMinor] = useState(false);
  const [focusMuscles, setFocusMuscles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await seedExercises();
      const { volumes: v, imbalances: i, maxVolume: m } = await getVolumeData();
      setVolumes(v);
      setImbalances(i);
      setMaxVolume(m);
      setFocusMuscles(getFocusMuscles());
      setLoading(false);
    };
    loadData();
  }, []);

  const getVolumeStatus = (volume: VolumeData, isFocused: boolean) => {
    const trainedVolumes = volumes
      .filter((v) => v.set_count > 0)
      .map((v) => v.set_count)
      .sort((a, b) => a - b);

    const medianVolume =
      trainedVolumes.length > 0
        ? trainedVolumes[Math.floor(trainedVolumes.length / 2)]
        : 0;

    let barColor = "bg-red-600";
    let statusBadge = "Not Trained";
    let badgeColor = "bg-red-100 text-red-700";

    if (volume.set_count === 0) {
      barColor = "bg-red-600";
      statusBadge = "Not Trained";
      badgeColor = "bg-red-100 text-red-700";
    } else if (medianVolume > 0) {
      const ratio = volume.set_count / medianVolume;

      if (isFocused) {
        // Focused muscles: higher bar to encourage more volume
        if (ratio >= 2.0) {
          barColor = "bg-orange-500";
          statusBadge = "Overtrained";
          badgeColor = "bg-orange-100 text-orange-700";
        } else if (ratio >= 0.33) {
          barColor = "bg-green-600";
          statusBadge = "Optimal";
          badgeColor = "bg-green-100 text-green-700";
        } else {
          barColor = "bg-red-600";
          statusBadge = "Undertrained";
          badgeColor = "bg-red-100 text-red-700";
        }
      } else if (isMajorMuscle(volume.muscle_group)) {
        // Major muscles
        if (ratio >= 1.5) {
          barColor = "bg-orange-500";
          statusBadge = "Overtrained";
          badgeColor = "bg-orange-100 text-orange-700";
        } else if (ratio >= 0.5) {
          barColor = "bg-green-600";
          statusBadge = "Optimal";
          badgeColor = "bg-green-100 text-green-700";
        } else {
          barColor = "bg-red-600";
          statusBadge = "Undertrained";
          badgeColor = "bg-red-100 text-red-700";
        }
      } else {
        // Isolation muscles (not focused)
        if (ratio >= 1.0) {
          barColor = "bg-orange-500";
          statusBadge = "Overtrained";
          badgeColor = "bg-orange-100 text-orange-700";
        } else if (ratio >= 0.25) {
          barColor = "bg-green-600";
          statusBadge = "Optimal";
          badgeColor = "bg-green-100 text-green-700";
        } else {
          barColor = "bg-red-600";
          statusBadge = "Undertrained";
          badgeColor = "bg-red-100 text-red-700";
        }
      }
    }

    return { barColor, statusBadge, badgeColor };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-stone-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
        Muscle Volume (3 weeks)
      </h1>
      <p className="text-sm sm:text-base text-stone-600 mb-6 sm:mb-8">
        Track your set volume and tonnage per muscle group.
      </p>

      {/* Imbalances Section */}
      {imbalances.length > 0 && (
        <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-red-900 mb-4">
            ⚠️ Underworked Muscle Groups
          </h2>
          <p className="text-sm sm:text-base text-red-800 mb-4">
            These muscle groups have less than 50% of the median volume:
          </p>
          <div className="flex flex-wrap gap-2">
            {imbalances.map((muscle) => (
              <span
                key={muscle}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Volume Table */}
      {volumes.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8">
          <p className="text-sm sm:text-base text-stone-500">
            No workouts found in the past 3 weeks. Import a CSV to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          {/* Major Muscle Groups */}
          <div className="space-y-3 sm:space-y-4">
            {volumes
              .filter((v) => isMajorMuscle(v.muscle_group))
              .map((volume) => {
              const percentage = maxVolume > 0 ? (volume.set_count / maxVolume) * 100 : 0;
              const isFocused = focusMuscles.includes(volume.muscle_group);
              const { barColor, statusBadge, badgeColor } = getVolumeStatus(volume, isFocused);

              return (
                <div key={volume.muscle_group} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-stone-900 text-sm sm:text-base">
                        {volume.muscle_group}
                      </span>
                      {isFocused && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                          🎯 Focus
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                      <span className={`font-medium px-2 py-1 rounded whitespace-nowrap ${badgeColor}`}>
                        {statusBadge}
                      </span>
                      <div className="text-stone-600 sm:text-right flex gap-2">
                        <span className="font-semibold text-stone-900 whitespace-nowrap">
                          {volume.set_count} sets
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="whitespace-nowrap">{volume.tonnage.toFixed(0)} lbs</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-stone-100 rounded-full h-8 overflow-hidden">
                    <div
                      className={`${barColor} h-full flex items-center px-3 transition-all`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-white text-xs font-medium whitespace-nowrap">
                          {volume.set_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minor Muscle Groups */}
          {volumes.some((v) => !isMajorMuscle(v.muscle_group)) && (
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-stone-200">
              <button
                onClick={() => setShowMinor(!showMinor)}
                className="flex items-center gap-2 font-semibold text-stone-900 text-sm sm:text-base mb-4 hover:text-stone-700"
              >
                <span>{showMinor ? "▼" : "▶"}</span>
                Isolation Muscles ({volumes.filter((v) => !isMajorMuscle(v.muscle_group)).length})
              </button>

              {showMinor && (
                <div className="space-y-3 sm:space-y-4">
                  {volumes
                    .filter((v) => !isMajorMuscle(v.muscle_group))
                    .map((volume) => {
                      const percentage =
                        maxVolume > 0 ? (volume.set_count / maxVolume) * 100 : 0;
                      const isFocused = focusMuscles.includes(volume.muscle_group);
                      const { barColor, statusBadge, badgeColor } = getVolumeStatus(volume, isFocused);

                      return (
                        <div
                          key={volume.muscle_group}
                          className="flex flex-col gap-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-stone-900 text-sm sm:text-base">
                                {volume.muscle_group}
                              </span>
                              {isFocused && (
                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                                  🎯 Focus
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
                              <span
                                className={`font-medium px-2 py-1 rounded whitespace-nowrap ${badgeColor}`}
                              >
                                {statusBadge}
                              </span>
                              <div className="text-stone-600 sm:text-right flex gap-2">
                                <span className="font-semibold text-stone-900 whitespace-nowrap">
                                  {volume.set_count} sets
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="whitespace-nowrap">{volume.tonnage.toFixed(0)} lbs</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-stone-100 rounded-full h-8 overflow-hidden">
                            <div
                              className={`${barColor} h-full flex items-center px-3 transition-all`}
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            >
                              {percentage > 15 && (
                                <span className="text-white text-xs font-medium whitespace-nowrap">
                                  {volume.set_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-6 border-t border-stone-200">
            <p className="text-xs sm:text-sm font-medium text-stone-900 mb-3">Volume Status</p>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-medium text-stone-900 mb-2 text-xs sm:text-sm">Major Muscles:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 ml-0 sm:ml-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-600"></div>
                    <span className="text-stone-600">&lt; 50% median</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600"></div>
                    <span className="text-stone-600">50-150% median</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span className="text-stone-600">&gt; 150% median</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium text-stone-900 mb-2 text-xs sm:text-sm">Isolation Muscles:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 ml-0 sm:ml-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-600"></div>
                    <span className="text-stone-600">&lt; 25% median</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600"></div>
                    <span className="text-stone-600">25-100% median</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span className="text-stone-600">&gt; 100% median</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
