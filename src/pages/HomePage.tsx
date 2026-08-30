import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Trophy, Users } from "lucide-react";
import { Badge, Card, EmptyState, Spinner } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useAsync, fetchTournaments } from "../lib/data";
import { formatDate, STATUS_LABELS, statusTone } from "../lib/utils";
import type { Tournament } from "../lib/types";

export function HomePage() {
  const { profile } = useAuth();
  const { data: tournaments, loading } = useAsync(() => fetchTournaments(), []);

  const featured = (tournaments ?? []).filter((t) => t.featured);
  const open = (tournaments ?? []).filter((t) =>
    ["registration", "draw", "ongoing"].includes(t.status),
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-felt-glow">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Badge tone="green" className="mb-4">
              Cue-sports tournament platform
            </Badge>
            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Run tournaments that feel{" "}
              <span className="text-primary">professional</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted">
              Registrations, live brackets, scheduling and real-time scoring for pool, snooker and
              English billiards — all in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/tournaments"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-semibold text-on-primary cursor-pointer transition-all duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
              >
                Browse tournaments <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {!profile && (
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-border px-6 font-semibold text-foreground cursor-pointer transition-all duration-150 ease-out hover:border-primary/50 active:scale-[0.97]"
                >
                  Create a free account
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Trophy, label: "Draw engine", value: "Seeded brackets" },
              { icon: Users, label: "Self-registration", value: "Instant entry" },
              { icon: Calendar, label: "Scheduling", value: "Tables & rounds" },
              { icon: MapPin, label: "Live scoring", value: "Break-by-break" },
            ].map((f) => (
              <Card key={f.label} className="p-5">
                <f.icon className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                <p className="font-heading text-sm font-bold text-foreground">{f.label}</p>
                <p className="text-sm text-muted">{f.value}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {loading ? (
        <Spinner label="Loading tournaments…" />
      ) : featured.length === 0 && open.length === 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="No tournaments yet"
            message="Tournaments will appear here as soon as they're published. Check back soon!"
          />
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-extrabold">Upcoming tournaments</h2>
            <Link
              to="/tournaments"
              className="flex items-center gap-1 text-sm font-semibold text-primary cursor-pointer hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {open.slice(0, 6).map((t) => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function TournamentCard({ tournament: t }: { tournament: Tournament & { disciplines?: { name: string; color: string | null; icon: string | null } | null } }) {
  return (
    <Card hover className="flex flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <Badge tone={statusTone(t.status)}>{STATUS_LABELS[t.status]}</Badge>
        {t.featured && <Badge tone="amber">Featured</Badge>}
      </div>
      <h3 className="font-heading text-lg font-bold leading-snug text-foreground">
        <Link to={`/tournaments/${t.slug}`} className="cursor-pointer hover:text-primary">
          {t.name}
        </Link>
      </h3>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {t.disciplines && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
            style={{ backgroundColor: `${t.disciplines.color ?? "#888"}22`, color: t.disciplines.color ?? "inherit" }}
          >
            {t.disciplines.name}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 font-semibold text-muted">
          <MapPin className="h-3 w-3" aria-hidden="true" /> {t.venue ?? "TBD"}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          {t.start_date ? formatDate(t.start_date) : "TBD"}
        </span>
        <span>{t.draw_size} players</span>
      </div>
      <Link
        to={`/tournaments/${t.slug}`}
        className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-surface-2 text-sm font-semibold text-foreground cursor-pointer transition-all duration-150 hover:bg-primary hover:text-on-primary active:scale-[0.97]"
      >
        View tournament <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
