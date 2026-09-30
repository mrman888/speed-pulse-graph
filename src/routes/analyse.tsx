import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useSessions } from "@/hooks/use-sessions";
import { bandColor, formatShort } from "@/lib/sessions";

export const Route = createFileRoute("/analyse")({
  head: () => ({
    meta: [
      { title: "Analyse & advies — SportHealth Tracker" },
      {
        name: "description",
        content: "Persoonlijke analyse en hersteladvies op basis van je hartslag en reactiesnelheid.",
      },
      { property: "og:title", content: "Analyse & advies — SportHealth Tracker" },
      {
        property: "og:description",
        content: "Inzichten in belasting, vermoeidheid en herstel per activiteit.",
      },
    ],
  }),
  component: Analyse,
});

const axis = { tick: { fontSize: 10, fill: "var(--muted-foreground)" }, stroke: "var(--border)" };
const tooltipStyle = {
  contentStyle: {
    borderRadius: 14,
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: 12,
  },
};
const COLOR: Record<string, string> = {
  coral: "var(--coral)",
  sun: "var(--sun)",
  mint: "var(--mint)",
};

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-chunky">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold">{title}</p>
        {note ? <span className="text-[11px] font-semibold text-muted-foreground">{note}</span> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Analyse() {
  const { scored } = useSessions();
  const n = scored.length;
  const last = scored[n - 1];

  const fatigue = scored.map((s) => ({
    label: formatShort(s.date),
    lift: s.after.hr - s.before.hr,
    delay: s.after.reaction - s.before.reaction,
    intensity: s.intensity,
    color: COLOR[bandColor(s.band)],
  }));

  // Belasting laatste 7 vs. vorige 7 sessies
  const load = (arr: typeof scored) => arr.reduce((a, s) => a + s.intensity, 0);
  const recentLoad = load(scored.slice(-7));
  const prevLoad = load(scored.slice(-14, -7));
  const loadChange = prevLoad ? Math.round(((recentLoad - prevLoad) / prevLoad) * 100) : 0;

  // Per activiteit
  const byAct = Object.values(
    scored.reduce<Record<string, { activity: string; total: number; count: number }>>((acc, s) => {
      const e = (acc[s.activity] ??= { activity: s.activity, total: 0, count: 0 });
      e.total += s.intensity;
      e.count += 1;
      return acc;
    }, {}),
  )
    .map((e) => ({ activity: e.activity, avg: Math.round(e.total / e.count) }))
    .sort((a, b) => b.avg - a.avg);

  // Basis-reactiesnelheid trend
  const half = Math.floor(n / 2);
  const avgR = (arr: typeof scored) =>
    arr.length ? Math.round(arr.reduce((a, s) => a + s.before.reaction, 0) / arr.length) : 0;
  const baseEarly = avgR(scored.slice(0, half));
  const baseLate = avgR(scored.slice(half));

  const tips: { tone: "coral" | "sun" | "mint"; title: string; text: string }[] = [];
  if (last) {
    const delay = last.after.reaction - last.before.reaction;
    const lift = last.after.hr - last.before.hr;
    if (delay >= 40)
      tips.push({
        tone: "coral",
        title: "Zenuwstelsel zwaar belast",
        text: `Je reactie was na je laatste sessie ${delay} ms trager. Plan 24–48 uur geen explosieve of technische training.`,
      });
    else if (lift >= 80)
      tips.push({
        tone: "sun",
        title: "Stevige cardiobelasting",
        text: `Je hartslag steeg +${lift} bpm. Drink goed, eet koolhydraten en houd morgen een rustige duurtraining.`,
      });
    else
      tips.push({
        tone: "mint",
        title: "Goed hersteld",
        text: "Je laatste sessie was goed te verwerken. Je kunt morgen gerust weer intensief trainen.",
      });
  }
  if (loadChange > 25)
    tips.push({
      tone: "coral",
      title: "Belasting stijgt snel",
      text: `Je trainingsbelasting is ${loadChange}% hoger dan de vorige 7 sessies. Bouw rustiger op om blessures te voorkomen.`,
    });
  else if (loadChange < -25)
    tips.push({
      tone: "mint",
      title: "Rustiger periode",
      text: `Je belasting is ${Math.abs(loadChange)}% lager. Ideaal om te herstellen, of voeg weer een pittige sessie toe.`,
    });
  if (baseLate && baseEarly)
    tips.push(
      baseLate <= baseEarly
        ? {
            tone: "mint",
            title: "Scherper in rust",
            text: `Je basis-reactiesnelheid verbeterde van ${baseEarly} naar ${baseLate} ms. Je slaapt en herstelt goed.`,
          }
        : {
            tone: "sun",
            title: "Basis wordt trager",
            text: `Je rust-reactiesnelheid ging van ${baseEarly} naar ${baseLate} ms. Let op slaap en stress.`,
          },
    );

  const TONE: Record<string, string> = {
    coral: "bg-coral/15 text-coral",
    sun: "bg-sun/25 text-sun-foreground",
    mint: "bg-mint/15 text-mint",
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
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em]">Analyse</p>
        <span className="size-10" />
      </header>

      <div className="px-5">
        <h1 className="font-display text-[30px] font-bold leading-[1.05]">Analyse & advies</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gebaseerd op {n} sessies.</p>
      </div>

      <div className="mt-4 space-y-4 px-5">
        <div className="space-y-2.5">
          {tips.map((t) => (
            <div key={t.title} className="rounded-2xl bg-card p-4 shadow-chunky-sm">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TONE[t.tone]}`}>
                {t.title}
              </span>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-card p-4 shadow-chunky">
            <p className="text-[11px] font-semibold text-muted-foreground">Belasting 7 sessies</p>
            <p className="mt-1 font-display text-[30px] font-bold leading-none tabular">{recentLoad}</p>
            <p className="text-[11px] font-medium text-muted-foreground tabular">
              {loadChange >= 0 ? "+" : ""}
              {loadChange}% t.o.v. ervoor
            </p>
          </div>
          <div className="rounded-3xl bg-card p-4 shadow-chunky">
            <p className="text-[11px] font-semibold text-muted-foreground">Basis-reactie</p>
            <p className="mt-1 font-display text-[30px] font-bold leading-none tabular">{baseLate}</p>
            <p className="text-[11px] font-medium text-muted-foreground tabular">
              ms (eerst {baseEarly})
            </p>
          </div>
        </div>

        <Card title="Cardio vs. zenuwstelsel" note="per sessie">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis type="number" dataKey="lift" name="Hartslagstijging" unit=" bpm" {...axis} />
                <YAxis type="number" dataKey="delay" name="Reactievertraging" unit=" ms" {...axis} />
                <ZAxis range={[80, 80]} />
                <Tooltip {...tooltipStyle} />
                <Scatter data={fatigue}>
                  {fatigue.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Rechts = zwaar voor je hart, boven = zwaar voor je zenuwstelsel. Punten rechtsboven vragen
            het meeste herstel.
          </p>
        </Card>

        <Card title="Intensiteit per activiteit" note="gemiddeld">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAct} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} {...axis} />
                <YAxis type="category" dataKey="activity" width={96} {...axis} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="avg" name="Gem. intensiteit" fill="var(--coral)" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
