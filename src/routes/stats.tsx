import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSessions } from "@/hooks/use-sessions";
import { formatShort } from "@/lib/sessions";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Grafieken — PulsePop" },
      {
        name: "description",
        content:
          "Grafieken van je trainingsintensiteit, hartslagstijging en reactiesnelheid over al je sessies.",
      },
      { property: "og:title", content: "Grafieken — PulsePop" },
      {
        property: "og:description",
        content: "Trends in intensiteit, hartslag en reactietijd door je trainingsgeschiedenis.",
      },
    ],
  }),
  component: Stats,
});

const axis = {
  tick: { fontSize: 10, fill: "var(--muted-foreground)" },
  stroke: "var(--border)",
};

// Waardelabel boven elke staaf. Lettergrootte past zich aan de staafbreedte aan:
// totale tekstbreedte (0.62px per teken per pt) mag nooit breder zijn dan de staaf.
function BarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number | string;
}) {
  const { x, y, width, value } = props;
  if (value == null || x == null || y == null || !width) return null;
  const digits = String(Math.round(Number(value))).length;
  const fontSize = Math.max(6, Math.min(12, Math.floor(width / (digits * 0.62))));
  return (
    <text
      x={x + width / 2}
      y={y - 3}
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight={700}
      fill="var(--muted-foreground)"
      fontFamily="var(--font-body)"
    >
      {Math.round(Number(value))}
    </text>
  );
}

function ChartCard({
  title,
  note,
  children,
  footer,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-chunky">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold">{title}</p>
        <span className="text-[11px] font-semibold text-muted-foreground">{note}</span>
      </div>
      <div className="mt-3 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    borderRadius: 14,
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: 12,
    fontFamily: "var(--font-body)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: 11 },
};

function Stats() {
  const { scored } = useSessions();

  const data = scored.map((s) => ({
    label: formatShort(s.date),
    intensity: s.intensity,
    hrBefore: s.before.hr,
    hrAfter: s.after.hr,
    lift: s.after.hr - s.before.hr,
    reactionBefore: s.before.reaction,
    reactionAfter: s.after.reaction,
  }));

  const avgLift = data.length
    ? Math.round(data.reduce((a, d) => a + d.lift, 0) / data.length)
    : 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-8">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <Link
          to="/"
          className="grid size-10 place-items-center rounded-2xl bg-card font-display text-lg font-bold shadow-chunky-sm"
        >
          ←
        </Link>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em]">Grafieken</p>
        <span className="size-10" />
      </header>

      <div className="px-5">
        <h1 className="font-display text-[30px] font-bold leading-[1.05]">Jouw trainingstrend</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.length} sessies met hartslag- en reactiegegevens.
        </p>
      </div>

      <div className="mt-4 space-y-4 px-5">
        <ChartCard title="Intensiteit" note="per sessie">
          <BarChart data={data} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} {...axis} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="intensity" fill="var(--coral)" radius={[8, 8, 8, 8]}>
              <LabelList dataKey="intensity" content={<BarLabel />} />
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Hartslag" note="voor vs. na">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis domain={[40, 200]} {...axis} />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey="hrAfter"
              name="Na"
              stroke="var(--coral)"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="hrBefore"
              name="Voor"
              stroke="var(--sky)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Reactiesnelheid" note="ms, lager is beter">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="reactionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--mint)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="reactionAfterFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--grape)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--grape)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis domain={[200, 320]} {...axis} />
            <Tooltip {...tooltipStyle} />
            <Area
              type="monotone"
              dataKey="reactionBefore"
              name="Voor"
              stroke="var(--mint)"
              strokeWidth={3}
              fill="url(#reactionFill)"
            />
            <Area
              type="monotone"
              dataKey="reactionAfter"
              name="Na"
              stroke="var(--grape)"
              strokeWidth={2}
              fill="url(#reactionAfterFill)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard
          title="Hartslagstijging"
          note="na min voor"
          footer={
            <div className="rounded-2xl bg-muted p-4">
              <p className="font-display text-sm font-semibold">Wat is hartslagstijging?</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                De hartslagstijging is het verschil tussen je hartslag direct na de training en je
                hartslag ervoor. Begin je op 64 bpm en eindig je op 152 bpm, dan is je stijging +88
                bpm. Hoe hoger de staaf, hoe harder je hart moest werken vergeleken met je rustpunt
                van die dag. Omdat we van jouw eigen startpunt uitgaan, blijft het eerlijk
                vergelijken op dagen dat je al opgejaagd of juist heel rustig begint. Deze stijging
                weegt het zwaarst mee in je intensiteitsscore.
              </p>
              <p className="mt-2 text-[12px] font-semibold text-coral tabular">
                Jouw gemiddelde: +{avgLift} bpm per sessie
              </p>
            </div>
          }
        >
          <BarChart data={data} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis {...axis} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="lift" fill="var(--sun)" radius={[8, 8, 8, 8]}>
              <LabelList dataKey="lift" content={<BarLabel />} />
            </Bar>
          </BarChart>
        </ChartCard>
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
