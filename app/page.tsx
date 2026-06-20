import { getVolumeData } from "@/lib/volume";
import FocusSection from "@/components/FocusSection";

export default async function Home() {
  const { volumes, imbalances } = await getVolumeData();

  const totalSets = volumes.reduce((sum, v) => sum + v.set_count, 0);
  const topMuscles = volumes.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-2">Gym Planner</h1>
        <p className="text-base sm:text-lg text-stone-600">
          Track your workouts, monitor muscle volume, and get personalized
          recommendations.
        </p>
      </div>

      {/* Focus Section */}
      <FocusSection volumes={volumes} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          <p className="text-stone-600 text-xs sm:text-sm mb-2">Total Sets (3 weeks)</p>
          <p className="text-2xl sm:text-4xl font-bold text-stone-900">{totalSets}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          <p className="text-stone-600 text-xs sm:text-sm mb-2">Muscle Groups Trained</p>
          <p className="text-2xl sm:text-4xl font-bold text-stone-900">{volumes.length}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          <p className="text-stone-600 text-xs sm:text-sm mb-2">Imbalances Flagged</p>
          <p className="text-2xl sm:text-4xl font-bold text-red-600">{imbalances.length}</p>
        </div>
      </div>

      {/* Top Muscles */}
      {topMuscles.length > 0 && (
        <div className="mb-8 sm:mb-12 bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-stone-900 mb-4">
            Top Trained Muscles
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {topMuscles.map((volume) => {
              const trainedVolumes = volumes
                .filter((v) => v.set_count > 0)
                .map((v) => v.set_count)
                .sort((a, b) => a - b);

              const medianVolume =
                trainedVolumes.length > 0
                  ? trainedVolumes[Math.floor(trainedVolumes.length / 2)]
                  : 0;

              let barColor = "bg-red-600";
              let statusBadge = "Undertrained";
              let badgeColor = "bg-red-100 text-red-700";

              if (medianVolume > 0) {
                const ratio = volume.set_count / medianVolume;
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
              }

              // Note: Top Trained Muscles uses major muscle thresholds
              // (Focus thresholds only apply when explicitly set in Preferences)

              return (
                <div key={volume.muscle_group}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <span className="font-medium text-stone-900 text-sm sm:text-base">
                      {volume.muscle_group}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${badgeColor}`}>
                        {statusBadge}
                      </span>
                      <span className="text-xs sm:text-sm text-stone-600 whitespace-nowrap">
                        {volume.set_count} sets
                      </span>
                    </div>
                  </div>
                  <div className="bg-stone-100 rounded-full h-6 overflow-hidden">
                    <div
                      className={`${barColor} h-full`}
                      style={{ width: `${(volume.set_count / topMuscles[0].set_count) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Imbalances Alert */}
      {imbalances.length > 0 && (
        <div className="mb-8 sm:mb-12 bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-red-900 mb-2">
            ⚠️ Muscle Imbalances
          </h2>
          <p className="text-sm sm:text-base text-red-800 mb-4">
            These muscle groups need more volume:
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

      {/* Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-stone-900 mb-2">
            Import Workouts
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mb-4">
            Upload your Strong app CSV export to add more workouts.
          </p>
          <a href="/import" className="text-red-600 font-medium hover:text-red-700 text-sm sm:text-base">
            Go to Import →
          </a>
        </div>

        <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-xl font-semibold text-stone-900 mb-2">
            Get Recommendations
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mb-4">
            Pick a muscle group to see your best exercises for today.
          </p>
          <a
            href="/recommend"
            className="text-red-600 font-medium hover:text-red-700 text-sm sm:text-base"
          >
            Get Recommendations →
          </a>
        </div>
      </div>
    </div>
  );
}
