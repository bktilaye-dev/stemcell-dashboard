export type CellType =
  | 'MUSE_dezawa'
  | 'umbilical_cord_msc'
  | 'umbilical_cord_blood'
  | 'bone_marrow'
  | 'adipose'
  | 'spinal_cord_derived'
  | 'exosomes'
  | 'fetal'
  | 'placental'
  | 'amniotic'
  | 'hematopoietic'

export type DeliveryRoute = 'iv' | 'intrathecal' | 'intranasal' | 'intramuscular'

export type CellSource = 'allogeneic' | 'autologous' | 'both'

export type EvidenceGrade = 'high' | 'moderate' | 'low' | 'very_low' | 'unrated'

export type StudyDesign =
  | 'RCT'
  | 'non_randomized_trial'
  | 'observational'
  | 'case_series'
  | 'anecdotal'
  | 'none'

export type ScoreConfidence = 'high' | 'medium' | 'low' | 'none'

export type ScoreSource = 'published_study' | 'provider_report' | 'patient_survey' | 'unknown'

export interface DomainScore {
  score: number
  confidence: ScoreConfidence
  source: ScoreSource
  sampleSize?: number
  notes?: string
}

export interface Publication {
  doi?: string
  title: string
  journal: string
  year: number
  sampleSize?: number
  url?: string
}

export interface ClinicalTrial {
  nctId: string
  phase: string
  status: string
}

export interface TestimonialEntry {
  rating: number
  text: string
  date: string
  verified: boolean
  childAgeAtTreatment?: number
  domainsImproved?: string[]
}

export type CoALevel =
  | 'full'      // ISO/GMP certified lab + patient receives full CoA (viability %, sterility, lot#, donor screening)
  | 'partial'   // Certified lab + patient receives partial documentation
  | 'lab_only'  // Certified lab publicly documented, unclear if patient receives CoA
  | 'claimed'   // Clinic claims GMP/ISO but not independently verified
  | 'none'      // No evidence of quality documentation
  | 'unknown'   // No data available

export interface CertificateOfAuthenticity {
  level: CoALevel
  labCertifications: string[]   // e.g. ['ISO 9001:2015', 'GMP', 'GLP']
  patientDocuments: string[]    // what patient actually receives, e.g. ['Lot number', 'Viability %', 'Sterility report']
  independentlyVerified: boolean
  notes: string
}

export type GmpLabStatus =
  | 'yes'      // Independently verified GMP-certified production lab
  | 'claimed'  // Clinic/partner lab claims GMP but not independently verified
  | 'no'       // No GMP certification claimed or found

export type MuseClaimStatus =
  | 'legitimate_source'   // This IS Tohoku University / Life Science Institute
  | 'licensed'            // Documented license from Tohoku / LSII confirmed
  | 'claim_unverified'    // Claims MUSE cells; no license evidence found
  | 'no_license_found'    // Explicitly investigated; no license or partnership found

export interface MuseCellClaim {
  status: MuseClaimStatus
  licenseVerified: boolean
  licensePartner?: string
  verificationSource?: string
  notes: string
}

export interface Branch {
  city: string
  country: string
  address?: string
  note?: string
}

export interface ProcedureDetails {
  method: string
  durationDays?: { min: number; max: number }
  durationNotes?: string
}

export interface Provider {
  id: string
  name: string
  location: {
    country: string
    countryCode: string
    city: string
    address?: string
    coordinates: { lat: number; lng: number }
  }
  branches?: Branch[]
  cellTypes: CellType[]
  deliveryRoutes: DeliveryRoute[]
  cellSource: CellSource
  humanCellsOnly: true
  offersFMT: boolean
  fmtNotes?: string
  regulatoryNotes?: string

  effectiveness: {
    communication: DomainScore
    socialSkills: DomainScore
    behavior: DomainScore
    selfCare: DomainScore
  }

  evidence: {
    gradeLevel: EvidenceGrade
    studyDesign: StudyDesign
    publications: Publication[]
    clinicalTrials: ClinicalTrial[]
  }

  testimonials: {
    aggregateRating: number
    totalReviews: number
    ratingBreakdown: { '5': number; '4': number; '3': number; '2': number; '1': number }
    featured: TestimonialEntry[]
    externalUrl?: string
  }

  cost: {
    minUSD: number
    maxUSD: number
    includesAccommodation: boolean
    sessionRange: { min: number; max: number }
    notes?: string
  }

  coa: CertificateOfAuthenticity
  gmpCertifiedLab: GmpLabStatus
  museCellClaim?: MuseCellClaim
  procedure: ProcedureDetails

  patientsTotal: number
  autismPatientCount?: number
  yearsOperating?: number
  contact: { website: string; email?: string; phone?: string }
  dataLastVerified: string
  overview: string
}
