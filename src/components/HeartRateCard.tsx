type Props = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  hint: string;
};

function zone(hr: number) {
  if (hr < 100) return { name: "Zone 1", tone: "text-mint bg-mint/10" };
  if (hr < 130) return { name: "Zone 2", tone: "text-sky bg-sky/10" };
  if (hr < 155) return { name: "Zone 3", tone: "text-sun-foreground bg-sun/25" };
  if (hr < 175) return { name: "Zone 4", tone: "text-coral bg-coral/10" };
  return { name: "Zone 5", tone: "text-coral bg-coral/20" };
}

export function HeartRateCard({ value, onChange, label, hint }: Props) {
  const z = zone(value);
  const clamp = (n: number) => Math.max(40, Math.min(210, n));

  return (
    <div className="rounded-3xl bg-card p-5 shadow-chunky">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-semibold">{label}</p>
        <span className="rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral">
          {hint}
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="font-display text-[56px] font-bold leading-none tabular">{value}</span>
        <span className="mb-1.5 text-sm font-semibold text-muted-foreground">bpm</span>
        <span
          className={`mb-1 ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${z.tone}`}
        >
          {z.name}
        </span>
      </div>

      <input
        type="range"
        min={40}
        max={210}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-4 h-2 w-full appearance-none rounded-full bg-muted accent-coral"
      />

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 5))}
          className="flex-1 rounded-2xl bg-muted py-3 font-display text-lg font-semibold"
        >
          −5
        </button>
        <button
          type="button"
          onClick={() => onChange(clamp(value + 5))}
          className="flex-1 rounded-2xl bg-coral py-3 font-display text-lg font-semibold text-coral-foreground shadow-chunky-sm"
        >
          +5
        </button>
      </div>
    </div>
  );
}
