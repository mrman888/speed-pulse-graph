export type Reading = {
  /** hartslag in bpm */
  hr: number;
  /** gemiddelde reactietijd in ms */
  reaction: number;
};

export type Session = {
  id: string;
  /** ISO datum string */
  date: string;
  activity: string;
  /** minuten */
  duration: number;
  before: Reading;
  after: Reading;
};

export type ScoredSession = Session & {
  intensity: number;
  band: "Laag" | "Gemiddeld" | "Hoog";
};

const ACTIVITIES = [
  "HIIT Circuit",
  "Ochtendloop",
  "Yoga Flow",
  "Sprintintervallen",
  "Heuveltraining",
  "Krachttraining",
  "Spinningles",
  "Tempoloop",
];

export const ACTIVITY_OPTIONS = ACTIVITIES;

/**
 * Intensiteit 0-100 op basis van hoe hoog de hartslag klom plus hoeveel de
 * reactietest verslechterde (vermoeidheid) tijdens de sessie.
 */
export function intensityScore(s: Session): number {
  const hrLift = Math.max(0, s.after.hr - s.before.hr); // 0..120
  const fatigue = Math.max(0, s.after.reaction - s.before.reaction); // 0..120
  const durationWeight = Math.min(1, s.duration / 60);
  const raw = (hrLift / 110) * 62 + (fatigue / 110) * 23 + durationWeight * 15;
  return Math.max(1, Math.min(100, Math.round(raw)));
}

export function band(intensity: number): ScoredSession["band"] {
  if (intensity >= 72) return "Hoog";
  if (intensity >= 45) return "Gemiddeld";
  return "Laag";
}


export function score(s: Session): ScoredSession {
  const intensity = intensityScore(s);
  return { ...s, intensity, band: band(intensity) };
}

export function initials(activity: string): string {
  const parts = activity.trim().split(/\s+/);
  const letters =
    parts.length > 1 ? (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "") : activity.slice(0, 2);
  return letters.toUpperCase();
}

export function bandColor(b: ScoredSession["band"]): string {
  if (b === "Hoog") return "coral";
  if (b === "Gemiddeld") return "sun";
  return "mint";
}

function iso(daysAgo: number, hour: number) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

/** 14 voorgevulde demo-sessies, nieuwste als laatste. */
export function mockSessions(): Session[] {
  const specs: Array<[number, number, string, number, number, number, number, number]> = [
    // dagenTerug, uur, activiteit, duur, hrVoor, hrNa, reactieVoor, reactieNa
    [27, 7, "Ochtendloop", 35, 64, 148, 258, 279],
    [25, 18, "HIIT Circuit", 40, 71, 176, 244, 291],
    [23, 8, "Yoga Flow", 45, 62, 96, 266, 251],
    [21, 19, "Krachttraining", 55, 68, 152, 251, 276],
    [18, 7, "Sprintintervallen", 30, 66, 183, 238, 288],
    [16, 18, "Spinningles", 45, 70, 168, 249, 272],
    [14, 8, "Tempoloop", 38, 63, 159, 243, 266],
    [11, 7, "Heuveltraining", 42, 67, 188, 236, 294],
    [9, 20, "Yoga Flow", 50, 61, 99, 259, 244],
    [7, 18, "HIIT Circuit", 38, 69, 174, 232, 281],
    [5, 7, "Ochtendloop", 40, 64, 152, 241, 262],
    [3, 19, "Krachttraining", 50, 66, 146, 238, 268],
    [2, 7, "Sprintintervallen", 28, 68, 181, 229, 284],
    [1, 18, "Tempoloop", 42, 62, 163, 226, 254],
  ];


  return specs.map(([d, h, activity, duration, hb, ha, rb, ra], i) => ({
    id: `mock-${i}`,
    date: iso(d, h),
    activity,
    duration,
    before: { hr: hb, reaction: rb },
    after: { hr: ha, reaction: ra },
  }));
}

const KEY = "pulsepop.sessions.v2";

export function loadSessions(): Session[] {
  if (typeof window === "undefined") return mockSessions();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const seeded = mockSessions();
      window.localStorage.setItem(KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Session[];
    return Array.isArray(parsed) && parsed.length ? parsed : mockSessions();
  } catch {
    return mockSessions();
  }
}

export function saveSessions(sessions: Session[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    /* storage unavailable */
  }
}

export function formatDay(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatShort(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}
