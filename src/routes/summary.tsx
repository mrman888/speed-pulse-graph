import { createFileRoute, Link } from "@tanstack/react-router";
import { useSessions } from "@/hooks/use-sessions";
import { bandColor, formatDay } from "@/lib/sessions";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Sessieoverzicht — SportHealth Tracker" },
      {
        name: "description",
        content:
          "Vergelijking van voor en na je laatste training: hartslagstijging, verandering in reactietijd en intensiteitsscore.",
      },
      { property: "og:title", content: "Sessieoverzicht — SportHealth Tracker" },
      {
        property: "og:description",
        content: "Zie hoe hoog je hartslag klom en hoe goed je reflexen het hielden.",
      },
    ],
  }),
  component: Summary,
});

const TONE: Record<string, string> = {
  coral: "bg-coral text-coral-foreground",
  sun: "bg-sun text-sun-foreground",
  mint: "bg-mint text-ink",
};

function Row({
  label,
  before,
  after,
  unit,
}: {
  label: string;
  before: number;
  after: number;
  unit: string;
}) {
  const delta = after - before;
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card p-4">
      <p className="text-[12px] font-semibold text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold tabular">
        {before} <span className="text-muted-foreground">→</span> {after}
        <span className="text-[12px] font-medium text-muted-foreground"> {unit}</span>
        <span className={`ml-2 text-[12px] ${delta >= 0 ? "text-coral" : "text-mint"}`}>
          {delta >= 0 ? "+" : ""}
          {delta}
        </span>
      </p>
    </div>
  );
}

function Summary() {
  const { scored, ready } = useSessions();
  const session = scored[scored.length - 1];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-8">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <Link
          to="/"
          className="grid size-10 place-items-center rounded-2xl bg-card font-display text-lg font-bold shadow-chunky-sm"
        >
          ←
        </Link>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em]">
          Sessieoverzicht
        </p>
        <span className="size-10" />
      </header>

      {!ready || !session ? (
        <p className="px-5 text-sm text-muted-foreground">Nog geen sessies vastgelegd.</p>
      ) : (
        <>
          <div className="px-5">
            <h1 className="font-display text-[32px] font-bold leading-[1.05]">
              {session.activity}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDay(session.date)} · {session.duration} min
            </p>
          </div>

          <div className="mt-4 px-5">
            <div className={`rounded-3xl p-5 shadow-chunky ${TONE[bandColor(session.band)]}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                Intensiteit
              </p>
              <div className="mt-1 flex items-end gap-2">
                <span className="font-display text-[64px] font-bold leading-none tabular">
                  {session.intensity}
                </span>
                <span className="mb-2 font-display text-lg font-bold">{session.band}</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/15">
                <div
                  className="h-full rounded-full bg-ink/70"
                  style={{ width: `${session.intensity}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 px-5">
            <Row label="Hartslag" before={session.before.hr} after={session.after.hr} unit="bpm" />
            <Row
              label="Reactiesnelheid"
              before={session.before.reaction}
              after={session.after.reaction}
              unit="ms"
            />
          </div>

          <div className="mt-4 px-5">
            <div className="rounded-3xl bg-ink p-5 text-ink-foreground">
              <p className="font-display text-base font-semibold">Wat dit betekent</p>
              <p className="mt-2 text-sm text-ink-foreground/70">
                Je hartslag klom {session.after.hr - session.before.hr} bpm en je tikken werden{" "}
                {Math.abs(session.after.reaction - session.before.reaction)} ms{" "}
                {session.after.reaction > session.before.reaction ? "langzamer" : "sneller"} — een
                sessie met {session.band.toLowerCase()}e intensiteit.
              </p>
            </div>
          </div>
        </>
      )}

      <div className="mt-auto flex gap-2 px-5 pb-6 pt-5">
        <Link
          to="/stats"
          className="flex-1 rounded-full border-2 border-border bg-card py-4 text-center font-display text-base font-bold"
        >
          Bekijk grafieken
        </Link>
        <Link
          to="/"
          className="flex-1 rounded-full bg-coral py-4 text-center font-display text-base font-bold text-coral-foreground shadow-chunky-lg"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
