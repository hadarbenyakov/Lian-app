export default function WelcomeScreen({ onStart }) {
  return (
    <div className="bg-white h-screen w-full max-w-[393px] mx-auto flex flex-col items-center justify-center px-8 select-none">
      <div className="flex flex-col items-center -mt-[30px]">
        {/* Greeting */}
        <h1 className="text-[26px] font-bold text-black text-center leading-[1.4]">
          היי ליאן,
        </h1>
        <p className="text-[26px] font-light text-black text-center leading-[1.4] mt-[4px]">
          התרגול היומי שלך מחכה לך
        </p>

        {/* Decorative rings — the colored arcs animate "filling up" */}
        <WelcomeRings className="w-[135px] h-[135px] mt-[42px]" />

        {/* CTA button */}
        <button
          onClick={onStart}
          className="mt-[44px] bg-black text-white text-[16px] font-medium rounded-[29px] px-[70px] py-[12px]"
        >
          קדימה, להמשיך
        </button>
      </div>
    </div>
  );
}

// Concentric center shared by every ring, so they stay perfectly aligned.
const CX = 71.7;
const CY = 70;
const R_INNER = 41.6;
const R_MIDDLE = 53.3;
const R_OUTER = 67;

function WelcomeRings({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 143 142.106"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Static track rings (full circles behind the filling ones) */}
      <circle cx={CX} cy={CY} r={R_INNER} stroke="#E0E0E0" strokeWidth="8" />
      <circle cx={CX} cy={CY} r={R_MIDDLE} stroke="#F9FFD7" strokeWidth="8" />
      <circle cx={CX} cy={CY} r={R_OUTER} stroke="#D4D4D4" strokeWidth="8" />

      {/* Animated "filling" rings — each draws all the way around the circle and
          stops full. rotate(-90) makes them start filling from the top. */}
      <circle
        className="ring-arc"
        style={{ animationDelay: "0.3s" }}
        pathLength="100"
        transform={`rotate(-90 ${CX} ${CY})`}
        cx={CX}
        cy={CY}
        r={R_INNER}
        stroke="#C3C3C3"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle
        className="ring-arc"
        style={{ animationDelay: "0.15s" }}
        pathLength="100"
        transform={`rotate(-90 ${CX} ${CY})`}
        cx={CX}
        cy={CY}
        r={R_MIDDLE}
        stroke="#E6F784"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle
        className="ring-arc"
        style={{ animationDelay: "0s" }}
        pathLength="100"
        transform={`rotate(-90 ${CX} ${CY})`}
        cx={CX}
        cy={CY}
        r={R_OUTER}
        stroke="black"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}
