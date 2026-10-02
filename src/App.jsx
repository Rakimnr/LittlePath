import React, { useState } from 'react';
import Welcome from './pages/Welcome';
import LearningMap from './pages/LearningMap';
import SoundGarden from './pages/SoundGarden';
import TraceTrail from './pages/TraceTrail';
import MatchMeadow from './pages/MatchMeadow';
import Celebration from './pages/Celebration';
import { learningData } from './data/learningData';
import { loadProgress, completeActivity, resetProgress } from './utils/progress';

// App screens
const SCREENS = {
  WELCOME: 'welcome',
  MAP: 'map',
  SOUND_GARDEN: 'soundGarden',
  TRACE_TRAIL: 'traceTrail',
  MATCH_MEADOW: 'matchMeadow',
  CELEBRATION: 'celebration',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.WELCOME);
  const [progress, setProgress] = useState(loadProgress);

  const refreshProgress = () => {
    setProgress(loadProgress());
  };

  // Welcome → Map
  const handleStart = () => {
    setScreen(SCREENS.MAP);
  };

  // Navigate from Map to an activity or celebration
  const handleNavigate = (destination) => {
    if (destination === 'celebration') {
      setScreen(SCREENS.CELEBRATION);
      return;
    }
    const screenMap = {
      soundGarden: SCREENS.SOUND_GARDEN,
      traceTrail: SCREENS.TRACE_TRAIL,
      matchMeadow: SCREENS.MATCH_MEADOW,
    };
    setScreen(screenMap[destination] || SCREENS.MAP);
  };

  // Complete an activity and return to map
  const handleCompleteActivity = (activity) => {
    completeActivity(activity);
    refreshProgress();
    setScreen(SCREENS.MAP);
  };

  // Home always goes to map (or welcome if somehow no progress)
  const handleGoHome = () => {
    setScreen(SCREENS.MAP);
  };

  // Play again resets everything
  const handlePlayAgain = () => {
    resetProgress();
    refreshProgress();
    setScreen(SCREENS.WELCOME);
  };

  return (
    <div className="app">
      {screen === SCREENS.WELCOME && (
        <Welcome onStart={handleStart} />
      )}

      {screen === SCREENS.MAP && (
        <LearningMap
          progress={progress}
          onNavigate={handleNavigate}
          onHome={() => setScreen(SCREENS.WELCOME)}
        />
      )}

      {screen === SCREENS.SOUND_GARDEN && (
        <SoundGarden
          data={learningData.soundGarden}
          onComplete={() => handleCompleteActivity('soundGarden')}
          onHome={handleGoHome}
        />
      )}

      {screen === SCREENS.TRACE_TRAIL && (
        <TraceTrail
          data={learningData.traceTrail}
          onComplete={() => handleCompleteActivity('traceTrail')}
          onHome={handleGoHome}
        />
      )}

      {screen === SCREENS.MATCH_MEADOW && (
        <MatchMeadow
          data={learningData.matchMeadow}
          onComplete={() => handleCompleteActivity('matchMeadow')}
          onHome={handleGoHome}
        />
      )}

      {screen === SCREENS.CELEBRATION && (
        <Celebration
          onPlayAgain={handlePlayAgain}
          onHome={() => setScreen(SCREENS.WELCOME)}
        />
      )}
    </div>
  );
}
