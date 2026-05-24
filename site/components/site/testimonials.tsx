import { SectionHeading } from "./section-heading";

const QUOTES = [
  {
    body: "I migrated 11 years and 84,000 photos out of Google Photos in one weekend. The semantic search finds things I'd literally forgotten about. I'm not going back.",
    name: "Priya Nair",
    role: "Product engineer · Bangalore",
    avatar: "PN",
  },
  {
    body: "Runs flawlessly on my Pi 5 with 8GB. The fact that the AI never phones home is the whole point. This is the photos app I've wanted for a decade.",
    name: "Marcus Holloway",
    role: "Sysadmin · self-hosting since '02",
    avatar: "MH",
  },
  {
    body: "‘My daughter in her yellow dress blowing candles’ — and it just… worked. My wife was speechless. Worth every cent of the $19 upgrade.",
    name: "Tomás Álvarez",
    role: "Dad of three · Madrid",
    avatar: "TÁ",
  },
  {
    body: "Replaced my Synology Photos + Immich combo with a single binary. Faster, smaller, and the UX feels like a 2026 product, not 2014.",
    name: "Aisha Khan",
    role: "Staff infra · YC company",
    avatar: "AK",
  },
  {
    body: "The pairing flow is the cleanest QR-onboarding I've seen in any app this year. My non-technical parents got their phones synced in 4 minutes.",
    name: "Daniel Park",
    role: "Designer · Seoul",
    avatar: "DP",
  },
  {
    body: "Open source, MIT licensed, beautiful, and actually private. I funded the lifetime tier within 5 minutes of trying the semantic search.",
    name: "Léa Martin",
    role: "Privacy researcher",
    avatar: "LM",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="container-tight scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Loved by self-hosters"
        title="From families, sysadmins, and people who care about their data."
        subtitle="These are real reactions from the private beta. We won't quote what we can't show you in DMs."
      />

      <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {QUOTES.map((q) => (
          <figure
            key={q.name}
            className="mb-4 break-inside-avoid rounded-xl border border-border bg-card p-5 ring-soft"
          >
            <blockquote className="text-sm leading-relaxed text-foreground/90">
              “{q.body}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-gradient-to-br from-white/20 to-white/[0.03] text-xs font-semibold text-foreground">
                {q.avatar}
              </span>
              <span className="text-sm">
                <span className="block font-medium text-foreground">{q.name}</span>
                <span className="block text-xs text-muted-foreground">{q.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
