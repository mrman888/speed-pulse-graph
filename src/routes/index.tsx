import { createFileRoute, Link } from "@tanstack/react-router";
import { useSessions } from "@/hooks/use-sessions";
import { bandColor, formatDay, initials } from "@/lib/sessions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulsePop — Trainingsintensiteit bijhouden" },
      {
        name: "description",
        content:
          "Leg je hartslag en reactiesnelheid vast voor en na je training en zie hoe intensief elke sessie echt was.",
      },
      { property: "og:title", content: "PulsePop — Trainingsintensiteit bijhouden" },
      {
        property: "og:description",
        content: "Hartslag plus reactiesnelheid omgezet in een intensiteitsscore.",
      },
    ],
  }),
  component: Home,
});

const BAND_BG: Record<string, string> = {
  coral: "bg-coral/15 text-coral",
  sun: "bg-sun/25 text-sun-foreground",
  mint: "bg-mint/15 text-mint",
};

const BAR_BG: Record<string, string> = {
  coral: "bg-coral",
  sun: "bg-sun",
  mint: "bg-mint",
};

function Home() {
  const { scored } = useSessions();
  const recent = [...scored].reverse();
  const lastSeven = scored.slice(-7);
  const avg = scored.length
    ? Math.round(scored.reduce((a, s) => a + s.intensity, 0) / scored.length)
    : 0;
  const best = scored.length ? Math.min(...scored.map((s) => s.before.reaction)) : 0;
  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-8">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-2xl bg-coral font-display text-xl font-bold text-coral-foreground">
            P
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none">PulsePop</p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Trainingsintensiteit bijhouden
            </p>
          </div>
        </div>
        <Link
          to="/stats"
          className="grid size-10 place-items-center rounded-full bg-sun font-display text-sm font-bold text-sun-foreground"
        >
          ↗
        </Link>
      </header>

      <div className="px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-coral">{today}</p>
        <h1 className="mt-1 font-display text-[34px] font-bold leading-[1.02]">
          Hoe zwaar
          <br />
          was jouw workout?
        </h1>
      </div>

      <div className="mt-4 px-5">
        <div className="flex gap-2">
          <Link
            to="/checkin"
            search={{ phase: "before" }}
            className="flex-1 rounded-full bg-ink py-3 text-center font-display text-sm font-semibold text-ink-foreground"
          >
            Voor
          </Link>
          <Link
            to="/checkin"
            search={{ phase: "after" }}
            className="flex-1 rounded-full border-2 border-border bg-card py-3 text-center font-display text-sm font-semibold text-muted-foreground"
          >
            Na
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
        <div className="rounded-3xl bg-card p-4 shadow-chunky">
          <p className="text-[11px] font-semibold text-muted-foreground">Gem. intensiteit</p>
          <p className="mt-1 font-display text-[34px] font-bold leading-none tabular">{avg}</p>
          <p className="text-[11px] font-medium text-muted-foreground">van 100</p>
        </div>
        <div className="rounded-3xl bg-card p-4 shadow-chunky">
          <p className="text-[11px] font-semibold text-muted-foreground">Snelste reactie</p>
          <p className="mt-1 font-display text-[34px] font-bold leading-none tabular">{best}</p>
          <p className="text-[11px] font-medium text-muted-foreground">ms</p>
        </div>
      </div>

      <div className="mt-4 px-5">
        <div className="rounded-3xl bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-base font-semibold">Laatste 7 sessies</p>
            <span className="text-[11px] font-semibold text-muted-foreground">Intensiteit</span>
          </div>
          <div className="mt-4 flex h-28 items-end justify-between gap-2">
            {lastSeven.map((s) => (
              <div key={s.id} className="flex h-full flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-full ${BAR_BG[bandColor(s.band)]}`}
                    style={{ height: `${Math.max(12, s.intensity)}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {new Date(s.date).toLocaleDateString("nl-NL", { weekday: "narrow" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 px-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold">Recente sessies</p>
          <Link to="/stats" className="text-[11px] font-semibold text-muted-foreground">
            Bekijk grafieken
          </Link>
        </div>
        <div className="mt-3 space-y-2.5">
          {recent.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-card p-3">
              <div
                className={`grid size-11 place-items-center rounded-xl font-display text-sm font-bold ${BAND_BG[bandColor(s.band)]}`}
              >
                {initials(s.activity)}
              </div>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold">{s.activity}</p>
                <p className="text-[11px] text-muted-foreground tabular">
                  {formatDay(s.date)} · {s.before.hr}→{s.after.hr} bpm · {s.after.reaction} ms
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${BAND_BG[bandColor(s.band)]}`}
              >
                {s.intensity}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto px-5 pb-6 pt-5">
        <Link
          to="/checkin"
          search={{ phase: "before" }}
          className="block w-full rounded-full bg-coral py-4 text-center font-display text-lg font-bold text-coral-foreground shadow-chunky-lg"
        >
          Start sessie
        </Link>
      </div>
    </div>
  );
}
