import { useDashboardStore } from '../store/dashboardStore'
import type { Provider } from '../types/provider'

interface Props {
  providers: Provider[]
}

const cellTypeOptions = [
  { value: '', label: 'All Cell Types' },
  { value: 'MUSE_dezawa', label: 'MUSE / Dezawa' },
  { value: 'umbilical_cord_msc', label: 'Umbilical Cord MSC' },
  { value: 'umbilical_cord_blood', label: 'Cord Blood HSC' },
  { value: 'bone_marrow', label: 'Bone Marrow MSC' },
  { value: 'adipose', label: 'Adipose MSC' },
  { value: 'spinal_cord_derived', label: 'Spinal Cord Derived' },
  { value: 'exosomes', label: 'Exosomes / EVs' },
  { value: 'fetal', label: 'Fetal Stem Cells' },
  { value: 'placental', label: 'Placental MSC' },
  { value: 'amniotic', label: 'Amniotic Derived' },
  { value: 'hematopoietic', label: 'Hematopoietic (HSC)' },
]

const evidenceOptions = [
  { value: '', label: 'All Evidence Levels' },
  { value: 'high', label: 'High Evidence' },
  { value: 'moderate', label: 'Moderate Evidence' },
  { value: 'low', label: 'Low Evidence' },
  { value: 'very_low', label: 'Very Low' },
  { value: 'unrated', label: 'Unrated / Research Only' },
]

const routeOptions = [
  { value: '', label: 'All Delivery Routes' },
  { value: 'iv', label: 'IV Infusion' },
  { value: 'intrathecal', label: 'Intrathecal (Spinal)' },
  { value: 'intranasal', label: 'Intranasal' },
  { value: 'intramuscular', label: 'Intramuscular' },
]

const fmtOptions = [
  { value: '', label: 'FMT: All' },
  { value: 'yes', label: 'Offers FMT' },
  { value: 'no', label: 'No FMT' },
]

const gmpOptions = [
  { value: '', label: 'GMP Lab: All' },
  { value: 'yes', label: 'Verified GMP Lab' },
  { value: 'claimed', label: 'Claimed GMP (Unverified)' },
  { value: 'no', label: 'No GMP Evidence' },
]

export function FilterBar({ providers }: Props) {
  const { filters, setFilter, resetFilters } = useDashboardStore()

  const countries = Array.from(new Set(providers.map((p) => p.location.country))).sort()

  const hasActive =
    filters.country !== '' ||
    filters.cellType !== '' ||
    filters.evidenceGrade !== '' ||
    filters.deliveryRoute !== '' ||
    filters.offersFMT !== '' ||
    filters.gmpCertifiedLab !== '' ||
    filters.maxCostUSD < 100000 ||
    filters.search !== ''

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
      <div className="flex gap-2 items-end min-w-max sm:flex-wrap sm:min-w-0">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Search</label>
          <input
            type="text"
            placeholder="Provider name or city..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Country</label>
          <select
            value={filters.country}
            onChange={(e) => setFilter('country', e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Cell Type</label>
          <select
            value={filters.cellType}
            onChange={(e) => setFilter('cellType', e.target.value as any)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {cellTypeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Delivery Route</label>
          <select
            value={filters.deliveryRoute}
            onChange={(e) => setFilter('deliveryRoute', e.target.value as any)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {routeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Evidence Level</label>
          <select
            value={filters.evidenceGrade}
            onChange={(e) => setFilter('evidenceGrade', e.target.value as any)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {evidenceOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">FMT</label>
          <select
            value={filters.offersFMT}
            onChange={(e) => setFilter('offersFMT', e.target.value as any)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {fmtOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">GMP Lab</label>
          <select
            value={filters.gmpCertifiedLab}
            onChange={(e) => setFilter('gmpCertifiedLab', e.target.value as any)}
            className="border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {gmpOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Max Cost: {filters.maxCostUSD >= 100000 ? 'Any' : `$${filters.maxCostUSD.toLocaleString()}`}
          </label>
          <input
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={filters.maxCostUSD}
            onChange={(e) => setFilter('maxCostUSD', Number(e.target.value))}
            className="w-32 accent-blue-500"
          />
        </div>

        {hasActive && (
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
