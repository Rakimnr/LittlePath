// ================================================
// LittlePath – Progress Utilities (localStorage)
// No level selection – one shared experience.
// ================================================

const STORAGE_KEY = 'littlepath_progress';

const defaultProgress = {
  soundGarden: false,
  traceTrail: false,
  matchMeadow: false,
};

/**
 * Load progress from localStorage, or return defaults.
 */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    const parsed = JSON.parse(raw);
    // Strip any stale 'level' field from old versions
    const { level: _level, ...rest } = parsed;
    return { ...defaultProgress, ...rest };
  } catch {
    return { ...defaultProgress };
  }
}

/**
 * Save progress to localStorage.
 * @param {object} progress
 */
export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage may be unavailable; fail silently
  }
}

/**
 * Mark an activity as complete.
 * @param {'soundGarden' | 'traceTrail' | 'matchMeadow'} activity
 */
export function completeActivity(activity) {
  const progress = loadProgress();
  progress[activity] = true;
  saveProgress(progress);
}

/**
 * Reset all progress.
 */
export function resetProgress() {
  saveProgress({ ...defaultProgress });
}

/**
 * Check if all three activities are complete.
 * @param {object} progress
 * @returns {boolean}
 */
export function allComplete(progress) {
  return progress.soundGarden && progress.traceTrail && progress.matchMeadow;
}
