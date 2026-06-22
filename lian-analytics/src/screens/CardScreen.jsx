import { useState, useRef, useLayoutEffect } from "react";
import CompletionScreen from "./CompletionScreen";

const TAP_THRESHOLD = 16; // px — movement below this counts as a tap (flip) not a swipe
const PROGRESS_FILL = "#E6F784";
const PROGRESS_TRACK = "#F5F5F5";

export default function CardScreen({ cards = [], onClose }) {
  const total = cards.length;
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(0);
  const [history, setHistory] = useState([]);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  // The 3D flip only animates on a deliberate tap. When moving to the next card we
  // reset to the front instantly (no rotation), so the next card just "arrives".
  const [flipAnimated, setFlipAnimated] = useState(false);

  const touchStartX = useRef(null);
  const mouseStartX = useRef(null);
  // Mobile browsers fire emulated mouse events right after touch events. We record
  // the last touch time and ignore mouse events that follow, so a tap doesn't get
  // handled twice (which would flip the card and instantly flip it back).
  const lastTouchTime = useRef(0);

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
      setFlipAnimated(false);
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
      setFlipAnimated(false);
      if (next >= total) {
        onClose();
      } else {
        setCurrent(next);
      }
    }, 300);
  }

  function resetLast() {
    if (animating || current <= 0 || history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrent((c) => c - 1);
    setFlipped(false);
    setFlipAnimated(false);
    if (lastAction === "right") setDone((d) => d - 1);
  }

  function toggleFlip() {
    if (animating) return;
    setFlipAnimated(true);
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
    lastTouchTime.current = Date.now();
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchMove(e) {
    if (touchStartX.current === null) return;
    setSwipeOffset(e.touches[0].clientX - touchStartX.current);
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    lastTouchTime.current = Date.now();
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    endGesture(delta);
  }

  function onMouseDown(e) {
    // Ignore the emulated mouse event that follows a touch.
    if (animating || Date.now() - lastTouchTime.current < 700) return;
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

  const currentCard = cards[current] ?? null;

  // Split "name — reps" — name as the title, reps shown below it.
  const taskText = currentCard?.task ?? "";
  const dashIdx = taskText.indexOf("—");
  const taskName = dashIdx === -1 ? taskText.trim() : taskText.slice(0, dashIdx).trim();
  const taskReps = dashIdx === -1 ? "" : taskText.slice(dashIdx + 1).trim();

  const cardTransform = `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.025}deg)`;
  const cardOpacity = Math.max(0, 1 - Math.abs(swipeOffset) / 400);

  // Top progress bar spans every exercise together.
  const pct = total > 0 ? (done / total) * 100 : 0;

  if (completed) {
    return <CompletionScreen onHome={onClose} />;
  }

  return (
    <div className="relative bg-[#F9F9F9] h-screen w-full max-w-[393px] mx-auto overflow-hidden flex flex-col pt-[74px] px-4 pb-[40px] select-none">
      {/* Top row: [X right] [category title center] [spacer left] */}
      <div className="flex items-center justify-between h-[33px]">
        <button
          onClick={onClose}
          aria-label="סגירה"
          className="w-[33px] h-[33px] flex items-center justify-center text-black shrink-0"
        >
          <CloseIcon />
        </button>
        <span className="text-[18px] text-black">{currentCard?.category ?? ""}</span>
        <div className="w-[33px] shrink-0" />
      </div>

      {/* Progress bar — across all exercises together */}
      <div
        className="relative w-full h-[8px] mt-[21px] rounded-full"
        style={{ backgroundColor: PROGRESS_TRACK }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, minWidth: pct > 0 ? 19 : 0, backgroundColor: PROGRESS_FILL }}
        />
      </div>

      {/* Card */}
      <div className="relative mt-[24px] flex-1 min-h-0">
        {/* Main swipeable card */}
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{
            transform: cardTransform,
            opacity: cardOpacity,
            transition: animating
              ? "transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease"
              : "none",
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
              transition: flipAnimated ? "transform 0.5s cubic-bezier(0.4,0.2,0.2,1)" : "none",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT — empty image area on top, green title band at the bottom (per Figma) */}
            <div
              className="absolute inset-0 rounded-[34px] bg-white flex flex-col overflow-hidden"
              style={{
                boxShadow: "0 0 6.3px rgba(0,0,0,0.12)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Empty image area — left blank on purpose for an illustration/video later */}
              <div className="flex-1" data-animation-slot="image" />

              {/* Green title band */}
              <div
                className="bg-[#E6F784] flex flex-col items-center justify-center px-6 text-center pointer-events-none"
                style={{ height: "38%" }}
              >
                <h2 className="font-extrabold text-black text-[32px] leading-[38px] [word-break:break-word]">
                  {taskName}
                </h2>

                {taskReps && (
                  <p className="mt-[8px] font-medium text-black/70 text-[16px] leading-[22px]">
                    {taskReps}
                  </p>
                )}
              </div>
            </div>

            {/* BACK — scientific "did you know?" + article link (per Figma) */}
            <div
              className="absolute inset-0 rounded-[34px] bg-white flex flex-col px-7 pt-[30px] pb-[26px]"
              style={{
                boxShadow: "0 0 6.3px rgba(0,0,0,0.12)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {/* Header: lightbulb to the right of the title, flush to the right edge (RTL) */}
              <div className="flex items-center justify-start gap-[10px] shrink-0">
                <BulbIcon />
                <h3 className="text-[24px] font-extrabold text-black leading-none">הידעת?</h3>
              </div>

              {/* Scientific text — auto-shrinks so it always fits, no scrolling */}
              <FitText text={currentCard?.science ?? currentCard?.reason ?? ""} />

              {/* Bottom row: article button on the right (flip control sits on the card) */}
              <div className="flex items-center justify-start mt-[18px] shrink-0 h-[50px]">
                <a
                  href={
                    currentCard?.article ??
                    `https://www.google.com/search?q=${encodeURIComponent(taskName)}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#E6F784] text-black text-[16px] font-bold rounded-[25px] px-[34px] h-[50px] flex items-center justify-center"
                >
                  מעבר למאמר
                </a>
              </div>
            </div>
          </div>

          {/* Single flip control on the card (bottom-left). It sits outside the 3D
              flip container, so it never duplicates or mirrors on mobile. */}
          <div className="absolute bottom-[14px] left-[14px] z-20">
            <IconButton onActivate={toggleFlip} ariaLabel="היפוך הכרטיס">
              <RefreshIcon />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Hint row: [hint center] [undo left] */}
      <div className="flex items-center mt-[22px]">
        <div className="w-[24px] shrink-0" />
        <p className="flex-1 text-[12px] text-[#606060] text-center leading-[1.4] px-2">
          תחליקי את הכרטיסייה ימינה אם ביצעת את המשימה
        </p>
        <button
          onClick={resetLast}
          disabled={current <= 0 || history.length === 0}
          aria-label="ביטול"
          className="w-[24px] h-[24px] flex items-center justify-center disabled:opacity-30 shrink-0"
        >
          <UndoIcon />
        </button>
      </div>
    </div>
  );
}

/* Scientific text that shrinks its font-size until it fits the available height,
   so the user never has to scroll. Re-fits whenever the text changes. */
function FitText({ text }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = 18;
    el.style.fontSize = size + "px";
    while (el.scrollHeight > el.clientHeight && size > 10) {
      size -= 0.5;
      el.style.fontSize = size + "px";
    }
  }, [text]);

  return (
    <div
      ref={ref}
      dir="rtl"
      className="flex-1 min-h-0 overflow-hidden mt-[18px] text-right text-[#3A3A3A]"
      style={{ lineHeight: 1.6 }}
    >
      {text}
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

function BulbIcon() {
  return (
    <svg width="22" height="27" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-4 12.74c.62.46 1 1.18 1 1.96V18h6v-1.3c0-.78.38-1.5 1-1.96A7 7 0 0 0 12 2Z" />
      <rect x="9" y="19" width="6" height="1.7" rx="0.85" />
      <rect x="10" y="21.4" width="4" height="1.7" rx="0.85" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="24" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function UndoIcon() {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3L2 8l5 5" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M2 8h11a7 7 0 0 1 0 14H9"
        stroke="black"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
