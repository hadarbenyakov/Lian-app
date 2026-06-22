import ProgressBar from "./ProgressBar";

export default function ExerciseCard({
  badge,
  badgeColor = "#e3f500",
  progress = 0,
  total = 11,
  subtitle,
  buttonLabel,
  onPress,
}) {
  const progressColor = badgeColor;

  return (
    <div
      className="bg-white rounded-[25px] p-5 flex flex-col gap-8"
      style={{ boxShadow: "0 0 6.3px rgba(0,0,0,0.12)" }}
    >
      <div className="flex flex-col gap-5 w-full">
        <div className="flex flex-col gap-[5px] w-full">
          <div className="flex items-center justify-between w-full">
            <span
              className="text-[14px] text-black px-[14px] py-1 rounded-[30px]"
              style={{ backgroundColor: badgeColor }}
            >
              {badge}
            </span>
            <span className="text-[20px] font-medium text-black">
              {progress}/{total}
            </span>
          </div>
          {subtitle && (
            <p className="text-[14px] text-[#575757] text-right w-full">{subtitle}</p>
          )}
        </div>
        <ProgressBar progress={progress} total={total} color={progressColor} />
      </div>
      <button
        onClick={onPress}
        className="bg-black text-white text-[16px] font-medium rounded-[29px] px-[28px] py-[10px] self-end"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
