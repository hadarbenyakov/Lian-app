import { useState } from "react";
import WelcomeScreen from "./screens/WelcomeScreen";
import CardScreen from "./screens/CardScreen";
import { allExercises } from "./data/exercises";

export default function App() {
  // The whole app is just two steps: a start page, then the unified card deck
  // that runs through every exercise one after another.
  const [started, setStarted] = useState(false);

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  return <CardScreen cards={allExercises} onClose={() => setStarted(false)} />;
}
