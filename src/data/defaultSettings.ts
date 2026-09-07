import { EpiParameters, InterventionsState, SimulationSettings } from '../types';

export const DEFAULT_EPI_PARAMS: EpiParameters = {
  lambdaKernel: 0.4, // Spatial kernel parameter (decay rate 0.4 / km)
  meanIncubationPeriod: 30, // Gamma mean incubation (~30 days)
  meanInfectiousPeriod: 5, // Exponential mean infectious (~5 days)
  pBiteGivenContact: 0.5, // 50% bite probability on dog contact
  pInfectionGivenBite: 0.5, // 50% rabies transmission probability per bite
  humanBiteExposureRatio: 0.20, // 0.2 human bite exposures per rabid dog
  humanFatalityWithoutPEP: 0.95, // ~95-100% case fatality without PEP
  dogVaccineDurationMonths: 12, // 1 year immunity
  dogVaccineCostIDR: 25000, // Rp 25.000 / dose
  humanPEPCostIDR: 1500000, // Rp 1.500.000 / PEP regimen
  cullingCostPerDogIDR: 50000, // Rp 50.000 / dog
  dogVaccineWastageFactor: 1.15, // +15% wastage/reserve buffer
  humanVaccineWastageFactor: 1.10 // +10% wastage buffer
};

export const DEFAULT_INTERVENTIONS: InterventionsState = {
  preventiveVaccination: {
    enabled: true,
    coveragePct: 70, // WHO recommended threshold
    startDay: 1,
    repeatMonths: 12,
    immunityDurationMonths: 12
  },
  reactiveVaccination: {
    enabled: false,
    triggerCases: 1,
    radiusKm: 3.0,
    coveragePct: 80,
    delayDays: 3
  },
  culling: {
    enabled: false,
    radiusKm: 1.0,
    efficiencyPct: 50,
    delayDays: 5
  },
  movementBan: {
    enabled: false,
    compliancePct: 75,
    radiusKm: 10,
    durationDays: 60
  }
};

export const DEFAULT_SETTINGS: SimulationSettings = {
  scaleMode: 'kabupaten',
  selectedProvinceId: 'P1', // Bali
  selectedRegencyId: 'R101', // Badung, Bali
  selectedCustomRegencyIds: ['R101', 'R102', 'R103'],
  durationYears: 2,
  indexCaseCount: 1,
  placementMode: 'random',
  manualIndexCoords: [],
  customDogPopulation: null,
  customHumanPopulation: null
};
