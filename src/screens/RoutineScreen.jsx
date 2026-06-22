import { useState, useRef, useEffect, useLayoutEffect } from "react";

const BADGE_BG = "#E6F784";
const PROGRESS_FILL = "#E6F784";
const PROGRESS_TRACK = "#F5F5F5";

// Scroll distance (px) "spent" collapsing the header before the list starts scrolling.
const COLLAPSE_RANGE = 180;

const DAILY = [
  { badge: "מוטוריקה עדינה", progress: 0, total: 4 },
  { badge: "תרגילי גב", progress: 0, total: 4 },
  { badge: "יציבה", progress: 0, total: 4 },
  { badge: "הליכה", progress: 0, total: 11 },
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

// The header's total height reduction from expanded → collapsed (subtitle 25 + card 89).
const HEADER_SHRINK = 114;

export default function RoutineScreen({
  onStartExercise,
  progressMap = {},
  completedBadge = null,
  onCompletionAnimationDone,
}) {
  const p = (badge, fallback = 0) => progressMap[badge] ?? fallback;

  // Fly-away animation for a just-completed card: it slides off to the left while the
  // cards below it rise up to fill the gap, then it's removed from the list.
  const [flyingBadge, setFlyingBadge] = useState(null);
  const [collapsing, setCollapsing] = useState(false);

  useEffect(() => {
    if (!completedBadge) return;
    setFlyingBadge(completedBadge); // phase 1: card slides left & fades out
    setCollapsing(false);
    const t1 = setTimeout(() => setCollapsing(true), 260); // phase 2: cards below rise up
    const t2 = setTimeout(() => {
      setFlyingBadge(null);
      setCollapsing(false);
      onCompletionAnimationDone?.();
    }, 760);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [completedBadge]);

  const [t, setT] = useState(0); // 0 = expanded, 1 = collapsed (eased header morph)
  const tRef = useRef(0); // latest displayed (eased) t
  const targetRef = useRef(0); // collapse target driven by scroll position
  const scrollYRef = useRef(0); // latest raw scrollTop
  const rafRef = useRef(null);
  const listRef = useRef(null); // the scrolling content below the header

  // The list tracks the RAW scroll exactly (no easing) so it never drifts/bounces after you
  // stop. The extra `HEADER_SHRINK*(eased - raw)` term compensates for the header still
  // easing above it, so the two stay aligned while the header animates smoothly.
  function applyPin() {
    if (!listRef.current) return;
    const y = scrollYRef.current;
    const raw = clamp(y / COLLAPSE_RANGE, 0, 1);
    const pin = Math.min(y, COLLAPSE_RANGE) + HEADER_SHRINK * (tRef.current - raw);
    listRef.current.style.transform = `translateY(${pin}px)`;
  }

  function tick() {
    const cur = tRef.current;
    const target = targetRef.current;
    const next = cur + (target - cur) * 0.18; // ease toward the scroll target
    if (Math.abs(target - next) < 0.002) {
      tRef.current = target;
      setT(target);
      applyPin();
      rafRef.current = null;
      return;
    }
    tRef.current = next;
    setT(next);
    applyPin();
    rafRef.current = requestAnimationFrame(tick);
  }

  function onScroll(e) {
    scrollYRef.current = e.currentTarget.scrollTop;
    applyPin(); // same frame as the native scroll → exact, no jitter
    targetRef.current = clamp(scrollYRef.current / COLLAPSE_RANGE, 0, 1);
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  }

  // Re-assert the pin after any React re-render (header easing, completion fly-away, …),
  // since React would otherwise reset the element's inline style.
  useLayoutEffect(() => {
    applyPin();
  });

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  const subtitleH = lerp(25, 0, t);
  const cardHeight = lerp(174, 85, t);
  // Single morphing layout: the title shrinks, the button just slides up.
  const titleFont = lerp(40, 18, t);
  const titleLH = lerp(42, 20, t);
  // Past this point the (now small) title fits on a single line.
  const oneLine = t > 0.55;
  // Subtitle position interpolates continuously (under 2 big lines → under 1 small line)
  // so it just glides up into place — no jump tied to the line-count switch.
  const subTop = lerp(109, 44, t);
  const subFont = lerp(16, 14, t);
  const btnTop = lerp(109, 20, t);

  // Featured event — same completion rules as the daily cards: always shown until finished,
  // then it flies away to the left and disappears.
  const EVENT = { badge: "נסיעה לעפולה", total: 11 };
  const eventComplete = p(EVENT.badge) >= EVENT.total;
  const eventFlying = flyingBadge === EVENT.badge;
  const eventCollapsed = eventFlying && collapsing;
  const showEvent = !eventComplete || eventFlying;

  const startEvent = () =>
    onStartExercise({ badge: EVENT.badge, badgeColor: BADGE_BG, total: EVENT.total });

  return (
    <div
      onScroll={onScroll}
      className="bg-white h-screen overflow-y-auto w-full max-w-[393px] mx-auto"
    >
      {/* Sticky collapsing header */}
      <header className="sticky top-0 z-20 bg-[#DAB8F4] rounded-b-[40px] pt-[69px] px-4 pb-4">
        {/* Greeting (persistent) */}
        <p className="text-right text-[24px] font-medium leading-[40px] text-black">היי ליאן,</p>

        {/* Shown once the featured event is fully done (after it flew away) */}
        {eventComplete && !eventFlying && (
          <p className="text-right text-[16px] font-normal leading-[25px] text-black">
            סיימת את התרגולים לאירועים היום!
          </p>
        )}

        {showEvent && (
        <>
        {/* Subtitle — collapses away on scroll */}
        <div
          style={{ height: `${subtitleH}px`, opacity: 1 - t, overflow: "hidden" }}
        >
          <p className="text-right text-[16px] font-normal leading-[25px] text-black">
            היום יש אירוע 1 שמצריך הכנה ותרגול
          </p>
        </div>

        {/* Featured event card — single layout: title shrinks, button slides up.
            On completion it flies left & fades, then collapses its height away. */}
        <div
          className="relative bg-white rounded-[30px] overflow-hidden"
          style={{
            height: eventCollapsed ? 0 : `${cardHeight}px`,
            marginTop: eventCollapsed ? 0 : 21,
            transform: eventFlying ? "translateX(-130%) rotate(-6deg)" : "none",
            opacity: eventFlying ? 0 : 1,
            // Transition only during the completion fly-away — otherwise the height must
            // track the text instantly while scrolling, so card + text grow/shrink as one.
            transition:
              eventFlying || eventCollapsed
                ? "transform 0.45s cubic-bezier(0.5,0,0.2,1), opacity 0.4s ease, height 0.45s ease, margin-top 0.45s ease"
                : "none",
          }}
        >
          <h2
            className="absolute text-right font-extrabold text-black"
            style={{
              top: 20,
              right: 20,
              fontSize: `${titleFont}px`,
              lineHeight: `${titleLH}px`,
              whiteSpace: "nowrap",
            }}
          >
            {oneLine ? (
              "נסיעה לעפולה"
            ) : (
              <>
                נסיעה
                <br />
                לעפולה
              </>
            )}
          </h2>

          <p
            className="absolute text-right text-[#606060]"
            style={{ top: `${subTop}px`, right: 20, fontSize: `${subFont}px` }}
          >
            תרגילי יציבה +הליכה
          </p>

          <button
            onClick={startEvent}
            className="absolute bg-black text-white text-[16px] font-medium rounded-[23px] w-[120px] h-[45px] flex items-center justify-center"
            style={{ top: `${btnTop}px`, left: 20 }}
          >
            התחילי
          </button>
        </div>
        </>
        )}
      </header>

      {/* Daily exercises — held while the header collapses, then scroll under it.
          Transform is driven directly on the DOM (see onScroll) for jitter-free pinning. */}
      <div ref={listRef} style={{ willChange: "transform" }}>
        <h3 className="text-right text-[20px] font-medium text-black mt-[27px] px-4">
          תרגולים יומיומיים
        </h3>

        <div className="flex flex-col mt-[7px] px-4 pb-8">
          {DAILY.map((ex, i) => {
            const prog = p(ex.badge, ex.progress);
            const isComplete = prog >= ex.total;
            const isFlying = flyingBadge === ex.badge;
            // Hide finished exercises — but keep the one that's currently flying away.
            if (isComplete && !isFlying) return null;
            const collapsed = isFlying && collapsing;
            return (
              <div
                key={ex.badge}
                style={{
                  transition:
                    "transform 0.45s cubic-bezier(0.5,0,0.2,1), opacity 0.4s ease, max-height 0.45s ease, margin-top 0.45s ease",
                  transform: isFlying ? "translateX(-130%) rotate(-6deg)" : "none",
                  opacity: isFlying ? 0 : 1,
                  maxHeight: collapsed ? 0 : 400,
                  marginTop: collapsed ? 0 : i === 0 ? 0 : 13,
                  overflow: collapsed ? "hidden" : "visible",
                }}
              >
                <DailyCard
                  badge={ex.badge}
                  progress={prog}
                  total={ex.total}
                  onPress={() =>
                    onStartExercise({ badge: ex.badge, badgeColor: BADGE_BG, total: ex.total })
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recover the scroll consumed by the collapse, so the last card stays reachable */}
      <div style={{ height: `${COLLAPSE_RANGE}px` }} />
    </div>
  );
}

function DailyCard({ badge, progress, total, onPress }) {
  const pct = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div
      className="bg-white rounded-[20px] p-5"
      style={{ boxShadow: "0 0 6.3px rgba(0,0,0,0.12)" }}
    >
      {/* Top row: badge (right) + count (left) */}
      <div className="flex items-center justify-between">
        <span
          className="text-[14px] text-black px-[14px] py-[4px] rounded-[15px]"
          style={{ backgroundColor: BADGE_BG }}
        >
          {badge}
        </span>
        <span className="text-[22px] font-medium text-black">
          {progress}/{total}
        </span>
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

      {/* CTA */}
      <button
        onClick={onPress}
        className="mt-5 bg-black text-white text-[16px] font-medium rounded-[23px] w-[120px] h-[45px] flex items-center justify-center"
      >
        התחילי
      </button>
    </div>
  );
}
