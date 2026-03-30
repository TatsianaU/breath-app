import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import BreathingScreen from './components/BreathingScreen';
import { getBreathingPattern } from './utils/getBreathingPattern';

export default function App() {
  // session: null | { pattern, duration (seconds) }
  const [session, setSession] = useState(null);

  const handleStart = (stateInput, duration) => {
    setSession({ pattern: getBreathingPattern(stateInput), duration });
  };

  const handleBack = () => setSession(null);

  return (
    <div style={appStyle}>
      {session ? (
        <BreathingScreen
          pattern={session.pattern}
          duration={session.duration}
          onBack={handleBack}
        />
      ) : (
        <HomeScreen onStart={handleStart} />
      )}
    </div>
  );
}

const appStyle = {
  minHeight: '100dvh',
  width: '100%',
};
