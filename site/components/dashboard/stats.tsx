import { Activity, Database, ImageIcon, Users } from "lucide-react";

const STATS = [
  {
    icon: ImageIcon,
    label: "Media items",
    value: "24,381",
    delta: "+412 this week",
  },
  {
    icon: Database,
    label: "On disk",
    value: "412.4 GB",
    delta: "deduped 18.2 GB",
  },
  {
    icon: Users,
    label: "People",
    value: "38",
    delta: "12 named",
  },
  {
    icon: Activity,
    label: "AI queue",
    value: "73%",
    delta: "ETA 18m",
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card p-4 ring-soft"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <s.icon className="size-3.5 text-foreground" />
            {s.label}
          </div>
          <p className="mt-3 font-mono text-2xl tracking-tight text-foreground">
            {s.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{s.delta}</p>
        </div>
      ))}
    </div>
  );
}
