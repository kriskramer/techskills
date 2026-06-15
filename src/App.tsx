import { backendServices, frontendStack, useAppStore, workflowStages } from './store/useAppStore'
import { functionsRegion, isFirebaseConfigured } from './lib/firebase'

function App() {
  const activeStage = useAppStore((state) => state.activeStage)
  const mode = useAppStore((state) => state.mode)
  const setActiveStage = useAppStore((state) => state.setActiveStage)
  const setMode = useAppStore((state) => state.setMode)

  const selectedStage = workflowStages.find((stage) => stage.id === activeStage) ?? workflowStages[0]

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-6 py-10 lg:px-10">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/40">
          <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                TechSkills app starter
              </p>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  React 18, Vite, Tailwind, Zustand, and Firebase aligned for a hiring workflow.
                </h1>
                <p className="max-w-2xl text-lg text-slate-300">
                  This starter focuses on candidate intake, test generation, scoring, and report delivery
                  with Firebase-managed data, storage, auth, functions, and hosting.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {(['recruiter', 'candidate'] as const).map((entryMode) => {
                  const selected = mode === entryMode

                  return (
                    <button
                      key={entryMode}
                      type="button"
                      onClick={() => setMode(entryMode)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? 'border-cyan-300 bg-cyan-300 text-slate-950'
                          : 'border-white/15 bg-slate-900/70 text-slate-200 hover:border-cyan-300/60'
                      }`}
                    >
                      {entryMode === 'recruiter' ? 'Recruiter workspace' : 'Candidate experience'}
                    </button>
                  )
                })}
              </div>
            </div>

            <aside className="rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-6">
              <p className="text-sm font-medium text-cyan-200">Firebase readiness</p>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-400">Configuration</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {isFirebaseConfigured ? 'Connected via Vite env vars' : 'Waiting for .env.local values'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-400">Cloud Functions region</p>
                  <p className="mt-2 text-lg font-semibold text-white">{functionsRegion}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-400">Active workflow stage</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedStage.title}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Frontend stack</h2>
                <p className="mt-2 text-sm text-slate-400">
                  The requested client stack is wired into the starter so the UI can scale quickly.
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                {frontendStack.length} choices
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              {frontendStack.map((item) => (
                <article key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.reason}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <h2 className="text-2xl font-semibold text-white">Firebase services</h2>
            <p className="mt-2 text-sm text-slate-400">
              These services cover data, execution, file storage, identity, and deployment.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {backendServices.map((service) => (
                <article key={service.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">{service.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Workflow orchestration</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Zustand manages the active workflow state while Firebase services provide persistence
                and backend execution for each stage.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Mode: <span className="font-semibold capitalize">{mode}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {workflowStages.map((stage, index) => {
                const active = stage.id === activeStage

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStage(stage.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-cyan-300 bg-cyan-300/10 shadow-lg shadow-cyan-950/40'
                        : 'border-white/10 bg-white/5 hover:border-cyan-300/40'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{stage.title}</h3>
                  </button>
                )
              })}
            </div>

            <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                {selectedStage.title}
              </p>
              <p className="mt-4 text-base leading-7 text-slate-300">{selectedStage.detail}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Primary data plane</p>
                  <p className="mt-2 font-semibold text-white">Firestore + Authentication</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Async processing</p>
                  <p className="mt-2 font-semibold text-white">Cloud Functions + Storage</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
