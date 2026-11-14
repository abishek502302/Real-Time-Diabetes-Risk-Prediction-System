import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  HeartPulse,
  Mail,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react"

const teamMembers = [
  { name: "Thabith Atlas X", email: "thabith.502359@sxcce.edu.in", role: "Team lead" },
  { name: "Abishek S V", email: "abishek.502302@sxcce.edu.in", role: "Team member" },
  { name: "Jerish Moni M", email: "jerish.502327@sxcce.edu.in", role: "Team member" },
  { name: "Starwin Binesh S S", email: "starwin.502355@sxcce.edu.in", role: "Team member" },
]

const projectTitle =
  "Web-Based Explainable Machine Learning Framework for Diabetes Risk Prediction Using SHAP-Based Recommendations"

export default function ContactPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-primary/12 via-background to-accent/10"
      />

      <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 px-6 py-9 shadow-sm backdrop-blur sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-primary/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-5 -top-12 h-52 w-52 rounded-full border border-accent/15"
          />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              THE PEOPLE BEHIND THE PROJECT
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Thoughtful technology,
              <span className="text-primary"> built together.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Meet the student team bringing explainable machine learning to
              diabetes risk awareness. We&apos;d love to hear your questions,
              ideas, and feedback.
            </p>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <section aria-labelledby="team-heading">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Collaborators
                  </p>
                  <h2 id="team-heading" className="mt-1 text-2xl font-semibold tracking-tight">
                    The project team
                  </h2>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  04 members
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {teamMembers.map((member, index) => (
                  <article
                    key={member.email}
                    className="group rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {member.role}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold">{member.name}</h3>
                    <a
                      href={`mailto:${member.email}`}
                      className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                      {index === 0 && <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />}
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="project-heading"
              className="overflow-hidden rounded-2xl border border-border/70 bg-card"
            >
              <div className="border-b border-border/70 bg-muted/30 px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Research project
                </p>
                <h2 id="project-heading" className="mt-1 text-xl font-semibold tracking-tight">
                  Project overview
                </h2>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project title</p>
                    <p className="mt-1 leading-6">{projectTitle}</p>
                  </div>
                </div>
                <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-2">
                  <div className="flex gap-3">
                    <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Institution</p>
                      <p className="mt-1 text-sm font-medium leading-5">
                        St Xavier&apos;s Catholic College of Engineering
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Programme</p>
                      <p className="mt-1 text-sm font-medium">B.Tech Information Technology</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Academic year</p>
                      <p className="mt-1 text-sm font-medium">2025–2026</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="mt-1 text-sm font-medium">Nagercoil</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-primary/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Project guide
                  </p>
                  <p className="mt-1 font-medium">Dr Arul Rex</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
              <div className="bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">Let&apos;s talk</h2>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/85">
                  Have a question about the project or a suggestion to share? Send
                  our team a note.
                </p>
                <a
                  href={`mailto:${teamMembers[0].email}?subject=${encodeURIComponent("DiabetesPredict project enquiry")}`}
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Email the team
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <div className="space-y-3 p-5 sm:p-6">
                <p className="text-sm font-medium">What we welcome</p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    Questions about our approach and explainability
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    Feedback on the application experience
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    Ideas for future improvements
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-border/70 bg-muted/30 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                With appreciation
              </p>
              <h2 className="mt-2 text-lg font-semibold">Built with guidance</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                We are grateful to our project guide, Dr Arul Rex, for his
                guidance and support, and to the open-source community whose
                tools help make this work possible.
              </p>
            </section>

            <p className="px-1 text-xs leading-5 text-muted-foreground">
              This project is for educational purposes and is not a substitute
              for professional medical advice or diagnosis.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
