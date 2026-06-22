import ExerciseCard from "../components/ExerciseCard";
import Avatar from "../components/Avatar";

export default function FocusScreen({ onModeChange, onStartExercise }) {
  return (
    <div className="bg-[#F9F9F9] min-h-screen flex flex-col px-4 pt-[74px] pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[26px] font-light text-black">07/06</span>
        <Avatar size={46} />
      </div>

      {/* Mode toggle */}
      <div className="flex mt-4">
        <ModeToggle active="focus" onModeChange={onModeChange} />
      </div>

      {/* Subtitle */}
      <p className="text-[16px] font-light text-black text-right mt-1 mb-4">
        היום יש 2 אירועים שמצריכים הכנה ותרגול
      </p>

      {/* Event cards */}
      <div className="flex flex-col gap-4">
        <ExerciseCard
          badge="נסיעה לעפולה"
          badgeColor="#E3F500"
          progress={0}
          total={5}
          subtitle="תרגילי יציבה + הליכה"
          buttonLabel="המשיכי"
          onPress={() => onStartExercise({ badge: "נסיעה לעפולה", badgeColor: "#E3F500", progress: 0, total: 5 })}
        />
        <ExerciseCard
          badge="קוקטייל עם יעל"
          badgeColor="#E3F500"
          progress={0}
          total={6}
          subtitle="תרגילי יציבה + כתף"
          buttonLabel="המשיכי"
          onPress={() => onStartExercise({ badge: "קוקטייל עם יעל", badgeColor: "#E3F500", progress: 0, total: 6 })}
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
