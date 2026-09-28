import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
      { title: "Graphs — PulsePop" },
      {
        name: "description",
        content:
          "Charts of your training intensity, heart-rate lift and reaction-speed trend across every logged session.",
      },
      { property: "og:title", content: "Graphs — PulsePop" },
      {
        property: "og:description",
        content: "Intensity, heart rate and reaction time trends over your training history.",
      },
    ],
  }),
  component: Stats,
});

const axis = {
  tick: { fontSize: 10, fill: "var(--muted-foreground)" },
  stroke: "var(--border)",
};

function ChartCard({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
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

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-8">
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <Link
          to="/"
          className="grid size-10 place-items-center rounded-2xl bg-card font-display text-lg font-bold shadow-chunky-sm"
        >
          ←
        </Link>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em]">Graphs</p>
        <span className="size-10" />
      </header>

      <div className="px-5">
        <h1 className="font-display text-[30px] font-bold leading-[1.05]">Your training trend</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.length} sessions of heart rate and reaction data.
        </p>
      </div>

      <div className="mt-4 space-y-4 px-5">
        <ChartCard title="Intensity" note="per session">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} {...axis} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="intensity" fill="var(--coral)" radius={[8, 8, 8, 8]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Heart rate" note="before vs after">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis domain={[40, 200]} {...axis} />
            <Tooltip {...tooltipStyle} />
            <Line
              type="monotone"
              dataKey="hrAfter"
              name="After"
              stroke="var(--coral)"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="hrBefore"
              name="Before"
              stroke="var(--sky)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Reaction speed" note="ms, lower is better">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="reactionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--mint)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--mint)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis domain={[200, 320]} {...axis} />
            <Tooltip {...tooltipStyle} />
            <Area
              type="monotone"
              dataKey="reactionBefore"
              name="Before"
              stroke="var(--mint)"
              strokeWidth={3}
              fill="url(#reactionFill)"
            />
            <Line
              type="monotone"
              dataKey="reactionAfter"
              name="After"
              stroke="var(--grape)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Heart-rate lift" note="after minus before">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" {...axis} interval="preserveStartEnd" />
            <YAxis {...axis} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="lift" fill="var(--sun)" radius={[8, 8, 8, 8]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-auto px-5 pb-6 pt-5">
        <Link
          to="/checkin"
          search={{ phase: "before" }}
          className="block w-full rounded-full bg-coral py-4 text-center font-display text-lg font-bold text-coral-foreground shadow-chunky-lg"
        >
          Start session
        </Link>
      </div>
    </div>
  );
}
