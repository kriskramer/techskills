import { useState } from 'react'
import { Card } from '../../components/shared/Card'

type WhatWeDoTab = 'technical' | 'cognitive' | 'personality'

const TABS: { id: WhatWeDoTab; label: string }[] = [
  { id: 'technical', label: 'Technical' },
  { id: 'cognitive', label: 'Cognitive' },
  { id: 'personality', label: 'Personality' },
]

const DIFFERENTIATORS = [
  { label: 'Assessment type', us: 'Practical work-sample', them: 'Algorithmic puzzles' },
  { label: 'Question count', us: '50–75 rapid-fire', them: '1–3 complex problems' },
  { label: 'Time commitment', us: '25-30 min', them: '2–3 hours' },
  { label: 'Completion rate', us: 'Target 80%+', them: '68–72%' },
  { label: 'Focus', us: 'Skills from the resume', them: 'Generic question banks' },
]

const TECHNICAL_STEPS = [
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

const PERSONALITY_HIGHLIGHTS = [
  {
    stat: 'ρ ≈ 0.20',
    title: 'Conscientiousness predicts execution',
    description:
      'The most consistent Big Five predictor of job performance — follow-through, attention to detail, and reliability under deadlines.',
  },
  {
    stat: 'ρ ≈ 0.28',
    title: 'Values fit drives retention',
    description:
      'Person–organization fit correlates with satisfaction and lower turnover intent — reducing costly mis-hires before the ramp investment.',
  },
  {
    stat: 'ρ ≈ −0.48',
    title: 'Integrity flags risk early',
    description:
      'HEXACO Honesty-Humility is the strongest personality predictor of counterproductive work behavior — critical in trust-heavy engineering roles.',
  },
]

const PERSONALITY_STEPS = [
  {
    title: 'Bundle with technical tests',
    description:
      'Send skills and personality assessments together. Separate technical brilliance from teamwork, integrity, and work-style signals.',
  },
  {
    title: 'Measure validated traits',
    description:
      'HEXACO dimensions plus achievement, autonomy, and collaboration motivation — evidence-backed instruments, not personality-type quizzes.',
  },
  {
    title: 'Align on values, add diversity',
    description:
      'Use scores to check non-negotiables like accountability and collaboration — then seek complementary strengths, not clones.',
  },
  {
    title: 'Inform interviews, not auto-reject',
    description:
      'Treat personality as one input among many. Probe flagged areas in structured behavioral interviews rather than filtering on traits alone.',
  },
]

const INTERVIEW_GAPS = [
  {
    problem: 'Interviewers overweight charisma and similarity',
    solution: 'Standardized, comparable scores across every candidate',
  },
  {
    problem: 'Technical brilliance masks poor teamwork',
    solution: 'Separate technical and behavioral signals in bundled assessments',
  },
  {
    problem: '"Culture" means "would I get a beer with them?"',
    solution: 'Values and motivation measured against defined dimensions',
  },
  {
    problem: 'Post-hire surprises on reliability or ethics',
    solution: 'Conscientiousness and honesty-humility flag counterproductive behavior risk',
  },
]

const CULTURE_APPROACHES = [
  { approach: 'Culture fit (naive)', question: '"Do they feel like us?"', risk: 'Homogeneity, groupthink, exclusion', upside: 'Faster social integration' },
  {
    approach: 'Culture add (structured)',
    question: '"Do they share our values, and what do they bring we lack?"',
    risk: 'Requires upfront values definition',
    upside: 'Innovation, cognitive diversity, stronger teams',
  },
]

export function WhatWeDoPage() {
  const [activeTab, setActiveTab] = useState<WhatWeDoTab>('technical')

  return (
    <div className="space-y-8">
      <div className="flex gap-1 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-cyan-300 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'technical' && <TechnicalTabContent />}
      {activeTab === 'cognitive' && <CognitiveTabContent />}
      {activeTab === 'personality' && <PersonalityTabContent />}
    </div>
  )
}

function TechnicalTabContent() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What we do</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
          Practical skills assessment that reflects real work — not algorithmic puzzles.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Praxis helps recruiters validate what candidates actually know. We analyze resumes, generate role-relevant
          tests, and deliver rapid-fire assessments that predict on-the-job performance better than traditional coding
          platforms.
        </p>
        <p className="max-w-2xl text-lg text-slate-300">
          We ensure that the candidate knows what their resume claims they know.
        </p>
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
          {TECHNICAL_STEPS.map((step, index) => (
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

function CognitiveTabContent() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Coming soon</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
          Cognitive assessments to complement skills and personality.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          We're researching and developing cognitive test modules that measure reasoning, problem-solving under pressure,
          and role-relevant analytical ability — designed to work alongside our technical and personality assessments,
          not replace them.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="space-y-2 opacity-60">
          <p className="text-3xl font-bold text-slate-500">—</p>
          <p className="text-sm font-medium text-white">Reasoning & problem-solving</p>
          <p className="text-sm text-slate-400">
            Structured measures of analytical performance under realistic time constraints.
          </p>
        </Card>
        <Card className="space-y-2 opacity-60">
          <p className="text-3xl font-bold text-slate-500">—</p>
          <p className="text-sm font-medium text-white">Role-relevant cognition</p>
          <p className="text-sm text-slate-400">
            Tests aligned to engineering contexts — not abstract puzzles disconnected from the work.
          </p>
        </Card>
        <Card className="space-y-2 opacity-60">
          <p className="text-3xl font-bold text-slate-500">—</p>
          <p className="text-sm font-medium text-white">Bundled hiring signal</p>
          <p className="text-sm text-slate-400">
            Combined with technical skills and work-style data for a fuller picture of candidate fit.
          </p>
        </Card>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8">
        <h2 className="text-xl font-semibold text-white">In development</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          Cognitive testing is on our roadmap. We're reviewing the research on cognitive ability in technical hiring,
          validating instrument design, and building modules that integrate with the same invite-and-review workflow
          you use today for skills and personality assessments. Check back as this capability rolls out.
        </p>
      </section>
    </div>
  )
}

function PersonalityTabContent() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What we do</p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
          Work-style assessments that predict how engineers work — not who they'd grab a beer with.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Personality data adds signal that technical tests miss: conscientious execution, collaborative citizenship,
          integrity under pressure, and fit with role demands. Effects are modest individually but compound across hires
          — and outperform unstructured interviews when combined with skills testing.
        </p>
        <p className="max-w-2xl text-lg text-slate-300">
          We use validated HEXACO-based instruments, never personality-type quizzes — one input among many, never a
          sole hiring gate.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {PERSONALITY_HIGHLIGHTS.map((item) => (
          <Card key={item.title} className="space-y-2">
            <p className="text-3xl font-bold text-cyan-300">{item.stat}</p>
            <p className="text-sm font-medium text-white">{item.title}</p>
            <p className="text-sm text-slate-400">{item.description}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Why personality matters in engineering hiring</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            Software engineering is collaborative, trust-heavy, and execution-driven. Research supports personality as
            a complement to technical assessment — not a replacement.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h3 className="font-semibold text-white">Productivity signal</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Conscientiousness maps to code review follow-through, testing discipline, and incident response.</li>
              <li>Agreeableness predicts mentoring, knowledge sharing, and constructive collaboration.</li>
              <li>Openness supports learning-intensive roles — architecture, R&D, and rapid technology adoption.</li>
              <li>Emotional stability matters for on-call, high-stakes releases, and sustained analytical performance.</li>
            </ul>
          </Card>
          <Card className="space-y-3">
            <h3 className="font-semibold text-white">Culture & retention signal</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Values alignment reduces mis-hires before expensive ramp investments.</li>
              <li>Honesty-Humility flags integrity risks in environments with privileged system access.</li>
              <li>Motivation fit (autonomy, achievement, collaboration) predicts day-to-day friction and attrition.</li>
              <li>Complementary team profiles beat homogeneous "culture fit" hiring every time.</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Our approach</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            PracticalSkills bundles HEXACO personality and motivation facets alongside technical tests — structured,
            evidence-backed, and designed for culture add within a values framework.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONALITY_STEPS.map((step, index) => (
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
          <h2 className="text-2xl font-semibold text-white">Where interviews fall short</h2>
          <p className="mt-2 text-slate-400">
            Structured personality data addresses gaps that unstructured hiring often misses.
          </p>
        </div>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4 font-medium">Interview gap</th>
                <th className="px-5 py-4 font-medium text-cyan-300">How personality assessment helps</th>
              </tr>
            </thead>
            <tbody>
              {INTERVIEW_GAPS.map((row) => (
                <tr key={row.problem} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-200">{row.problem}</td>
                  <td className="px-5 py-3 text-cyan-100">{row.solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Culture fit vs. culture add</h2>
          <p className="mt-2 max-w-3xl text-slate-400">
            The biggest culture risk isn't using personality tests — it's using them to hire similarity rather than
            shared values plus complementary strengths.
          </p>
        </div>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4 font-medium">Approach</th>
                <th className="px-5 py-4 font-medium">Question asked</th>
                <th className="px-5 py-4 font-medium">Risk</th>
                <th className="px-5 py-4 font-medium text-cyan-300">Upside</th>
              </tr>
            </thead>
            <tbody>
              {CULTURE_APPROACHES.map((row) => (
                <tr key={row.approach} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-200">{row.approach}</td>
                  <td className="px-5 py-3 text-slate-300">{row.question}</td>
                  <td className="px-5 py-3 text-slate-400">{row.risk}</td>
                  <td className="px-5 py-3 text-cyan-100">{row.upside}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 px-6 py-8">
        <h2 className="text-xl font-semibold text-white">The bottom line</h2>
        <p className="mt-3 max-w-3xl text-slate-300">
          Personality tests help predict conscientious execution, collaborative citizenship, stress tolerance, and fit
          with role demands — factors technical assessments miss but that strongly affect sprint throughput, code
          quality, and retention. Used as one input alongside skills testing and structured interviews, validated
          assessments support better hires and stronger teams. Used as vague "vibe matching," they cause harm.
        </p>
      </section>
    </div>
  )
}
