import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import type { Provider, CellType, MuseClaimStatus, MuseCellClaim, GmpLabStatus } from '../types/provider'
import { CellTypeBadge, RouteBadge } from './CellTypeBadge'
import { StarRating } from './StarRating'
import { CertBadge, coaScore } from './CertBadge'
import { useDashboardStore } from '../store/dashboardStore'
import cellTypeStudiesRaw from '../data/cellTypeStudies.json'

interface CellTypeStudy {
  title: string
  journal: string
  year: number
  url: string
  note: string
}
const cellTypeStudies = cellTypeStudiesRaw as Record<string, CellTypeStudy>

const MUSE_STATUS_CONFIG: Record<MuseClaimStatus, { label: string; bg: string; text: string; icon: string }> = {
  legitimate_source: { label: 'Original Source',    bg: 'bg-green-100',  text: 'text-green-800',  icon: '✅' },
  licensed:          { label: 'MCI Licensed',        bg: 'bg-blue-100',   text: 'text-blue-800',   icon: '🔵' },
  claim_unverified:  { label: 'Claimed — Unconfirmed', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚠️' },
  no_license_found:  { label: 'No License Found',   bg: 'bg-red-100',    text: 'text-red-800',    icon: '❌' },
}

const GMP_STATUS_CONFIG: Record<GmpLabStatus, { label: string; classes: string }> = {
  yes:     { label: 'Yes',     classes: 'bg-green-100 text-green-800 border-green-200' },
  claimed: { label: 'Claimed', classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  no:      { label: 'No',      classes: 'bg-gray-100 text-gray-500 border-gray-200' },
}

function MuseClaimCell({ claim }: { claim: MuseCellClaim | undefined }) {
  const [expanded, setExpanded] = useState(false)
  if (!claim) return <span className="text-gray-300 text-xs">—</span>
  const cfg = MUSE_STATUS_CONFIG[claim.status]
  return (
    <div className="space-y-1 min-w-[160px] max-w-[240px]">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <span>{cfg.icon}</span>
        {cfg.label}
      </span>
      {claim.licensePartner && (
        <div className="text-xs text-gray-500 leading-tight">{claim.licensePartner}</div>
      )}
      {claim.verificationSource && (
        <a
          href={claim.verificationSource}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline block"
        >
          Source ↗
        </a>
      )}
      <div>
        <p className={`text-xs text-gray-600 leading-snug ${expanded ? '' : 'line-clamp-3'}`}>
          {claim.notes}
        </p>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-blue-500 hover:text-blue-700 mt-0.5 font-medium"
        >
          {expanded ? 'Show less ↑' : 'Show more ↓'}
        </button>
      </div>
    </div>
  )
}

const col = createColumnHelper<Provider>()

interface Props {
  providers: Provider[]
  allProviders: Provider[]
}

export function ProviderTable({ providers, allProviders }: Props) {
  const { filters, selectedIds, toggleSelected, setActiveDetail, setCompareMode } = useDashboardStore()
  const [sorting, setSorting] = useState<SortingState>([])

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
  }, [providers, filters])

  const columns = useMemo(
    () => [
      col.display({
        id: 'select',
        header: '',
        cell: ({ row }) => {
          const p = row.original
          const checked = selectedIds.includes(p.id)
          const disabled = !checked && selectedIds.length >= 3
          return (
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => toggleSelected(p.id)}
              className="w-4 h-4 accent-blue-600 cursor-pointer disabled:opacity-30"
              title={disabled ? 'Max 3 providers can be compared at once' : 'Select to compare'}
            />
          )
        },
        size: 40,
      }),
      col.accessor('name', {
        header: 'Provider',
        cell: ({ row }) => (
          <button
            onClick={() => setActiveDetail(row.original.id)}
            className="text-left font-medium text-blue-700 hover:underline leading-tight"
          >
            {row.original.name}
          </button>
        ),
      }),
      col.accessor((p) => p.location.country, {
        id: 'country',
        header: 'Country',
        cell: ({ row }) => (
          <div>
            <div className="text-gray-800">{row.original.location.country}</div>
            <div className="text-xs text-gray-500">{row.original.location.city}</div>
          </div>
        ),
      }),
      col.accessor((p) => p.cellTypes[0], {
        id: 'cellType',
        header: 'Cell Type & Studies',
        cell: ({ row }) => {
          const p = row.original
          const pub = p.evidence.publications[0]
          const trial = p.evidence.clinicalTrials[0]
          const clinicLink = pub?.url
            ? { href: pub.url, label: `${pub.journal} (${pub.year})`, icon: '📄' as const }
            : trial
            ? { href: `https://clinicaltrials.gov/study/${trial.nctId}`, label: `Trial ${trial.nctId} · Phase ${trial.phase}`, icon: '🔬' as const }
            : p.contact.website
            ? { href: p.contact.website, label: 'Clinic autism page', icon: '🔗' as const }
            : null
          return (
            <div className="space-y-1.5">
              {p.cellTypes.map((t: CellType) => {
                const typeStudy = cellTypeStudies[t as string]
                return (
                  <div key={t} className="space-y-0.5">
                    <CellTypeBadge type={t} />
                    {typeStudy && (
                      <a
                        href={typeStudy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 hover:underline"
                        title={typeStudy.title}
                      >
                        <span className="shrink-0">📚</span>
                        <span className="truncate max-w-[180px]">{typeStudy.journal} ({typeStudy.year})</span>
                      </a>
                    )}
                  </div>
                )
              })}
              {clinicLink && (
                <a
                  href={clinicLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  title={clinicLink.label}
                >
                  <span className="shrink-0">{clinicLink.icon}</span>
                  <span className="truncate max-w-[180px]">{clinicLink.label}</span>
                </a>
              )}
            </div>
          )
        },
      }),
      col.accessor((p) => p.deliveryRoutes[0], {
        id: 'route',
        header: 'Delivery',
        meta: { className: 'hidden sm:table-cell' },
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.deliveryRoutes.map((r) => <RouteBadge key={r} route={r} />)}
          </div>
        ),
      }),
      col.accessor((p) => p.testimonials.aggregateRating, {
        id: 'rating',
        header: 'Rating',
        cell: ({ row }) => (
          <StarRating rating={row.original.testimonials.aggregateRating} count={row.original.testimonials.totalReviews} size="sm" />
        ),
      }),
      col.accessor((p) => coaScore(p.coa) ?? -1, {
        id: 'coa',
        header: 'Auth. Score',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => {
          const score = coaScore(row.original.coa)
          return (
            <div className="space-y-1">
              <CertBadge coa={row.original.coa} compact />
              {score !== null && (
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-teal-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-400'}`}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{score.toFixed(1)}</span>
                </div>
              )}
            </div>
          )
        },
      }),
      col.accessor((p) => p.gmpCertifiedLab, {
        id: 'gmpCertifiedLab',
        header: 'GMP-Certified Labs',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => {
          const cfg = GMP_STATUS_CONFIG[row.original.gmpCertifiedLab]
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.classes}`}>
              {cfg.label}
            </span>
          )
        },
      }),
      col.accessor((p) => p.offersFMT, {
        id: 'offersFMT',
        header: 'FMT',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => {
          const p = row.original
          const note = p.fmtNotes
          return (
            <div className="space-y-1 min-w-[100px] max-w-[220px]">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  p.offersFMT
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                {p.offersFMT ? 'Yes' : 'No'}
              </span>
              {note && <p className="text-xs text-gray-500 leading-snug line-clamp-3">{note}</p>}
            </div>
          )
        },
      }),
      col.accessor((p) => p.museCellClaim?.status ?? '', {
        id: 'museClaim',
        header: 'MUSE Cell Claim',
        meta: { className: 'hidden lg:table-cell' },
        cell: ({ row }) => <MuseClaimCell claim={row.original.museCellClaim} />,
      }),
      col.accessor((p) => p.cost.minUSD, {
        id: 'cost',
        header: 'Cost (USD)',
        cell: ({ row }) => {
          const { minUSD, maxUSD } = row.original.cost
          return minUSD > 0 ? (
            <div className="text-sm text-gray-800 whitespace-nowrap">
              ${minUSD.toLocaleString()} – ${maxUSD.toLocaleString()}
            </div>
          ) : <span className="text-xs text-gray-400">Research only</span>
        },
      }),
    ],
    [selectedIds, toggleSelected, setActiveDetail]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="flex flex-col h-full">
      {/* Compare bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-blue-700 font-medium">
            {selectedIds.length} provider{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            {selectedIds.length >= 2 && (
              <button
                onClick={() => setCompareMode(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                Compare ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => useDashboardStore.getState().clearSelected()}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-100 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto flex-1">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap select-none ${(header.column.columnDef.meta as any)?.className ?? ''}`}
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer hover:text-gray-800' : ''}`}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <span>↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span>↓</span>}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No providers match the current filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isSelected = selectedIds.includes(row.original.id)
                return (
                  <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={`px-3 py-3 align-top ${(cell.column.columnDef.meta as any)?.className ?? ''}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-400">
        Showing {filtered.length} of {allProviders.length} providers · All human stem cell sources · Click column headers to sort · Click provider name for full profile
      </div>
    </div>
  )
}
