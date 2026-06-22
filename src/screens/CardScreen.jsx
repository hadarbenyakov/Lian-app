import { useState, useRef, useEffect } from "react";
import CompletionScreen from "./CompletionScreen";
import { exercises } from "../data/exercises";

const PROGRESS_FILL = "#E6F784";
const PROGRESS_TRACK = "#F5F5F5";

const MOTIVATION = [
  "את יכולה!",
  "כל הכבוד!",
  "עוד אחת קטנה!",
  "את אלופה!",
  "ממשיכים חזק!",
  "גאה בך!",
  "מדהים, כך ממשיכים!",
  "את בדרך הנכונה!",
  "תרגיל ועוד תרגיל!",
  "וואו, איזה כוח!",
];

// Pick a random phrase that isn't the one currently showing.
function nextPhrase(current) {
  if (MOTIVATION.length < 2) return MOTIVATION[0];
  let next = current;
  while (next === current) {
    next = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
  }
  return next;
}

export default function CardScreen({ context, onClose }) {
  const { badge, badgeColor = "#E6F784", total = 11 } = context;
  const startProgress = context.progress ?? 0;
  const cardList = exercises[badge] ?? [];
  // Queue of card indices still to be done. Swiping right removes the card; swiping left sends
  // it to the back of the queue — so the exercise finishes only once every card was swiped right.
  const [queue, setQueue] = useState(() =>
    Array.from({ length: total }, (_, i) => i).slice(startProgress)
  );
  const [history, setHistory] = useState([]); // queue snapshots, for undo
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [flipAnim, setFlipAnim] = useState(true); // false = snap flip instantly (during card change)
  const [phrase, setPhrase] = useState(MOTIVATION[0]);
  const [phraseKey, setPhraseKey] = useState(0); // bump to re-show the bar on each new card
  const [barVisible, setBarVisible] = useState(false);
  const [animatePhrase, setAnimatePhrase] = useState(false);
  const barVisibleRef = useRef(false);
  const hideTimer = useRef(null);

  const touchStartX = useRef(null);
  const mouseStartX = useRef(null);
  const lastTouchEnd = useRef(0); // suppresses the emulated mouse events fired after a touch

  function showNewPhrase() {
    // Animate the text only when the bar is still up (didn't get to slide down).
    // When it slides up from the bottom, the slide itself is the animation.
    setAnimatePhrase(barVisibleRef.current);
    setPhrase((p) => nextPhrase(p));
    setPhraseKey((k) => k + 1);
  }

  // Each new card (phraseKey bump) slides the bar up, holds 5s, then slides it down & hides.
  useEffect(() => {
    setBarVisible(true);
    barVisibleRef.current = true;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setBarVisible(false);
      barVisibleRef.current = false;
    }, 3000);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [phraseKey]);

  // Snap the card back to its front face WITHOUT animating — so the next card just appears
  // showing its name, instead of doing a flip-back on transition.
  function resetFlipInstant() {
    setFlipAnim(false);
    setFlipped(false);
    setTimeout(() => setFlipAnim(true), 60);
  }

  // Swipe right = "done" → remove the card from the queue. Finishes when the queue is empty.
  function swipeRight() {
    if (animating || queue.length === 0) return;
    setAnimating(true);
    setSwipeOffset(500);
    setTimeout(() => {
      setHistory((h) => [...h, queue]);
      const nextQueue = queue.slice(1);
      setQueue(nextQueue);
      setSwipeOffset(0);
      setAnimating(false);
      resetFlipInstant();
      if (nextQueue.length === 0) {
        setCompleted(true);
      } else {
        showNewPhrase();
      }
    }, 300);
  }

  // Swipe left = "not done yet" → send the card to the back of the queue so it comes around again.
  function swipeLeft() {
    if (animating || queue.length === 0) return;
    setAnimating(true);
    setSwipeOffset(-500);
    setTimeout(() => {
      setHistory((h) => [...h, queue]);
      const nextQueue = [...queue.slice(1), queue[0]];
      setQueue(nextQueue);
      setSwipeOffset(0);
      setAnimating(false);
      resetFlipInstant();
      showNewPhrase();
    }, 300);
  }

  function resetLast() {
    if (animating || history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setQueue(prev);
    setFlipped(false);
  }

  function toggleFlip() {
    if (animating) return;
    setFlipped((f) => !f);
  }

  function endGesture(delta) {
    // A committed horizontal swipe (>60px) advances; anything smaller is treated as a
    // tap/click anywhere on the card → flip it.
    if (delta > 60) swipeRight();
    else if (delta < -60) swipeLeft();
    else {
      setSwipeOffset(0);
      toggleFlip();
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
    lastTouchEnd.current = Date.now();
    endGesture(delta);
  }

  function onMouseDown(e) {
    if (animating) return;
    // Ignore the emulated mouse event that fires right after a real touch.
    if (Date.now() - lastTouchEnd.current < 700) return;
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

  const done = total - queue.length; // cards already swiped right
  const currentCard = cardList[queue[0]] ?? null;

  // Split "name — reps" — name as the title, reps shown below it.
  const taskText = currentCard?.task ?? "";
  const dashIdx = taskText.indexOf("—");
  const taskName = dashIdx === -1 ? taskText.trim() : taskText.slice(0, dashIdx).trim();
  const taskReps = dashIdx === -1 ? "" : taskText.slice(dashIdx + 1).trim();

  const cardTransform = `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.025}deg)`;
  const cardOpacity = Math.max(0, 1 - Math.abs(swipeOffset) / 400);

  const pct = total > 0 ? (done / total) * 100 : 0;

  if (completed) {
    return <CompletionScreen badge={badge} badgeColor={badgeColor} onHome={() => onClose(total)} />;
  }

  return (
    <div className="relative bg-[#F9F9F9] h-screen w-full max-w-[393px] mx-auto overflow-hidden flex flex-col pt-[74px] px-4 pb-[120px] select-none">
      {/* Top row: [X right] [title center] [spacer left] */}
      <div className="flex items-center justify-between h-[33px]">
        <button
          onClick={() => onClose(done)}
          aria-label="סגירה"
          className="w-[33px] h-[33px] flex items-center justify-center text-black shrink-0"
        >
          <CloseIcon />
        </button>
        <span className="text-[18px] text-black">{badge}</span>
        <div className="w-[33px] shrink-0" />
      </div>

      {/* Progress bar */}
      <div
        className="relative w-full h-[8px] mt-[21px] rounded-full"
        style={{ backgroundColor: PROGRESS_TRACK }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, minWidth: 19, backgroundColor: PROGRESS_FILL }}
        />
      </div>

      {/* Card */}
      <div className="relative mt-[24px] flex-1 min-h-0">
        {/* Decorative stacked cards behind — full-size cards, shifted up & narrower so their
            tops peek above the main card (revealed as the top card swipes away) */}
        <div
          className="absolute top-0 left-6 right-6 bottom-[16px] rounded-[28px] bg-white"
          style={{ boxShadow: "0 0 6.3px rgba(0,0,0,0.10)" }}
        />
        <div
          className="absolute top-[8px] left-3 right-3 bottom-[8px] rounded-[28px] bg-white"
          style={{ boxShadow: "0 0 6.3px rgba(0,0,0,0.10)" }}
        />
        {/* Main swipeable card */}
        <div
          className="absolute top-[16px] left-0 right-0 bottom-0 cursor-grab active:cursor-grabbing"
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
              transition: flipAnim ? "transform 0.5s cubic-bezier(0.4,0.2,0.2,1)" : "none",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT — the exercise */}
            <div
              className="absolute inset-0 rounded-[28px] bg-white flex flex-col items-center"
              style={{
                boxShadow: "0 0 6.3px rgba(0,0,0,0.12)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Title */}
              <h2 className="mt-[57px] px-6 text-center font-extrabold text-black text-[28px] leading-[40px] pointer-events-none">
                {taskName}
              </h2>

              {taskReps && (
                <p className="mt-[10px] px-6 text-center font-medium text-[#606060] text-[18px] leading-[24px] pointer-events-none">
                  {taskReps}
                </p>
              )}

              {/* Animation slot — drop the <video> for this exercise here.
                  Kept empty on purpose so videos can be imported later. */}
              <div
                className="mt-[14px] w-[220px] h-[231px] flex items-center justify-center overflow-hidden"
                data-animation-slot={badge}
              >
                {/* TODO: <video src={...} autoPlay loop muted playsInline className="w-full h-full object-contain" /> */}
              </div>

              {/* Replay / flip icon */}
              <div className="mt-auto mb-[18px] flex justify-center">
                <IconButton onActivate={toggleFlip} ariaLabel="הצגת הסבר">
                  <RefreshIcon />
                </IconButton>
              </div>
            </div>

            {/* BACK — the reason */}
            <div
              className="absolute inset-0 rounded-[28px] bg-white flex flex-col"
              style={{
                boxShadow: "0 0 6.3px rgba(0,0,0,0.12)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex-1 flex items-center justify-center px-7 text-center pointer-events-none">
                <p className="text-[26px] font-bold text-[#DAB8F4] leading-[38px]">
                  {currentCard?.reason ?? ""}
                </p>
              </div>
              <div className="mb-[18px] flex justify-center">
                <IconButton onActivate={toggleFlip} ariaLabel="חזרה למשימה">
                  <RefreshIcon />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint row: [hint center] [undo left] — moves up with the bottom bar, drops 30px when it hides */}
      <div
        className="flex items-center mt-[22px]"
        style={{
          transform: barVisible ? "translateY(0)" : "translateY(30px)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="w-[24px] shrink-0" />
        <p className="flex-1 text-[12px] text-[#606060] text-center leading-[1.4] px-2">
          תחליקי את הכרטיסייה ימינה אם ביצעת את המשימה
        </p>
        <button
          onClick={resetLast}
          disabled={history.length === 0}
          aria-label="ביטול"
          className="w-[24px] h-[24px] flex items-center justify-center disabled:opacity-30 shrink-0"
        >
          <UndoIcon />
        </button>
      </div>

      {/* Bottom CTA bar — slides up on each new card, holds 5s, then slides down & hides */}
      <button
        onClick={swipeRight}
        aria-hidden={!barVisible}
        className="absolute bottom-0 left-0 right-0 h-[112px] rounded-t-[28px] bg-[#DAB8F4] flex items-center justify-center text-black text-[26px] font-bold"
        style={{
          transform: barVisible ? "translateY(0)" : "translateY(120%)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: barVisible ? "auto" : "none",
        }}
      >
        <span key={phraseKey} className={`inline-block ${animatePhrase ? "phrase-pop" : ""}`}>
          {phrase}
        </span>
      </button>
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
