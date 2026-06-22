import { useEffect, useState } from "react";

export default function CompletionScreen({ badge, badgeColor, onHome }) {
  const [step, setStep] = useState(0);
  // step 0 = nothing, 1 = circle pops, 2 = check draws, 3 = text fades, 4 = button appears

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 80),
      setTimeout(() => setStep(2), 420),
      setTimeout(() => setStep(3), 780),
      setTimeout(() => setStep(4), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-[#F9F9F9] min-h-screen flex flex-col items-center justify-center px-8 gap-8 select-none">

      {/* Animated circle + check */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: badgeColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: step >= 1 ? "scale(1)" : "scale(0)",
          transition: "transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          style={{
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? "scale(1)" : "scale(0.4)",
            transition: "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <path
            d="M12 28L23 39L44 17"
            stroke="black"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      <div
        className="flex flex-col items-center gap-3 text-center"
        style={{
          opacity: step >= 3 ? 1 : 0,
          transform: step >= 3 ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <p className="text-[26px] font-medium text-black leading-snug">
          סיימת את התרגילים של
        </p>
        <span
          className="text-[20px] font-medium px-[16px] py-[6px] rounded-[30px]"
          style={{ backgroundColor: badgeColor }}
        >
          {badge}
        </span>
      </div>

      {/* CTA button */}
      <button
        onClick={onHome}
        className="bg-black text-white text-[16px] font-medium rounded-[29px] px-8 py-[14px] w-full max-w-[280px]"
        style={{
          opacity: step >= 4 ? 1 : 0,
          transform: step >= 4 ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        חזרי למסך הבית להמשך תרגול
      </button>
    </div>
  );
}
