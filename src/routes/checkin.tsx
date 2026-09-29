import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartRateCard } from "@/components/HeartRateCard";
import { ReactionTest } from "@/components/ReactionTest";
import { clearDraft, loadDraft, saveDraft, useSessions, type Draft } from "@/hooks/use-sessions";
import { ACTIVITY_OPTIONS } from "@/lib/sessions";

type Phase = "before" | "after";

export const Route = createFileRoute("/checkin")({
  validateSearch: (search: Record<string, unknown>) => ({
    phase: (search["phase"] === "after" ? "after" : "before") as Phase,
  }),
  head: () => ({
    meta: [
      { title: "Check-in — PulsePop" },
      {
        name: "description",
        content:
          "Leg je hartslag vast en doe de tik-op-de-stip reactietest voor en na je training.",
      },
      { property: "og:title", content: "Check-in — PulsePop" },
      {
        property: "og:description",
        content: "Hartslag invoeren plus een reactietest van vijf tikken, voor en na de training.",
      },
    ],
  }),
  component: CheckIn,
});

function CheckIn() {
  const { phase } = Route.useSearch();
  const navigate = useNavigate();
  const { addSession } = useSessions();

  const [activity, setActivity] = useState(ACTIVITY_OPTIONS[0] ?? "Training");
  const [duration, setDuration] = useState(40);
  const [hr, setHr] = useState(phase === "before" ? 64 : 152);
  const [reaction, setReaction] = useState<number | null>(null);
  const [draft, setDraftState] = useState<Draft | null>(null);

  useEffect(() => {
    setDraftState(loadDraft());
  }, []);

  const isBefore = phase === "before";
  const canSave = reaction !== null;

  const submit = () => {
    if (reaction === null) return;

    if (isBefore) {
      const next: Draft = { activity, hr, reaction, startedAt: new Date().toISOString() };
      saveDraft(next);
      setDraftState(next);
      navigate({ to: "/" });
      return;
    }

    const base = draft ?? {
      activity,
      hr: 64,
      reaction: reaction + 20,
      startedAt: new Date().toISOString(),
    };

    addSession({
      id: `s-${Date.now()}`,
      date: base.startedAt,
      activity: base.activity,
      duration,
      before: { hr: base.hr, reaction: base.reaction },
      after: { hr, reaction },
    });
    clearDraft();
    setDraftState(null);
    navigate({ to: "/summary" });
  };

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
          {isBefore ? "Voor de training" : "Na de training"}
        </p>
        <span className="size-10" />
      </header>

      <div className="px-5">
        <h1 className="font-display text-[30px] font-bold leading-[1.05]">
          {isBefore ? "Nulmeting" : "Hoe voel je je nu?"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isBefore
            ? "Twee metingen: je hartslag op dit moment, en een reactietest van vijf tikken."
            : draft
              ? `${draft.activity} afronden — nulmeting was ${draft.hr} bpm / ${draft.reaction} ms.`
              : "Geen nulmeting opgeslagen, dus we schatten er een voor deze sessie."}
        </p>
      </div>

      <div className="mt-4 px-5">
        <div className="flex gap-2">
          <Link
            to="/checkin"
            search={{ phase: "before" }}
            className={`flex-1 rounded-full py-3 text-center font-display text-sm font-semibold ${
              isBefore
                ? "bg-ink text-ink-foreground"
                : "border-2 border-border bg-card text-muted-foreground"
            }`}
          >
            Voor
          </Link>
          <Link
            to="/checkin"
            search={{ phase: "after" }}
            className={`flex-1 rounded-full py-3 text-center font-display text-sm font-semibold ${
              !isBefore
                ? "bg-ink text-ink-foreground"
                : "border-2 border-border bg-card text-muted-foreground"
            }`}
          >
            Na
          </Link>
        </div>
      </div>

      {isBefore ? (
        <div className="mt-4 px-5">
          <div className="rounded-3xl bg-card p-5 shadow-chunky">
            <p className="font-display text-base font-semibold">Training van vandaag</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setActivity(a)}
                  className={`rounded-full px-3 py-2 text-[12px] font-semibold ${
                    activity === a ? "bg-ink text-ink-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 px-5">
          <div className="rounded-3xl bg-card p-5 shadow-chunky">
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-semibold">Duur van de sessie</p>
              <p className="font-display text-2xl font-bold tabular">
                {duration}
                <span className="text-sm font-medium text-muted-foreground"> min</span>
              </p>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              aria-label="Duur van de sessie in minuten"
              className="mt-4 h-2 w-full appearance-none rounded-full bg-muted accent-coral"
            />
          </div>
        </div>
      )}

      <div className="mt-4 px-5">
        <HeartRateCard
          value={hr}
          onChange={setHr}
          label="Hartslag"
          hint={isBefore ? "In rust" : "Direct erna"}
        />
      </div>

      <div className="mt-4 px-5">
        <ReactionTest result={reaction} onComplete={setReaction} />
      </div>

      <div className="mt-auto px-5 pb-6 pt-5">
        <button
          type="button"
          disabled={!canSave}
          onClick={submit}
          className="w-full rounded-full bg-coral py-4 font-display text-lg font-bold text-coral-foreground shadow-chunky-lg disabled:opacity-40 disabled:shadow-none"
        >
          {canSave
            ? isBefore
              ? "Nulmeting opslaan & trainen"
              : "Sessie afronden"
            : "Doe eerst de reactietest"}
        </button>
      </div>
    </div>
  );
}
