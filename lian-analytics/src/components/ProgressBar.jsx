export default function ProgressBar({ progress, total, color = "#e3f500" }) {
  const pct = total > 0 ? (progress / total) * 100 : 0;
  const showDot = pct === 0;

  return (
    <div className="relative w-full h-[11px] flex items-center">
      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "#e8e8e8" }} />
      {showDot ? (
        <div
          className="absolute w-[11px] h-[11px] rounded-full left-0"
          style={{ backgroundColor: color }}
        />
      ) : (
        <div
          className="absolute h-[11px] rounded-full left-0"
          style={{ width: `${pct}%`, backgroundColor: color, minWidth: 11 }}
        />
      )}
    </div>
  );
}
