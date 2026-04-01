import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import BreathingScreen from './components/BreathingScreen';
import { getBreathingPattern, getPresetMeta } from './utils/getBreathingPattern';

export default function App() {
  // session: null | { pattern, duration, label, description }
  const [session, setSession] = useState(null);

  const handleStart = (stateInput, duration) => {
    const { label, description } = getPresetMeta(stateInput);
    setSession({
      pattern: getBreathingPattern(stateInput),
      duration,
      label,
      description,
    });
  };

  const handleBack = () => setSession(null);

  return (
    <div style={appStyle}>
      {session ? (
        <BreathingScreen
          pattern={session.pattern}
          duration={session.duration}
          label={session.label}
          description={session.description}
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
