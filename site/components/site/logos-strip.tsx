const RUNS_ON = [
  "Raspberry Pi 5",
  "Synology",
  "Unraid",
  "TrueNAS",
  "Docker",
  "Mac mini",
  "Linux",
  "Windows",
];

export function LogosStrip() {
  return (
    <section className="container-tight -mt-2 pb-20">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
        Runs anywhere — even on a Pi
      </p>
      <div className="mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-80">
        {RUNS_ON.map((p) => (
          <span
            key={p}
            className="text-sm font-medium tracking-tight text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
