import { useState, useRef } from "react";
import ProgressBar from "../components/ProgressBar";
import CompletionScreen from "./CompletionScreen";
import { exercises } from "../data/exercises";

const TAP_THRESHOLD = 8; // px — movement below this counts as a tap (flip) not a swipe

export default function CardScreen({ context, onClose }) {
  const { badge, badgeColor = "#e3f500", total = 11 } = context;
  const startProgress = context.progress ?? 0;
  const [current, setCurrent] = useState(startProgress);
  const [done, setDone] = useState(startProgress);
  const [history, setHistory] = useState([]);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const touchStartX = useRef(null);
  const mouseStartX = useRef(null);
  const progressBarColor = badgeColor;

  function swipeRight() {
    if (animating) return;
    setAnimating(true);
    setSwipeOffset(500);
    setTimeout(() => {
      const next = current + 1;
      setDone((d) => d + 1);
      setHistory((h) => [...h, "right"]);
      setSwipeOffset(0);
      setAnimating(false);
      setFlipped(false);
      if (next >= total) {
        setCompleted(true);
      } else {
        setCurrent(next);
      }
    }, 300);
  }

  function swipeLeft() {
    if (animating) return;
    setAnimating(true);
    setSwipeOffset(-500);
    setTimeout(() => {
      const next = current + 1;
      setHistory((h) => [...h, "left"]);
      setSwipeOffset(0);
      setAnimating(false);
      setFlipped(false);
      if (next >= total) {
        onClose(done);
      } else {
        setCurrent(next);
      }
    }, 300);
  }

  function resetLast() {
    if (animating || current <= startProgress || history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrent((c) => c - 1);
    setFlipped(false);
    if (lastAction === "right") setDone((d) => d - 1);
  }

  function toggleFlip() {
    if (animating) return;
    setFlipped((f) => !f);
  }

  function endGesture(delta) {
    if (delta > 60) swipeRight();
    else if (delta < -60) swipeLeft();
    else if (Math.abs(delta) < TAP_THRESHOLD) {
      setSwipeOffset(0);
      toggleFlip();
    } else {
      setSwipeOffset(0);
    }
  }

  // touch
  function onTouchStart(e) {
    if (animating) return;
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchMove(e) {
    if (touchStartX.current === null) return;
    setSwipeOffset(e.touches[0].clientX - touchStartX.current);
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    endGesture(delta);
  }

  function onMouseDown(e) {
    if (animating) return;
    mouseStartX.current = e.clientX;
  }
  function onMouseMove(e) {
    if (mouseStartX.current === null) return;
    setSwipeOffset(e.clientX - mouseStartX.current);
  }
  function onMouseUp(e) {
    if (mouseStartX.current === null) return;
    const delta = e.clientX - mouseStartX.current;
    mouseStartX.current = null;
    endGesture(delta);
  }
  function onMouseLeave() {
    if (mouseStartX.current !== null) {
      mouseStartX.current = null;
      setSwipeOffset(0);
    }
  }

  const cardList = exercises[badge] ?? [];
  const currentCard = cardList[current] ?? null;

  // Split "name — reps" into two lines (some tasks have no reps part)
  const taskText = currentCard?.task ?? "";
  const dashIdx = taskText.indexOf("—");
  const taskName = dashIdx === -1 ? taskText.trim() : taskText.slice(0, dashIdx).trim();
  const taskReps = dashIdx === -1 ? "" : taskText.slice(dashIdx + 1).trim();

  const cardTransform = `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.025}deg)`;
  const cardOpacity = Math.max(0, 1 - Math.abs(swipeOffset) / 400);

  if (completed) {
    return <CompletionScreen badge={badge} badgeColor={badgeColor} onHome={() => onClose(total)} />;
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen flex flex-col px-4 pt-[74px] pb-8 select-none">
      {/* Top row: [X right] [badge center] [spacer left] */}
      <div className="flex items-center justify-between mb-0">
        <button
          onClick={() => onClose(done)}
          className="w-[33px] h-[33px] rounded-full border border-[#d0d0d0] flex items-center justify-center text-black text-[14px] shrink-0"
        >
          ✕
        </button>
        <span
          className="text-[18px] text-black px-[12px] py-1 rounded-[40px]"
          style={{ backgroundColor: badgeColor }}
        >
          {badge}
        </span>
        <div className="w-[33px] shrink-0" />
      </div>

      {/* Progress counter */}
      <p className="text-[22px] text-black text-center mt-4 mb-3">
        {done}/{total}
      </p>

      {/* Progress bar */}
      <div className="mb-5">
        <ProgressBar progress={done} total={total} color={progressBarColor} />
      </div>

      {/* Stacked cards */}
      <div className="relative flex-1" style={{ minHeight: 420 }}>
        {[
          { top: 0 },
          { top: 13 },
          { top: 28 },
          { top: 41 },
        ].map((layer, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 rounded-[16px]"
            style={{
              top: layer.top,
              bottom: 0,
              background: "linear-gradient(180deg, #ffffff 0%, #f1f1f1 100%)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05), inset 0 7px 9px -6px rgba(0,0,0,0.10)",
            }}
          />
        ))}

        {/* Main swipeable card */}
        <div
          className="absolute left-0 right-0 cursor-grab active:cursor-grabbing"
          style={{
            top: 58,
            bottom: 0,
            transform: cardTransform,
            opacity: cardOpacity,
            transition: animating ? "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease" : "none",
            touchAction: "pan-y",
            perspective: 1200,
            WebkitPerspective: 1200,
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {/* Flip container */}
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transition: "transform 0.5s cubic-bezier(0.4,0.2,0.2,1)",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT — the exercise */}
            <div
              className="absolute inset-0 rounded-[16px] overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05), inset 0 7px 9px -6px rgba(0,0,0,0.10)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center px-6 pt-6 gap-2 text-center pointer-events-none">
                <p className="text-[22px] font-medium text-black leading-snug">
                  {taskName}
                </p>
                {taskReps && (
                  <p className="text-[16px] font-light text-[#555] leading-snug">
                    {taskReps}
                  </p>
                )}
              </div>

              <div className="flex justify-center pb-6">
                <IconButton onActivate={toggleFlip} ariaLabel="הצגת הסבר">
                  <FlipIcon />
                </IconButton>
              </div>
            </div>

            {/* BACK — the reason */}
            <div
              className="absolute inset-0 rounded-[16px] overflow-hidden flex flex-col"
              style={{
                backgroundColor: "#1c1c1c",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05), inset 0 7px 9px -6px rgba(0,0,0,0.25)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex-1 flex items-center justify-center px-6 pt-6 text-center pointer-events-none">
                <p className="text-[22px] font-medium text-white leading-snug">
                  {currentCard?.reason ?? ""}
                </p>
              </div>

              <div className="flex justify-center pb-6">
                <IconButton onActivate={toggleFlip} ariaLabel="חזרה למשימה" light>
                  <FlipIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-[12px] text-black text-center flex-1 mx-4 leading-[1.4]">
          תחליקי את הכרטיסייה ימינה אם ביצעת את המשימה
        </p>
        <button
          onClick={resetLast}
          disabled={current <= startProgress || history.length === 0}
          className="w-10 h-10 flex items-center justify-center disabled:opacity-30"
        >
          <ResetCardIcon />
        </button>
      </div>
    </div>
  );
}

/* A small round icon button that doesn't trigger the card's swipe/flip gesture. */
function IconButton({ children, onActivate, ariaLabel, light = false }) {
  const stop = (e) => e.stopPropagation();
  return (
    <button
      aria-label={ariaLabel}
      onMouseDown={stop}
      onTouchStart={stop}
      onClick={(e) => {
        e.stopPropagation();
        onActivate?.();
      }}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
        light ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

function FlipIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 9a8 8 0 0 1 13.5-3.5L20 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 3v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M20 15a8 8 0 0 1-13.5 3.5L4 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 21v-5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResetCardIcon() {
  return (
    <svg width="23" height="17" viewBox="0 0 23 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.102 10.471C22.1001 12.0685 21.4646 13.6001 20.3349 14.7296C19.2052 15.8591 17.6735 16.4944 16.076 16.496H12.739C12.4738 16.496 12.2194 16.3906 12.0319 16.2031C11.8443 16.0156 11.739 15.7612 11.739 15.496C11.739 15.2308 11.8443 14.9764 12.0319 14.7889C12.2194 14.6013 12.4738 14.496 12.739 14.496H16.076C16.6099 14.5044 17.1403 14.4065 17.636 14.208C18.1318 14.0094 18.5831 13.7143 18.9637 13.3396C19.3443 12.965 19.6465 12.5184 19.8529 12.0258C20.0592 11.5332 20.1654 11.0045 20.1654 10.4705C20.1654 9.93644 20.0592 9.40773 19.8529 8.91515C19.6465 8.42257 19.3443 7.97596 18.9637 7.60132C18.5831 7.22669 18.1318 6.93151 17.636 6.73299C17.1403 6.53447 16.6099 6.43657 16.076 6.44498H3.74097L6.92997 9.12898C7.03136 9.21326 7.11509 9.31676 7.17633 9.43352C7.23757 9.55028 7.27512 9.678 7.28681 9.80933C7.2985 9.94066 7.2841 10.073 7.24445 10.1987C7.2048 10.3245 7.14067 10.4411 7.05576 10.542C6.97085 10.6429 6.86683 10.726 6.74969 10.7865C6.63255 10.847 6.5046 10.8837 6.3732 10.8946C6.2418 10.9055 6.10955 10.8902 5.98405 10.8498C5.85856 10.8094 5.7423 10.7445 5.64197 10.659L0.355969 6.20998C0.244471 6.11611 0.154839 5.99901 0.0933495 5.86686C0.0318601 5.73472 0 5.59073 0 5.44498C0 5.29923 0.0318601 5.15524 0.0933495 5.0231C0.154839 4.89095 0.244471 4.77385 0.355969 4.67998L5.64197 0.230981C5.84509 0.0621403 6.10677 -0.0194796 6.36986 0.00394181C6.63296 0.0273632 6.8761 0.153923 7.04621 0.35599C7.21631 0.558057 7.29957 0.819217 7.27779 1.08245C7.25601 1.34569 7.13097 1.58962 6.92997 1.76098L3.74197 4.44598H16.076C17.6734 4.44783 19.2049 5.08317 20.3346 6.21265C21.4643 7.34212 22.0999 8.87353 22.102 10.471Z" fill="black"/>
    </svg>
  );
}
