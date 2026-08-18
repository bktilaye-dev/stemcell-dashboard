import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { FilterBar } from './components/FilterBar'
import { ProviderTable } from './components/ProviderTable'
import { ProviderMap } from './components/ProviderMap'
import { RadarChart } from './components/RadarChart'
import { ProviderDetail } from './components/ProviderDetail'
import { ComparePanel } from './components/ComparePanel'
import { AdminPage } from './pages/AdminPage'
import { useDashboardStore } from './store/dashboardStore'
import type { Provider } from './types/provider'
import rawProviders from './data/providers.json'

const providers = rawProviders as Provider[]

function Dashboard() {
  const { filters, selectedIds, activeDetailId, compareMode } = useDashboardStore()

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (filters.country && p.location.country !== filters.country) return false
      if (filters.cellType && !p.cellTypes.includes(filters.cellType as any)) return false
      if (filters.evidenceGrade && p.evidence.gradeLevel !== filters.evidenceGrade) return false
      if (filters.deliveryRoute && !p.deliveryRoutes.includes(filters.deliveryRoute as any)) return false
      if (filters.offersFMT && (p.offersFMT ? 'yes' : 'no') !== filters.offersFMT) return false
      if (filters.gmpCertifiedLab && p.gmpCertifiedLab !== filters.gmpCertifiedLab) return false
      if (filters.maxCostUSD < 100000 && p.cost.minUSD > filters.maxCostUSD) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.location.city.toLowerCase().includes(q) && !p.location.country.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [filters])

  const selectedProviders = useMemo(
    () => selectedIds.map((id) => providers.find((p) => p.id === id)).filter(Boolean) as Provider[],
    [selectedIds]
  )

  const activeProvider = activeDetailId ? providers.find((p) => p.id === activeDetailId) : null
  const [mobileTab, setMobileTab] = useState<'list' | 'visual'>('list')

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 gap-3">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight truncate">StemCell Dashboard</h1>
          <p className="text-xs text-gray-500 hidden sm:block">Global provider comparison · Human stem cells only</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden md:flex gap-3 text-sm text-gray-500">
            <span><span className="font-semibold text-gray-800">{providers.length}</span> providers</span>
            <span><span className="font-semibold text-gray-800">{new Set(providers.map((p) => p.location.country)).size}</span> countries</span>
            <span><span className="font-semibold text-gray-800">{filtered.length}</span> visible</span>
          </div>
          <span className="text-xs font-bold tracking-widest text-blue-400 uppercase select-none hidden sm:inline">Made by Noah's Dad</span>
          <a
            href="/admin"
            className="px-2.5 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            + Add Provider
          </a>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar providers={providers} />

      {/* Mobile tab bar */}
      <div className="lg:hidden flex shrink-0 bg-white border-b border-gray-200">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${mobileTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          📋 Providers
        </button>
        <button
          onClick={() => setMobileTab('visual')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${mobileTab === 'visual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          🗺 Map &amp; Charts
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table — full width on mobile when list tab active, fixed left column on lg+ */}
        <div className={`flex-1 flex-col overflow-hidden border-r border-gray-200 ${mobileTab === 'list' ? 'flex' : 'hidden lg:flex'}`}>
          <ProviderTable providers={filtered} allProviders={providers} />
        </div>

        {/* Right: Map + Chart — full width on mobile when visual tab active, fixed sidebar on lg+ */}
        <div className={`flex-col shrink-0 w-full lg:w-96 ${mobileTab === 'visual' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 p-3 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">World Map</p>
            <div className="h-full">
              <ProviderMap providers={filtered} />
            </div>
          </div>
          {/* Legend */}
          <div className="px-3 py-2.5 border-b border-gray-200 bg-gray-50 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Study Links</p>
              <div className="space-y-1">
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">📚</span>
                  <span><span className="font-medium text-purple-700">Purple</span> — Independent peer-reviewed study for that cell type</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">📄</span>
                  <span><span className="font-medium text-blue-700">Blue</span> — Clinic's own published study</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">🔬</span>
                  <span><span className="font-medium text-blue-700">Blue</span> — Clinic's registered clinical trial</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">🔗</span>
                  <span><span className="font-medium text-blue-700">Blue</span> — Clinic's autism treatment page</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">MUSE Cell Claims</p>
              <div className="space-y-1">
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">✅</span>
                  <span><span className="font-medium text-green-700">Original Source</span> — Tohoku Univ. / Prof. Dezawa's lab</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">🔵</span>
                  <span><span className="font-medium text-blue-700">MCI Licensed</span> — Authorized by MuseCell Innovations®</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">⚠️</span>
                  <span><span className="font-medium text-yellow-700">Unconfirmed</span> — Claims collaboration, not independently verified</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="shrink-0">❌</span>
                  <span><span className="font-medium text-red-700">No License Found</span> — No evidence of authorization; likely violates IP</span>
                </div>
                <div className="mt-1 text-xs text-gray-400 leading-tight">Only Tohoku Univ. holds the patent. No MUSE cell trial for autism exists anywhere.</div>
              </div>
            </div>
          </div>

          <div className="h-72 p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Effectiveness Radar
              {selectedIds.length === 0 && <span className="font-normal text-gray-400"> — select providers to compare</span>}
            </p>
            <div className="h-60">
              <RadarChart providers={selectedProviders} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="shrink-0 bg-white border-t border-gray-200 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-1">
        <p className="text-xs text-gray-400 text-center sm:text-left">Personal research tool · Data sourced from public clinical records, provider websites, and peer-reviewed literature</p>
        <p className="text-xs font-bold tracking-widest text-blue-500 uppercase shrink-0">Made by Noah's Dad</p>
      </footer>

      {/* Detail Drawer */}
      {activeProvider && <ProviderDetail provider={activeProvider} />}

      {/* Compare Panel */}
      {compareMode && selectedProviders.length >= 2 && (
        <ComparePanel providers={selectedProviders} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}
