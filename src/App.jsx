import { useState } from "react";
import RoutineScreen from "./screens/RoutineScreen";
import FocusScreen from "./screens/FocusScreen";
import CardScreen from "./screens/CardScreen";

const INITIAL_PROGRESS = {
  "מוטוריקה עדינה": 1,
  "תרגילי גב": 0,
  "רגליים": 0,
};

export default function App() {
  const [mode, setMode] = useState("routine"); // 'routine' | 'focus'
  const [cardContext, setCardContext] = useState(null); // null = home, object = card screen
  const [progressMap, setProgressMap] = useState(INITIAL_PROGRESS);

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
      setProgressMap((prev) => ({ ...prev, [cardContext.badge]: newProgress }));
    }
    setCardContext(null);
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
    />
  );
}
