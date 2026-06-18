import { Card } from '../../components/shared/Card'

const DIFFERENTIATORS = [
  { label: 'Assessment type', us: 'Practical work-sample', them: 'Algorithmic puzzles' },
  { label: 'Question count', us: '50–75 rapid-fire', them: '1–3 complex problems' },
  { label: 'Time commitment', us: '25-30 min', them: '2–3 hours' },
  { label: 'Completion rate', us: 'Target 80%+', them: '68–72%' },
  { label: 'Focus', us: 'Skills from the resume', them: 'Generic question banks' },
]

const STEPS = [
  {
    title: 'Upload a resume',
    description:
      'Paste a candidate resume. We extract technical skills, rank them by recency and frequency, and build a structured skills profile.',
  },
  {
    title: 'Customize the test',
    description:
      'Review the skills profile, adjust what to assess, and generate a test profile weighted toward the skills that matter for the role.',
  },
  {
    title: 'Send an invite',
    description:
      'Share a unique link with the candidate. No account required — they land directly in a timed, practical assessment.',
  },
  {
    title: 'Review results instantly',
    description:
      'See overall scores, skill breakdowns, and how test performance compares to resume claims — so you can hire with confidence.',
  },
]

export function WhatWeDoPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What we do</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
          Practical skills assessment that reflects real work — not algorithmic puzzles.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Praxis helps recruiters validate what candidates actually know. We analyze resumes, generate
          role-relevant tests, and deliver rapid-fire assessments that predict on-the-job performance better than
          traditional coding platforms.
        </p>
        <p className="max-w-2xl text-lg text-slate-300">We ensure that the candidate knows what their resume claims they know.</p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-3xl font-bold text-cyan-300">80%+</p>
          <p className="text-sm font-medium text-white">Target completion rate</p>
          <p className="text-sm text-slate-400">
            Shorter, practical assessments keep top candidates engaged instead of abandoning a 3-hour test.
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-3xl font-bold text-cyan-300">25-30 min</p>
          <p className="text-sm font-medium text-white">Typical assessment time</p>
          <p className="text-sm text-slate-400">
            Fifty to seventy-five rapid-fire questions with a tight per-question timer — enough signal without the
            marathon.
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-3xl font-bold text-cyan-300">Resume-first</p>
          <p className="text-sm font-medium text-white">Tests match claimed skills</p>
          <p className="text-sm text-slate-400">
            Every assessment is built from the candidate's resume so you can verify claims, not guess at relevance.
          </p>
        </Card>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">The problem we solve</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            Most technical assessments weren't built for how engineers actually work.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h3 className="font-semibold text-white">For recruiters</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Resume claims are hard to verify before the interview loop.</li>
              <li>Enterprise platforms are expensive and slow to set up.</li>
              <li>Top candidates won't spend hours on algorithmic puzzles.</li>
              <li>One or two complex questions don't give enough signal.</li>
            </ul>
          </Card>
          <Card className="space-y-3">
            <h3 className="font-semibold text-white">For candidates</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>LeetCode-style tests rarely reflect day-to-day work.</li>
              <li>Long assessments compete with other offers.</li>
              <li>Generic question banks don't match the role they applied for.</li>
              <li>Practical knowledge gets overlooked in favor of abstract reasoning.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Our approach</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            Work-sample tests validate job performance better than algorithmic challenges. PracticalSkills is built
            around that research — practical questions, short timers, and tests tailored to each candidate's background.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Card key={step.title} className="space-y-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-sm font-semibold text-cyan-300">
                {index + 1}
              </span>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Why Praxis</h2>
          <p className="mt-2 text-slate-400">Built for mid-market teams who need fast, affordable, relevant screening.</p>
        </div>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4 font-medium">Aspect</th>
                <th className="px-5 py-4 font-medium text-cyan-300">PracticalSkills</th>
                <th className="px-5 py-4 font-medium">Typical platforms</th>
              </tr>
            </thead>
            <tbody>
              {DIFFERENTIATORS.map((row) => (
                <tr key={row.label} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-200">{row.label}</td>
                  <td className="px-5 py-3 text-cyan-100">{row.us}</td>
                  <td className="px-5 py-3 text-slate-400">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 px-6 py-8">
        <h2 className="text-xl font-semibold text-white">Our mission</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          Make technical hiring faster, fairer, and more predictive. We believe assessments should mirror the skills
          people use on the job — validated against resume claims, completed in under an hour, and accessible to
          growing teams without enterprise pricing or enterprise complexity.
        </p>
      </section>
    </div>
  )
}
