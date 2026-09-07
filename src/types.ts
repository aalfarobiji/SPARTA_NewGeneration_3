export type ScaleMode = 'kabupaten' | 'provinsi' | 'nasional' | 'custom';

export type DogHealthStatus = 'S' | 'E' | 'I' | 'V' | 'D';

export interface DogAgent {
  id: string;
  x: number; // lat
  y: number; // lng
  homeX: number;
  homeY: number;
  roamingRadiusKm: number;
  status: DogHealthStatus;
  settlementId: string;
  regencyId: string;
  incubationDaysRemaining: number;
  infectiousDaysRemaining: number;
  immunityDaysRemaining: number;
  infectedByDogId?: string;
  infectionDay?: number;
}

export interface SettlementPoint {
  id: string;
  name: string;
  regencyId: string;
  provinceId: string;
  lat: number;
  lng: number;
  dogPopulation: number;
  householdCount: number;
  isCustomUploaded?: boolean;
  footprintPolygon?: [number, number][]; // AI Deep Learning detected residential cluster boundary
  detectedAreaHectares?: number;
  aiDetectionConfidence?: number; // e.g. 0.94
}

export interface Regency {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
  centroid: [number, number]; // [lat, lng]
  dogPopulation: number;
  humanPopulation: number;
  areaKm2: number;
  isEndemic: boolean;
  bounds?: [number, number][]; // optional polygon boundary points
}

export interface Province {
  id: string;
  name: string;
  island: string;
  centroid: [number, number];
  dogPopulation: number;
  humanPopulation: number;
  isEndemic: boolean;
  regencies: Regency[];
}

export interface EpiParameters {
  lambdaKernel: number; // Spatial scale parameter (1/km)
  meanIncubationPeriod: number; // Days (Gamma mean)
  meanInfectiousPeriod: number; // Days (Exponential mean)
  pBiteGivenContact: number; // 0..1
  pInfectionGivenBite: number; // 0..1
  humanBiteExposureRatio: number; // Human exposures per rabid dog (e.g. 0.2)
  humanFatalityWithoutPEP: number; // Case fatality rate without PEP (~0.95)
  dogVaccineDurationMonths: number; // Months of immunity
  dogVaccineCostIDR: number; // Cost per dog dose (Rupiah)
  humanPEPCostIDR: number; // Cost per human PEP full course (Rupiah)
  cullingCostPerDogIDR: number; // Operational cost per culled dog
  dogVaccineWastageFactor: number; // e.g. 1.15 (+15%)
  humanVaccineWastageFactor: number; // e.g. 1.10 (+10%)
}

export interface InterventionsState {
  preventiveVaccination: {
    enabled: boolean;
    coveragePct: number; // 0 - 100
    startDay: number; // Day to start
    repeatMonths: number; // Annual = 12
    immunityDurationMonths: number;
  };
  reactiveVaccination: {
    enabled: boolean;
    triggerCases: number; // Trigger after X detected cases
    radiusKm: number; // Ring radius in km
    coveragePct: number; // Target coverage inside ring
    delayDays: number; // Response lag
  };
  culling: {
    enabled: boolean;
    radiusKm: number;
    efficiencyPct: number;
    delayDays: number;
  };
  movementBan: {
    enabled: boolean;
    compliancePct: number; // % reduction in inter-patch transmission
    radiusKm: number;
    durationDays: number;
  };
}

export interface DogSnapshot {
  id: string;
  x: number;
  y: number;
  status: DogHealthStatus;
  settlementId?: string;
}

export interface SimulationSettings {
  scaleMode: ScaleMode;
  selectedProvinceId: string;
  selectedRegencyId: string;
  selectedCustomRegencyIds: string[];
  durationYears: number; // 1 - 10 years
  indexCaseCount: number;
  placementMode: 'random' | 'manual';
  manualIndexCoords: [number, number][];
  customDogPopulation?: number | null;
  customHumanPopulation?: number | null;
}

export interface StepLog {
  day: number;
  month: number;
  year: number;
  S: number;
  E: number;
  I: number;
  D: number;
  V: number;
  newInfections: number;
  cumulativeInfections: number;
  rt: number;
  affectedRegenciesCount: number;
  humanExposures: number;
  activeInterventions: string[];
  // Regencies breakdown snapshot for heatmap/maps
  casesByRegency: Record<string, number>;
  dogs?: DogSnapshot[];
}

export interface RegencyVaccineBreakdown {
  regencyId: string;
  regencyName: string;
  provinceName: string;
  dogPopulation: number;
  targetCoveragePct: number;
  dogVaccinesNeeded: number;
  estimatedHumanExposures: number;
  humanPEPDosesNeeded: number;
  estimatedDogVaccineCostIDR: number;
  estimatedHumanPEPCostIDR: number;
}

export interface RegencyDemandRow {
  regencyId: string;
  regencyName: string;
  provinceName: string;
  dogPopulation: number;
  dogVaccinesNeeded: number;
  humanBiteExposures: number;
  humanPepRegimens: number;
  totalCostIDR: number;
}

export interface SimulationSummary {
  totalDogCases: number;
  peakInfectedDogs: number;
  outbreakClearedDay: number | null;
  affectedRegenciesCount: number;
  totalHumanBiteExposures: number;
  estimatedHumanFatalitiesWithoutPEP: number;
  estimatedHumanLivesSaved: number;
  totalDogVaccinesAdministered: number;
  totalDogsCulled: number;
  totalHumanPepNeeded: number;
  totalDogVaccineCostIDR: number;
  totalHumanPepCostIDR: number;
  totalCullingCostIDR: number;
  totalEconomicCostIDR: number;
  regencyDemandTable: RegencyDemandRow[];
}

export interface SimulationResult {
  history: StepLog[];
  baselineHistory?: StepLog[]; // Optional baseline for overlay comparison
  summary: SimulationSummary;
  totalDogCases: number;
  outbreakDurationDays: number;
  affectedRegencies: string[];
  estimatedHumanExposures: number;
  estimatedHumanDeathsPrevented: number;
  estimatedDogVaccinesNeeded: number;
  estimatedHumanPEPDosesNeeded: number;
  totalDogVaccineCostIDR: number;
  totalHumanPEPCostIDR: number;
  totalCullingCostIDR: number;
  totalOperationalCostIDR: number;
  costPerPreventedCaseIDR: number;
  recommendations: string[];
  regencyBreakdown: RegencyVaccineBreakdown[];
}
