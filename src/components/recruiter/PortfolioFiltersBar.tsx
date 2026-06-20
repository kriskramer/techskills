import type { PortfolioFilters, PortfolioStatusFilter } from '../../lib/portfolioFilters'
import { DEFAULT_PORTFOLIO_FILTERS } from '../../lib/portfolioFilters'
import { Card } from '../shared/Card'

const STATUS_TABS: { value: PortfolioStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'analyzed', label: 'Analyzed' },
  { value: 'invited', label: 'Invited' },
  { value: 'completed', label: 'Completed' },
]

interface PortfolioFiltersBarProps {
  filters: PortfolioFilters
  hiringCompanies: string[]
  onChange: (filters: PortfolioFilters) => void
}

export function PortfolioFiltersBar({ filters, hiringCompanies, onChange }: PortfolioFiltersBarProps) {
  function update<K extends keyof PortfolioFilters>(key: K, value: PortfolioFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => update('status', tab.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filters.status === tab.value
                ? 'border border-cyan-300/50 bg-cyan-300/10 text-cyan-200'
                : 'border border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-[200px] flex-1 space-y-2">
          <label htmlFor="portfolio-search" className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Search
          </label>
          <input
            id="portfolio-search"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Name or email…"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300 placeholder:text-slate-600"
          />
        </div>

        <div className="min-w-[180px] space-y-2">
          <label htmlFor="portfolio-company" className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Hiring company
          </label>
          <select
            id="portfolio-company"
            value={filters.hiringCompany}
            onChange={(event) => update('hiringCompany', event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-white outline-none focus:border-cyan-300"
          >
            <option value="">All companies</option>
            {hiringCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={filters.showArchived}
            onChange={(event) => update('showArchived', event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-950/60 accent-cyan-300"
          />
          <span className="text-sm text-slate-300">Show archived candidates</span>
        </label>

        {(filters.status !== DEFAULT_PORTFOLIO_FILTERS.status ||
          filters.search ||
          filters.hiringCompany ||
          filters.showArchived) && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => onChange(DEFAULT_PORTFOLIO_FILTERS)}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-white/40 hover:text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}