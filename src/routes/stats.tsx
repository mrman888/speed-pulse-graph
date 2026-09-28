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
  component: Stats;
});

function Stats() {
  return null;
}
