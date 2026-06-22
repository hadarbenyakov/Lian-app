import { useState } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";
import RoutineScreen from "./screens/RoutineScreen";
import FocusScreen from "./screens/FocusScreen";
import CardScreen from "./screens/CardScreen";

// By default nothing is started — every exercise begins at zero.
const INITIAL_PROGRESS = {};

export default function App() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState("routine"); // 'routine' | 'focus'
  const [cardContext, setCardContext] = useState(null); // null = home, object = card screen
  const [progressMap, setProgressMap] = useState(INITIAL_PROGRESS);
  const [completedBadge, setCompletedBadge] = useState(null); // drives the home fly-away animation

  function handleModeChange(newMode) {
    if (newMode !== mode) setProgressMap(INITIAL_PROGRESS);
    setMode(newMode);
    setCardContext(null);
  }

  function handleStartExercise(ctx) {
    setCardContext({ ...ctx, progress: progressMap[ctx.badge] ?? ctx.progress });
  }

  function handleCloseCards(newProgress) {
    if (newProgress !== undefined && cardContext?.badge) {
      // Persist progress (including partial — when leaving mid-exercise) back to the home screen.
      setProgressMap((prev) => ({ ...prev, [cardContext.badge]: newProgress }));
      // Fully completed → flag it so the home screen plays the fly-away animation.
      if (cardContext.total && newProgress >= cardContext.total) {
        setCompletedBadge(cardContext.badge);
      }
    }
    setCardContext(null);
  }

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  if (cardContext) {
    return <CardScreen context={cardContext} onClose={handleCloseCards} />;
  }

  if (mode === "focus") {
    return (
      <FocusScreen
        onModeChange={handleModeChange}
        onStartExercise={handleStartExercise}
      />
    );
  }

  return (
    <RoutineScreen
      onModeChange={handleModeChange}
      onStartExercise={handleStartExercise}
      progressMap={progressMap}
      completedBadge={completedBadge}
      onCompletionAnimationDone={() => setCompletedBadge(null)}
      onReset={() => {
        setCompletedBadge(null);
        setProgressMap(INITIAL_PROGRESS);
      }}
    />
  );
}
