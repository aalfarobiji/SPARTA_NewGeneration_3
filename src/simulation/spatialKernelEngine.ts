import {
  DogAgent,
  EpiParameters,
  InterventionsState,
  Regency,
  RegencyVaccineBreakdown,
  ScaleMode,
  SettlementPoint,
  SimulationResult,
  SimulationSettings,
  StepLog
} from '../types';
import { generateSyntheticSettlements, getAllRegencies, getProvinceById, getRegencyById } from '../data/indonesiaData';
import { clampPointToRegencyBounds, generateUniformLandPointsForRegency, getRandomPointInPolygon } from '../utils/geoUtils';

// Distance calculation using Haversine formula in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Spatial kernel transmission probability function
export function calculateSpatialKernelProb(
  distKm: number,
  lambda: number,
  pBite: number,
  pInfection: number
): number {
  const pContact = Math.exp(-lambda * Math.max(0.01, distKm));
  return pContact * pBite * pInfection;
}

// Helper to pick random integer
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Main execution function for SPARTA simulation
export function runRabiesSimulation(
  settings: SimulationSettings,
  interventions: InterventionsState,
  epiParams: EpiParameters,
  customSettlements?: SettlementPoint[]
): SimulationResult {
  // Determine target regencies based on scaleMode
  let targetRegencies: Regency[] = [];

  if (settings.scaleMode === 'kabupaten') {
    const reg = getRegencyById(settings.selectedRegencyId);
    if (reg) targetRegencies = [reg];
    else targetRegencies = [getAllRegencies()[0]];
  } else if (settings.scaleMode === 'provinsi') {
    const prov = getProvinceById(settings.selectedProvinceId);
    if (prov) targetRegencies = prov.regencies;
    else targetRegencies = getAllRegencies().slice(0, 5);
  } else if (settings.scaleMode === 'custom') {
    targetRegencies = getAllRegencies().filter(r => settings.selectedCustomRegencyIds.includes(r.id));
    if (targetRegencies.length === 0) targetRegencies = getAllRegencies().slice(0, 3);
  } else {
    // 'nasional'
    targetRegencies = getAllRegencies();
  }

  // Calculate effective population totals
  const defaultBaseDogPop = targetRegencies.reduce((sum, r) => sum + r.dogPopulation, 0);
  const defaultBaseHumanPop = targetRegencies.reduce((sum, r) => sum + r.humanPopulation, 0);

  const effectiveTotalDogPop = (settings.customDogPopulation && settings.customDogPopulation > 0)
    ? settings.customDogPopulation
    : defaultBaseDogPop;

  const effectiveTotalHumanPop = (settings.customHumanPopulation && settings.customHumanPopulation > 0)
    ? settings.customHumanPopulation
    : defaultBaseHumanPop;

  // Generate or gather settlement points with Deep Learning footprint polygons
  let settlements: SettlementPoint[] = [];
  if (customSettlements && customSettlements.length > 0) {
    settlements = customSettlements;
  } else {
    targetRegencies.forEach(reg => {
      const count = settings.scaleMode === 'nasional' ? 8 : settings.scaleMode === 'provinsi' ? 16 : 24;
      const regSettlements = generateSyntheticSettlements(reg, count);
      settlements.push(...regSettlements);
    });
  }

  // Initialize Dog Agents uniformly across the land territory of each target regency
  const dogs: DogAgent[] = [];
  let agentIdCounter = 1;

  const targetAgentCount = Math.min(3000, Math.max(10, effectiveTotalDogPop));
  const totalTargetDogPop = targetRegencies.reduce((sum, r) => sum + r.dogPopulation, 0) || 1;

  targetRegencies.forEach((reg, rIdx) => {
    const regShare = reg.dogPopulation / totalTargetDogPop;
    let regAgentCount = Math.max(1, Math.round(targetAgentCount * regShare));

    if (rIdx === targetRegencies.length - 1) {
      const currentTotal = dogs.length;
      if (currentTotal + regAgentCount !== targetAgentCount) {
        regAgentCount = Math.max(1, targetAgentCount - currentTotal);
      }
    }

    // Generate uniformly distributed land points strictly inside regency boundaries (no water/sea/extreme mountains)
    const landCoords = generateUniformLandPointsForRegency(reg, regAgentCount);

    landCoords.forEach((coord, cIdx) => {
      const [finalLat, finalLng] = clampPointToRegencyBounds(coord[0], coord[1], reg);
      const roamingRadiusKm = 0.25 + Math.random() * 0.45; // Roaming range 250m - 700m

      dogs.push({
        id: `DOG-${agentIdCounter++}`,
        x: Number(finalLat.toFixed(5)),
        y: Number(finalLng.toFixed(5)),
        homeX: Number(finalLat.toFixed(5)),
        homeY: Number(finalLng.toFixed(5)),
        roamingRadiusKm,
        status: 'S',
        settlementId: `${reg.id}-Zone-${cIdx + 1}`,
        regencyId: reg.id,
        incubationDaysRemaining: 0,
        infectiousDaysRemaining: 0,
        immunityDaysRemaining: 0
      });
    });
  });

  // Seed Index Cases (Rabid Dogs) up to settings.indexCaseCount
  let seededCount = 0;
  if (settings.placementMode === 'manual' && settings.manualIndexCoords.length > 0) {
    settings.manualIndexCoords.forEach(([mLat, mLng]) => {
      let closestDog: DogAgent | null = null;
      let minDist = Infinity;
      dogs.forEach(d => {
        const dist = haversineDistanceKm(mLat, mLng, d.x, d.y);
        if (dist < minDist) {
          minDist = dist;
          closestDog = d;
        }
      });
      if (closestDog) {
        (closestDog as DogAgent).status = 'I';
        (closestDog as DogAgent).infectiousDaysRemaining = Math.max(2, Math.round(epiParams.meanInfectiousPeriod));
        seededCount++;
      }
    });
  }

  if (seededCount === 0) {
    const seedIndices = new Set<number>();
    const neededSeeds = Math.min(dogs.length, Math.max(1, settings.indexCaseCount));
    while (seedIndices.size < neededSeeds) {
      seedIndices.add(Math.floor(Math.random() * dogs.length));
    }
    seedIndices.forEach(idx => {
      dogs[idx].status = 'I';
      dogs[idx].infectiousDaysRemaining = Math.max(2, Math.round(epiParams.meanInfectiousPeriod));
    });
  }

  // Simulation Time Tracking
  const totalDays = Math.min(3650, Math.max(30, Math.round(settings.durationYears * 365)));
  const history: StepLog[] = [];
  let totalCumulativeInfections = settings.indexCaseCount;

  const secondaryInfectionsMap: Record<string, number> = {};
  dogs.filter(d => d.status === 'I').forEach(d => { secondaryInfectionsMap[d.id] = 0; });

  const ringVaccinatedSettlements = new Set<string>();

  // Main Daily Loop with Agent-Based Mobility & Transmission
  for (let day = 1; day <= totalDays; day++) {
    const month = Math.ceil(day / 30);
    const year = Math.ceil(day / 365);

    let newInfectionsToday = 0;
    const activeInfectiousDogs = dogs.filter(d => d.status === 'I');
    const activeExposedDogs = dogs.filter(d => d.status === 'E');
    const activeVaccinatedDogs = dogs.filter(d => d.status === 'V');

    // 1. UPDATE EXPOSED (E -> I)
    activeExposedDogs.forEach(dog => {
      dog.incubationDaysRemaining--;
      if (dog.incubationDaysRemaining <= 0) {
        dog.status = 'I';
        dog.infectiousDaysRemaining = Math.max(1, randomInt(Math.round(epiParams.meanInfectiousPeriod * 0.6), Math.round(epiParams.meanInfectiousPeriod * 1.4)));
        secondaryInfectionsMap[dog.id] = 0;
      }
    });

    // 2. UPDATE VACCINATED (V -> S)
    activeVaccinatedDogs.forEach(dog => {
      dog.immunityDaysRemaining--;
      if (dog.immunityDaysRemaining <= 0) {
        dog.status = 'S';
      }
    });

    // 3. PREVENTIVE MASS VACCINATION
    if (interventions.preventiveVaccination.enabled && day === interventions.preventiveVaccination.startDay) {
      const targetCov = interventions.preventiveVaccination.coveragePct / 100;
      const susceptibleDogs = dogs.filter(d => d.status === 'S');
      const numToVaccinate = Math.floor(susceptibleDogs.length * targetCov);
      for (let i = 0; i < numToVaccinate; i++) {
        susceptibleDogs[i].status = 'V';
        susceptibleDogs[i].immunityDaysRemaining = Math.round(interventions.preventiveVaccination.immunityDurationMonths * 30);
      }
    }

    // 4. REACTIVE RING VACCINATION
    if (interventions.reactiveVaccination.enabled && activeInfectiousDogs.length >= interventions.reactiveVaccination.triggerCases) {
      activeInfectiousDogs.forEach(infDog => {
        if (!ringVaccinatedSettlements.has(infDog.settlementId)) {
          ringVaccinatedSettlements.add(infDog.settlementId);
          const rad = interventions.reactiveVaccination.radiusKm;
          const targetCov = interventions.reactiveVaccination.coveragePct / 100;

          const dogsInRing = dogs.filter(d => d.status === 'S' && haversineDistanceKm(infDog.x, infDog.y, d.x, d.y) <= rad);
          const countToVaccinate = Math.floor(dogsInRing.length * targetCov);
          for (let k = 0; k < countToVaccinate; k++) {
            dogsInRing[k].status = 'V';
            dogsInRing[k].immunityDaysRemaining = Math.round(epiParams.dogVaccineDurationMonths * 30);
          }
        }
      });
    }

    // 5. CULLING / DEPOPULASI
    if (interventions.culling.enabled && day >= interventions.culling.delayDays) {
      activeInfectiousDogs.forEach(infDog => {
        const rad = interventions.culling.radiusKm;
        const eff = interventions.culling.efficiencyPct / 100;

        if (Math.random() < eff) {
          infDog.status = 'D';
        } else if (rad > 0) {
          const dogsInRad = dogs.filter(d => (d.status === 'S' || d.status === 'E') && haversineDistanceKm(infDog.x, infDog.y, d.x, d.y) <= rad);
          dogsInRad.forEach(d => {
            if (Math.random() < eff * 0.3) {
              d.status = 'D';
            }
          });
        }
      });
    }

    // 6. AGENT-BASED MOBILITY DYNAMICS (Step 3: Analisis Pergerakan Anjing ABM)
    const movementBanMult = interventions.movementBan.enabled
      ? Math.max(0.15, 1 - (interventions.movementBan.compliancePct / 100))
      : 1.0;

    dogs.forEach(dog => {
      if (dog.status === 'D') return; // Dead dogs do not move

      const parentReg = targetRegencies.find(r => r.id === dog.regencyId);

      if (dog.status === 'I') {
        // Rabid dogs display disoriented, furious wandering with increased dispersal step
        const wanderStepDeg = 0.0035 * movementBanMult; // ~380m daily dispersal step
        const wanderAngle = Math.random() * 2 * Math.PI;
        const newX = dog.x + wanderStepDeg * Math.sin(wanderAngle);
        const newY = dog.y + wanderStepDeg * Math.cos(wanderAngle);
        const [cLat, cLng] = parentReg ? clampPointToRegencyBounds(newX, newY, parentReg) : [newX, newY];
        dog.x = Number(cLat.toFixed(5));
        dog.y = Number(cLng.toFixed(5));
      } else {
        // Normal resident dogs roam within neighborhood home range
        const maxRangeDeg = (dog.roamingRadiusKm / 110.574) * movementBanMult;
        const jitterLat = (Math.random() - 0.5) * 0.0012 * movementBanMult;
        const jitterLng = (Math.random() - 0.5) * 0.0012 * movementBanMult;
        const targetX = dog.homeX + jitterLat;
        const targetY = dog.homeY + jitterLng;

        // Keep within home range radius
        const distFromHome = haversineDistanceKm(dog.homeX, dog.homeY, targetX, targetY);
        if (distFromHome <= dog.roamingRadiusKm * movementBanMult) {
          const [cLat, cLng] = parentReg ? clampPointToRegencyBounds(targetX, targetY, parentReg) : [targetX, targetY];
          dog.x = Number(cLat.toFixed(5));
          dog.y = Number(cLng.toFixed(5));
        }
      }
    });

    // 7. TRANSMISSION STEP (I -> S) via Spatial Distance Kernel
    const currentInfectiousDogs = dogs.filter(d => d.status === 'I');
    const currentSusceptibleDogs = dogs.filter(d => d.status === 'S');

    currentInfectiousDogs.forEach(infDog => {
      currentSusceptibleDogs.forEach(sugDog => {
        if (sugDog.status !== 'S') return;

        const distKm = haversineDistanceKm(infDog.x, infDog.y, sugDog.x, sugDog.y);
        const isSameSettlement = infDog.settlementId === sugDog.settlementId;
        const isSameRegency = infDog.regencyId === sugDog.regencyId;

        let pTransmission = 0;

        if (isSameSettlement) {
          const pContact = Math.exp(-epiParams.lambdaKernel * Math.max(0.01, distKm));
          pTransmission = pContact * epiParams.pBiteGivenContact * epiParams.pInfectionGivenBite;
        } else {
          pTransmission = calculateSpatialKernelProb(
            distKm,
            epiParams.lambdaKernel,
            epiParams.pBiteGivenContact,
            epiParams.pInfectionGivenBite
          );

          if (!isSameRegency) {
            pTransmission *= 0.25 * movementBanMult;
          } else {
            pTransmission *= movementBanMult;
          }
        }

        if (Math.random() < pTransmission) {
          sugDog.status = 'E';
          sugDog.incubationDaysRemaining = Math.max(5, randomInt(Math.round(epiParams.meanIncubationPeriod * 0.5), Math.round(epiParams.meanInfectiousPeriod * 1.8)));
          sugDog.infectedByDogId = infDog.id;
          sugDog.infectionDay = day;

          newInfectionsToday++;
          totalCumulativeInfections++;
          secondaryInfectionsMap[infDog.id] = (secondaryInfectionsMap[infDog.id] || 0) + 1;
        }
      });
    });

    // 8. UPDATE INFECTIOUS (I -> D)
    let totalCompletedInfectionsToday = 0;
    let sumSecondaryOfCompletedToday = 0;

    currentInfectiousDogs.forEach(dog => {
      dog.infectiousDaysRemaining--;
      if (dog.infectiousDaysRemaining <= 0) {
        dog.status = 'D';
        totalCompletedInfectionsToday++;
        sumSecondaryOfCompletedToday += (secondaryInfectionsMap[dog.id] || 0);
      }
    });

    const currentRt = totalCompletedInfectionsToday > 0
      ? Number((sumSecondaryOfCompletedToday / totalCompletedInfectionsToday).toFixed(2))
      : (activeInfectiousDogs.length > 0 ? 1.2 : 0);

    const casesByRegency: Record<string, number> = {};
    dogs.forEach(d => {
      if (d.status === 'I' || d.status === 'E') {
        casesByRegency[d.regencyId] = (casesByRegency[d.regencyId] || 0) + 1;
      }
    });

    const humanExposuresToday = Math.round(activeInfectiousDogs.length * (epiParams.humanBiteExposureRatio / 10));

    const activeInterventionsList: string[] = [];
    if (interventions.preventiveVaccination.enabled && day >= interventions.preventiveVaccination.startDay) activeInterventionsList.push('Vaksinasi Preventif');
    if (interventions.reactiveVaccination.enabled && ringVaccinatedSettlements.size > 0) activeInterventionsList.push('Vaksinasi Reaktif (Ring)');
    if (interventions.culling.enabled) activeInterventionsList.push('Culling / Eliminasi');
    if (interventions.movementBan.enabled) activeInterventionsList.push('Pembatasan Pergerakan');

    const S = dogs.filter(d => d.status === 'S').length;
    const E = dogs.filter(d => d.status === 'E').length;
    const I = dogs.filter(d => d.status === 'I').length;
    const D = dogs.filter(d => d.status === 'D').length;
    const V = dogs.filter(d => d.status === 'V').length;

    if (day === 1 || day % 3 === 0 || day === totalDays || (I === 0 && E === 0)) {
      history.push({
        day,
        month,
        year,
        S,
        E,
        I,
        D,
        V,
        newInfections: newInfectionsToday,
        cumulativeInfections: totalCumulativeInfections,
        rt: currentRt,
        affectedRegenciesCount: Object.keys(casesByRegency).length,
        humanExposures: humanExposuresToday,
        activeInterventions: activeInterventionsList,
        casesByRegency,
        dogs: dogs.map(d => ({
          id: d.id,
          x: d.x,
          y: d.y,
          status: d.status,
          settlementId: d.settlementId
        }))
      });
    }

    if (I === 0 && E === 0 && day > 30) {
      break;
    }
  }

  // Calculate Overall Metrics
  const lastStep = history[history.length - 1] || { day: totalDays, S: 0, E: 0, I: 0, D: 0, V: 0, affectedRegenciesCount: 0 };
  const outbreakDurationDays = lastStep.day;
  const affectedRegenciesSet = new Set<string>();
  history.forEach(h => {
    Object.keys(h.casesByRegency).forEach(r => affectedRegenciesSet.add(r));
  });

  const totalHumanExposures = Math.round(totalCumulativeInfections * epiParams.humanBiteExposureRatio);
  const estimatedHumanDeathsWithoutPEP = Math.round(totalHumanExposures * epiParams.humanFatalityWithoutPEP);
  const estimatedHumanDeathsPrevented = Math.round(estimatedHumanExposuresWithPEP(totalHumanExposures, interventions));

  const totalDogPopInTarget = effectiveTotalDogPop;
  const targetCoverage = interventions.preventiveVaccination.enabled ? interventions.preventiveVaccination.coveragePct / 100 : 0.70;
  const estimatedDogVaccinesNeeded = Math.round(totalDogPopInTarget * targetCoverage * epiParams.dogVaccineWastageFactor);
  const estimatedHumanPEPDosesNeeded = Math.round(totalHumanExposures * 3.5 * epiParams.humanVaccineWastageFactor);

  const totalDogVaccineCostIDR = estimatedDogVaccinesNeeded * epiParams.dogVaccineCostIDR;
  const totalHumanPEPCostIDR = estimatedHumanPEPDosesNeeded * (epiParams.humanPEPCostIDR / 3.5);
  const culledDogsCount = dogs.filter(d => d.status === 'D').length;
  const totalCullingCostIDR = culledDogsCount * epiParams.cullingCostPerDogIDR;
  const totalOperationalCostIDR = totalDogVaccineCostIDR + totalHumanPEPCostIDR + totalCullingCostIDR;

  const costPerPreventedCaseIDR = totalCumulativeInfections > 0
    ? Math.round(totalOperationalCostIDR / totalCumulativeInfections)
    : 0;

  const regencyBreakdown: RegencyVaccineBreakdown[] = targetRegencies.map(reg => {
    const dogVaccines = Math.round(reg.dogPopulation * targetCoverage * epiParams.dogVaccineWastageFactor);
    const estRegencyCases = Math.round((totalCumulativeInfections / Math.max(1, targetRegencies.length)));
    const humanExposures = Math.round(estRegencyCases * epiParams.humanBiteExposureRatio);
    const humanPEPDoses = Math.round(humanExposures * 3.5 * epiParams.humanVaccineWastageFactor);

    return {
      regencyId: reg.id,
      regencyName: reg.name,
      provinceName: reg.provinceName,
      dogPopulation: reg.dogPopulation,
      targetCoveragePct: Math.round(targetCoverage * 100),
      dogVaccinesNeeded: dogVaccines,
      estimatedHumanExposures: humanExposures,
      humanPEPDosesNeeded: humanPEPDoses,
      estimatedDogVaccineCostIDR: dogVaccines * epiParams.dogVaccineCostIDR,
      estimatedHumanPEPCostIDR: humanPEPDoses * (epiParams.humanPEPCostIDR / 3.5)
    };
  });

  const recommendations: string[] = [
    `Target minimal vaksinasi massal 70% populasi anjing sangat direkomendasikan oleh WHO untuk mencapai herd immunity spasial.`,
    `Tingkatkan kecepatan pembentukan Ring Vaccination dalam radius 3 km dari tempat ditemukannya index case.`,
    `Pastikan ketersediaan stok PEP (Anti Rabies Vaccine manusia) terjangkau di faskes primer.`
  ];

  const summary = {
    totalDogCases: totalCumulativeInfections,
    peakInfectedDogs: Math.max(...history.map(h => h.I), 0),
    outbreakClearedDay: history.find(h => h.I === 0 && h.E === 0 && h.day > 10)?.day || null,
    affectedRegenciesCount: affectedRegenciesSet.size,
    totalHumanBiteExposures: totalHumanExposures,
    estimatedHumanFatalitiesWithoutPEP: estimatedHumanDeathsWithoutPEP,
    estimatedHumanLivesSaved: estimatedHumanDeathsPrevented,
    totalDogVaccinesAdministered: estimatedDogVaccinesNeeded,
    totalDogsCulled: culledDogsCount,
    totalHumanPepNeeded: estimatedHumanPEPDosesNeeded,
    totalDogVaccineCostIDR,
    totalHumanPepCostIDR: totalHumanPEPCostIDR,
    totalCullingCostIDR,
    totalEconomicCostIDR: totalOperationalCostIDR,
    regencyDemandTable: regencyBreakdown.map(r => ({
      regencyId: r.regencyId,
      regencyName: r.regencyName,
      provinceName: r.provinceName,
      dogPopulation: r.dogPopulation,
      dogVaccinesNeeded: r.dogVaccinesNeeded,
      humanBiteExposures: r.estimatedHumanExposures,
      humanPepRegimens: r.humanPEPDosesNeeded,
      totalCostIDR: r.estimatedDogVaccineCostIDR
    }))
  };

  return {
    history,
    summary,
    totalDogCases: totalCumulativeInfections,
    outbreakDurationDays,
    affectedRegencies: Array.from(affectedRegenciesSet),
    estimatedHumanExposures: totalHumanExposures,
    estimatedHumanDeathsPrevented,
    estimatedDogVaccinesNeeded,
    estimatedHumanPEPDosesNeeded,
    totalDogVaccineCostIDR,
    totalHumanPEPCostIDR,
    totalCullingCostIDR,
    totalOperationalCostIDR,
    costPerPreventedCaseIDR,
    recommendations,
    regencyBreakdown
  };
}

function estimatedHumanExposuresWithPEP(totalExposures: number, interventions: InterventionsState): number {
  const reductionFactor = interventions.preventiveVaccination.enabled ? (interventions.preventiveVaccination.coveragePct / 100) : 0.1;
  return Math.round(totalExposures * Math.max(0.7, 0.95 - reductionFactor * 0.25));
}
