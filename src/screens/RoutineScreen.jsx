import ExerciseCard from "../components/ExerciseCard";
import Avatar from "../components/Avatar";

export default function RoutineScreen({ onModeChange, onStartExercise, progressMap = {} }) {
  const p = (badge, fallback = 0) => progressMap[badge] ?? fallback;

  return (
    <div className="bg-[#F9F9F9] min-h-screen flex flex-col px-4 pt-[74px] pb-8 gap-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-0">
        <span className="text-[26px] font-light text-black">07/06</span>
        <Avatar size={46} />
      </div>

      {/* Mode toggle */}
      <div className="flex mt-4">
        <ModeToggle active="routine" onModeChange={onModeChange} />
      </div>

      {/* Section: Continuing */}
      <p className="text-[16px] font-light text-black text-right mt-3 mb-3">ממשיכים</p>
      <ExerciseCard
        badge="מוטוריקה עדינה"
        badgeColor="#E3F500"
        progress={p("מוטוריקה עדינה", 1)}
        total={11}
        buttonLabel="המשיכי"
        onPress={() => onStartExercise({ badge: "מוטוריקה עדינה", badgeColor: "#E3F500", total: 11 })}
      />

      {/* Section: Waiting */}
      <p className="text-[16px] font-light text-black text-right mt-6 mb-3">תרגילים שמחכים לך </p>
      <div className="flex flex-col gap-4">
        <ExerciseCard
          badge="תרגילי גב"
          badgeColor="#E3F500"
          progress={p("תרגילי גב")}
          total={11}
          buttonLabel="התחילי"
          onPress={() => onStartExercise({ badge: "תרגילי גב", badgeColor: "#E3F500", total: 11 })}
        />
        <ExerciseCard
          badge="רגליים"
          badgeColor="#E3F500"
          progress={p("רגליים")}
          total={11}
          buttonLabel="התחילי"
          onPress={() => onStartExercise({ badge: "רגליים", badgeColor: "#E3F500", total: 11 })}
        />
      </div>
    </div>
  );
}

function ModeToggle({ active, onModeChange }) {
  return (
    <div className="flex gap-[3px] items-center p-[2px] rounded-[52px]" style={{ backgroundColor: "#f5f5f5" }}>
      <button
        onClick={() => onModeChange("routine")}
        className={`px-[10px] py-1 rounded-[30px] text-[16px] transition-colors ${
          active === "routine" ? "bg-black text-white" : "bg-transparent text-black"
        }`}
      >
        שגרה
      </button>
      <button
        onClick={() => onModeChange("focus")}
        className={`px-[10px] py-1 rounded-[30px] text-[16px] transition-colors ${
          active === "focus" ? "bg-black text-white" : "bg-transparent text-black"
        }`}
      >
        פוקוס
      </button>
    </div>
  );
}
