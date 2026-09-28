import { useCallback, useEffect, useRef, useState } from "react";

const TILES = 6;
const ROUNDS = 5;

type Props = {
  onComplete: (averageMs: number) => void;
  result: number | null;
};

export function ReactionTest({ onComplete, result }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [times, setTimes] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [tooSoon, setTooSoon] = useState(false);
  const shownAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const nextTarget = useCallback(() => {
    setActive(null);
    clearTimer();
    timer.current = setTimeout(
      () => {
        setActive(Math.floor(Math.random() * TILES));
        shownAt.current = performance.now();
      },
      600 + Math.random() * 1400,
    );
  }, []);

  useEffect(() => clearTimer, []);

  const start = () => {
    setTimes([]);
    setLast(null);
    setTooSoon(false);
    setRunning(true);
    nextTarget();
  };

  const tap = (index: number) => {
    if (!running) return;
    if (active === null) {
      setTooSoon(true);
      nextTarget();
      return;
    }
    if (index !== active) return;

    const ms = Math.round(performance.now() - shownAt.current);
    setTooSoon(false);
    setLast(ms);
    const next = [...times, ms];
    setTimes(next);
    setActive(null);

    if (next.length >= ROUNDS) {
      setRunning(false);
      clearTimer();
      const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
      onComplete(avg);
    } else {
      nextTarget();
    }
  };

  const done = !running && result !== null;

  return (
    <div className="rounded-3xl bg-ink p-5 text-ink-foreground">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold">Reactiesnelheid</p>
        <span className="rounded-full bg-sun px-2.5 py-1 text-[11px] font-semibold text-sun-foreground">
          {running ? `Tik ${times.length + 1}/${ROUNDS}` : done ? "Klaar" : "Tik op de stip"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: TILES }).map((_, i) => {
          const lit = active === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => tap(i)}
              disabled={!running}
              className={`grid aspect-square place-items-center rounded-2xl transition-colors ${
                lit ? "bg-sun" : "bg-cream/10"
              } ${running ? "" : "opacity-70"}`}
            >
              {lit ? <span className="size-9 rounded-full bg-coral animate-pop" /> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] font-medium text-ink-foreground/50">
          {tooSoon
            ? "Te vroeg — wacht op de stip"
            : running
              ? last
                ? `Laatste tik ${last} ms`
                : "Wacht tot de stip verschijnt"
              : done
                ? "Gemiddelde over 5 tikken"
                : "5 tikken, tik alleen als er een stip verschijnt"}
        </p>
        <p className="font-display text-2xl font-bold text-sun tabular">
          {result ?? last ?? "—"}
          <span className="font-body text-sm font-medium text-ink-foreground/50"> ms</span>
        </p>
      </div>

      {!running ? (
        <button
          type="button"
          onClick={start}
          className="mt-4 w-full rounded-2xl bg-cream/12 py-3 font-display text-sm font-semibold text-ink-foreground"
        >
          {done ? "Opnieuw testen" : "Start test"}
        </button>
      ) : null}
    </div>
  );
}
