import { create } from 'zustand'
import type { CellType, DeliveryRoute, EvidenceGrade } from '../types/provider'

interface Filters {
  country: string
  cellType: CellType | ''
  evidenceGrade: EvidenceGrade | ''
  deliveryRoute: DeliveryRoute | ''
  offersFMT: '' | 'yes' | 'no'
  gmpCertifiedLab: '' | 'yes' | 'claimed' | 'no'
  maxCostUSD: number
  search: string
}

interface DashboardState {
  filters: Filters
  selectedIds: string[]
  activeDetailId: string | null
  compareMode: boolean

  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
  toggleSelected: (id: string) => void
  clearSelected: () => void
  setActiveDetail: (id: string | null) => void
  setCompareMode: (on: boolean) => void
}

const defaultFilters: Filters = {
  country: '',
  cellType: '',
  evidenceGrade: '',
  deliveryRoute: '',
  offersFMT: '',
  gmpCertifiedLab: '',
  maxCostUSD: 100000,
  search: '',
}

export const useDashboardStore = create<DashboardState>((set) => ({
  filters: defaultFilters,
  selectedIds: [],
  activeDetailId: null,
  compareMode: false,

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: defaultFilters }),

  toggleSelected: (id) =>
    set((s) => {
      const already = s.selectedIds.includes(id)
      if (already) return { selectedIds: s.selectedIds.filter((x) => x !== id) }
      if (s.selectedIds.length >= 3) return s
      return { selectedIds: [...s.selectedIds, id] }
    }),

  clearSelected: () => set({ selectedIds: [], compareMode: false }),

  setActiveDetail: (id) => set({ activeDetailId: id }),

  setCompareMode: (on) => set({ compareMode: on }),
}))
