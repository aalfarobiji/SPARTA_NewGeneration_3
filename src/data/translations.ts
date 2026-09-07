export type Language = 'id' | 'en';
export type ThemeMode = 'light' | 'dark';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  oneHealthBadge: string;
  scaleLabel: string;
  scaleKabupaten: string;
  scaleProvinsi: string;
  scaleNasional: string;
  scaleCustom: string;
  runSimulation: string;
  simulating: string;
  compareBaseline: string;
  reset: string;
  uploadData: string;
  advancedSettings: string;
  methodology: string;
  themeLight: string;
  themeDark: string;
  institutionalBar: string;

  // Population Panel
  populationSettingsTitle: string;
  selectProvince: string;
  selectRegency: string;
  selectMultipleRegencies: string;
  nationalScaleNote: string;
  demographicsSummary: string;
  estimatedDogPop: string;
  humanPopulation: string;
  dogDensity: string;
  rabiesStatus: string;
  endemic: string;
  rabiesFree: string;
  initialIndexCases: string;
  placementMode: string;
  randomPlacement: string;
  manualPlacement: string;
  clickMapNote: string;
  simulationDuration: string;
  years: string;
  days: string;

  // Extra Population Panel fields
  totalDogPop: string;
  totalHumanPop: string;
  endemicStatus: string;
  statusEndemic: string;
  statusRabiesFree: string;
  initialInfectedLabel: string;
  dogsCount: string;
  indexDogHelpText: string;
  placementModeLabel: string;
  simulationDurationLabel: string;
  selectProvinceScope: string;
  nationalScopeActive: string;
  nationalScopeDesc: string;
  manualPinActiveTitle: string;
  pinsPlaced: string;
  clickMapInstruction: string;
  clearPins: string;

  // Map Component
  layerLabel: string;
  boundariesLayer: string;
  settlementsLayer: string;
  dogsLayer: string;
  heatmapLayer: string;
  manualPinPrompt: string;
  statusSusceptible: string;
  statusExposed: string;
  statusInfectious: string;
  statusVaccinated: string;
  statusDead: string;
  dogStatusTitle: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  yearOfTotal: string;
  speed: string;

  // Interventions Panel
  interventionsTitle: string;
  modesCount: string;
  preventiveVaccination: string;
  preventiveVaccinationTitle: string;
  vaccineCoverage: string;
  targetCoverage: string;
  whoStandardMet: string;
  whoStandardBelow: string;
  startDay: string;
  immunityDurationMonths: string;
  reactiveVaccination: string;
  reactiveVaccinationTitle: string;
  triggerThreshold: string;
  casesCount: string;
  ringRadiusKm: string;
  ringRadiusLabel: string;
  ringTargetPct: string;
  delayDays: string;
  cullingTitle: string;
  cullingEfficiency: string;
  cullingRate: string;
  cullingRadius: string;
  whoCullingWarning: string;
  movementBanTitle: string;
  compliancePct: string;
  banStrictness: string;
  durationDays: string;
  active: string;
  inactive: string;

  // Results Panel
  noSimulationYet: string;
  noSimulationSubtitle: string;
  totalDogCases: string;
  outbreakDuration: string;
  affectedRegenciesCount: string;
  humanExposures: string;
  livesSaved: string;
  tabCurve: string;
  tabHealth: string;
  tabEconomy: string;
  tabVaccineTable: string;
  tabRecommendations: string;
  dogsCountLabel: string;
  reproductionNumberRt: string;
  baselineCurveLabel: string;
  exportCSV: string;
  searchPlaceholder: string;
  regencyCol: string;
  provinceCol: string;
  dogPopCol: string;
  dogVacNeededCol: string;
  humanExposuresCol: string;
  humanPepCol: string;
  costCol: string;

  // One Health Banner
  oneHealthTitle: string;
  oneHealthDesc: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  id: {
    // Header
    appTitle: 'SPARTA',
    appSubtitle: 'Analisis Prediksi Spasial & Transmisi Rabies — Model Agen Spasial & Metapopulasi',
    oneHealthBadge: 'One Health: Manusia - Hewan - Lingkungan',
    scaleLabel: 'Skala Wilayah:',
    scaleKabupaten: '📍 Kabupaten / Kota (Detail Agent)',
    scaleProvinsi: '🏛️ Provinsi (Metapopulasi)',
    scaleNasional: '🇮🇩 Nasional (Seluruh Indonesia)',
    scaleCustom: '🔀 Kombinasi Kustom (Multi-Kota)',
    runSimulation: 'JALANKAN SIMULASI',
    simulating: 'MEMPROSES...',
    compareBaseline: 'Bandingkan Baseline',
    reset: 'Reset',
    uploadData: 'Unggah Data Kustom',
    advancedSettings: 'Pengaturan Parameter Lanjutan',
    methodology: 'Metodologi & Referensi Ilmiah',
    themeLight: 'Tema Terang',
    themeDark: 'Tema Gelap',
    institutionalBar: 'Kementerian Kesehatan RI • Kementerian Pertanian RI • INDOHUN One Health Network',

    // Population Panel
    populationSettingsTitle: 'PENGATURAN POPULASI & WILAYAH',
    selectProvince: 'Pilih Provinsi:',
    selectRegency: 'Pilih Kabupaten / Kota:',
    selectMultipleRegencies: 'Pilih Beberapa Kabupaten / Kota (Multi-select):',
    nationalScaleNote: 'Model Metapopulasi mengevaluasi penyebaran rabies antar 38 provinsi & 500+ kabupaten/kota se-Indonesia secara simultan.',
    demographicsSummary: 'RINGKASAN POPULASI WILAYAH',
    estimatedDogPop: 'Estimasi Anjing:',
    humanPopulation: 'Penduduk Manusia:',
    dogDensity: 'Kepadatan Anjing:',
    rabiesStatus: 'Status Rabies:',
    endemic: 'Endemik',
    rabiesFree: 'Bebas / Bebas Darurat',
    initialIndexCases: 'Jumlah Anjing Indeks Awal (Index Cases):',
    placementMode: 'Penempatan Anjing Indeks pada Peta:',
    randomPlacement: 'Otomatis Acak',
    manualPlacement: 'Klik Peta',
    clickMapNote: 'titik koordinat dipilih di peta',
    simulationDuration: 'Durasi Simulasi:',
    years: 'Tahun',
    days: 'Hari',

    // Extra Population Panel fields
    totalDogPop: 'ESTIMASI ANJING',
    totalHumanPop: 'ESTIMASI MANUSIA',
    endemicStatus: 'STATUS RABIES',
    statusEndemic: 'Endemik Rabies',
    statusRabiesFree: 'Bebas Rabies',
    initialInfectedLabel: 'Kasus Indeks Awal (Anjing Rabies)',
    dogsCount: 'ekor',
    indexDogHelpText: '* Kasus awal yang akan menyebarkan agen rabies melalui kernel transmisi spasial.',
    placementModeLabel: 'Penempatan Anjing Indeks pada Peta:',
    simulationDurationLabel: 'Durasi Simulasi:',
    selectProvinceScope: 'Pilih Provinsi Target:',
    nationalScopeActive: 'Skala Nasional Aktif',
    nationalScopeDesc: 'Model Metapopulasi mengevaluasi penyebaran rabies antar 38 provinsi & 500+ kabupaten/kota se-Indonesia secara simultan.',
    manualPinActiveTitle: 'Mode Pin Peta Aktif',
    pinsPlaced: 'titik dipilih',
    clickMapInstruction: 'Klik lokasi pada peta untuk menempatkan anjing terinfeksi secara spesifik.',
    clearPins: 'Hapus Semua Pin',

    // Map Component
    layerLabel: 'Layer:',
    boundariesLayer: 'Batas Wilayah',
    settlementsLayer: 'Pemukiman',
    dogsLayer: 'Agent Anjing',
    heatmapLayer: 'Heatmap Kasus',
    manualPinPrompt: '👆 Klik Peta untuk Tempatkan Indeks Kasus',
    statusSusceptible: 'Susceptible (Rentan)',
    statusExposed: 'Exposed (Inkubasi)',
    statusInfectious: 'Infectious (Klinis/Menular)',
    statusVaccinated: 'Vaccinated (Kebal)',
    statusDead: 'Dead / Culled (Mati)',
    dogStatusTitle: 'Status Anjing:',
    dayLabel: 'Hari',
    monthLabel: 'Bulan',
    yearLabel: 'Thn',
    yearOfTotal: 'Tahun',
    speed: 'Kecepatan',

    // Interventions Panel
    interventionsTitle: 'PANEL STRATEGI INTERVENSI (ONE HEALTH)',
    modesCount: '4 Moda Kontrol',
    preventiveVaccination: '1. Vaksinasi Massal Preventif Anjing',
    preventiveVaccinationTitle: '1. Vaksinasi Massal Preventif Anjing',
    vaccineCoverage: 'Target Cakupan Vaksinasi Anjing:',
    targetCoverage: 'Target Cakupan Populasi:',
    whoStandardMet: '✅ (Standar WHO >=70%)',
    whoStandardBelow: '⚠️ (<70%)',
    startDay: 'Mulai Hari ke:',
    immunityDurationMonths: 'Durasi Kebal (Bln):',
    reactiveVaccination: '2. Vaksinasi Reaktif (Ring Vaccination)',
    reactiveVaccinationTitle: '2. Vaksinasi Reaktif (Ring Vaccination)',
    triggerThreshold: 'Pemicu Jumlah Kasus:',
    casesCount: 'kasus',
    ringRadiusKm: 'Radius Ring (km):',
    ringRadiusLabel: 'Radius Ring Vaccination:',
    ringTargetPct: 'Target Ring (%):',
    delayDays: 'Keterlambatan Respons (Hari):',
    cullingTitle: '3. Eliminasi / Culling (Depopulasi)',
    cullingEfficiency: 'Efisiensi Culling (%):',
    cullingRate: 'Tingkat Eliminasi Anjing Liar:',
    cullingRadius: 'Radius Culling (km):',
    whoCullingWarning: 'WHO & WOAH menegaskan culling masal tanpa target tidak efektif & dapat memicu migrasi anjing dibanding vaksinasi.',
    movementBanTitle: '4. Pembatasan Pergerakan (Karantina)',
    compliancePct: 'Tingkat Kepatuhan / Reduksi:',
    banStrictness: 'Efektivitas Karantina Pergerakan:',
    durationDays: 'Durasi Pemberlakuan (Hari):',
    active: 'AKTIF',
    inactive: 'NONAKTIF',

    // Results Panel
    noSimulationYet: 'Simulasi Belum Dijalankan',
    noSimulationSubtitle: 'Klik tombol "JALANKAN SIMULASI" di bagian atas untuk memproses pemodelan kernel spasial rabies dan melihat analisis hasilnya.',
    totalDogCases: 'Total Kasus Anjing',
    outbreakDuration: 'Lama Mereda Wabah',
    affectedRegenciesCount: 'Wilayah Terdampak',
    humanExposures: 'Paparan Gigitan Manusia',
    livesSaved: 'Kematian Dicegah',
    tabCurve: 'Kurva Epidemik & Rt',
    tabHealth: 'Dampak Kesehatan',
    tabEconomy: 'Dampak Ekonomi',
    tabVaccineTable: 'Tabel Kebutuhan Vaksin',
    tabRecommendations: 'Rekomendasi Kebijakan',
    dogsCountLabel: 'Jumlah Anjing',
    reproductionNumberRt: 'Angka Reproduksi (Rt)',
    baselineCurveLabel: 'Baseline (Tanpa Intervensi)',
    exportCSV: 'Export CSV / Excel',
    searchPlaceholder: 'Cari Kabupaten/Kota atau Provinsi...',
    regencyCol: 'Kabupaten / Kota',
    provinceCol: 'Provinsi',
    dogPopCol: 'Populasi Anjing',
    dogVacNeededCol: 'Vaksin Anjing (Dosis)',
    humanExposuresCol: 'Paparan Manusia',
    humanPepCol: 'PEP Manusia (Dosis)',
    costCol: 'Biaya Vaksin Anjing',

    // One Health Banner
    oneHealthTitle: 'Integrasi Sinergis One Health',
    oneHealthDesc: 'Menghubungkan kesehatan hewan (vaksinasi anjing & pengawasan pergerakan), kesehatan manusia (VAR/PEP & pelaporan gigitan), serta ekologi pemukiman.',
  },

  en: {
    // Header
    appTitle: 'SPARTA',
    appSubtitle: 'Spatial Prediction & Rabies Transmission Analysis — Spatial Agent & Metapopulation Model',
    oneHealthBadge: 'One Health: Human - Animal - Ecosystem',
    scaleLabel: 'Spatial Scale:',
    scaleKabupaten: '📍 Regency / City (Agent Detail)',
    scaleProvinsi: '🏛️ Province (Metapopulation)',
    scaleNasional: '🇮🇩 National (All Indonesia)',
    scaleCustom: '🔀 Custom Multi-Regency',
    runSimulation: 'RUN SIMULATION',
    simulating: 'PROCESSING...',
    compareBaseline: 'Compare Baseline',
    reset: 'Reset',
    uploadData: 'Upload Custom Data',
    advancedSettings: 'Advanced Parameters',
    methodology: 'Methodology & Science',
    themeLight: 'Light Theme',
    themeDark: 'Dark Theme',
    institutionalBar: 'Ministry of Health • Ministry of Agriculture • INDOHUN One Health Network',

    // Population Panel
    populationSettingsTitle: 'POPULATION & REGION SETTINGS',
    selectProvince: 'Select Province:',
    selectRegency: 'Select Regency / City:',
    selectMultipleRegencies: 'Select Multiple Regencies / Cities:',
    nationalScaleNote: 'Metapopulation Model evaluates rabies spread across all 38 provinces & 500+ regencies simultaneously.',
    demographicsSummary: 'REGIONAL DEMOGRAPHICS SUMMARY',
    estimatedDogPop: 'Est. Dog Population:',
    humanPopulation: 'Human Population:',
    dogDensity: 'Dog Density:',
    rabiesStatus: 'Rabies Status:',
    endemic: 'Endemic',
    rabiesFree: 'Rabies Free / Emergency Free',
    initialIndexCases: 'Initial Rabid Index Dogs (Index Cases):',
    placementMode: 'Index Case Map Placement:',
    randomPlacement: 'Random Seed',
    manualPlacement: 'Click Map',
    clickMapNote: 'coordinates selected on map',
    simulationDuration: 'Simulation Duration:',
    years: 'Years',
    days: 'Days',

    // Extra Population Panel fields
    totalDogPop: 'ESTIMATED DOGS',
    totalHumanPop: 'ESTIMATED HUMANS',
    endemicStatus: 'RABIES STATUS',
    statusEndemic: 'Rabies Endemic',
    statusRabiesFree: 'Rabies Free',
    initialInfectedLabel: 'Initial Rabid Index Dogs',
    dogsCount: 'dogs',
    indexDogHelpText: '* Initial rabies index cases spreading via spatial transmission kernel.',
    placementModeLabel: 'Index Case Placement Mode:',
    simulationDurationLabel: 'Simulation Duration:',
    selectProvinceScope: 'Select Target Province:',
    nationalScopeActive: 'National Scale Active',
    nationalScopeDesc: 'Metapopulation Model evaluates rabies spread across all 38 provinces & 500+ regencies simultaneously.',
    manualPinActiveTitle: 'Map Pin Mode Active',
    pinsPlaced: 'pins placed',
    clickMapInstruction: 'Click location on map to place infected dogs specifically.',
    clearPins: 'Clear All Pins',

    // Map Component
    layerLabel: 'Layers:',
    boundariesLayer: 'Boundaries',
    settlementsLayer: 'Settlements',
    dogsLayer: 'Dog Agents',
    heatmapLayer: 'Case Heatmap',
    manualPinPrompt: '👆 Click Map to Place Rabid Index Dogs',
    statusSusceptible: 'Susceptible (S)',
    statusExposed: 'Exposed / Incubating (E)',
    statusInfectious: 'Infectious / Clinical (I)',
    statusVaccinated: 'Vaccinated / Immune (V)',
    statusDead: 'Dead / Culled (D)',
    dogStatusTitle: 'Dog Health Status:',
    dayLabel: 'Day',
    monthLabel: 'Month',
    yearLabel: 'Yr',
    yearOfTotal: 'Year',
    speed: 'Speed',

    // Interventions Panel
    interventionsTitle: 'INTERVENTION STRATEGY PANEL (ONE HEALTH)',
    modesCount: '4 Control Modes',
    preventiveVaccination: '1. Canine Mass Preventive Vaccination',
    preventiveVaccinationTitle: '1. Canine Mass Preventive Vaccination',
    vaccineCoverage: 'Target Dog Vaccination Coverage:',
    targetCoverage: 'Target Population Coverage:',
    whoStandardMet: '✅ (WHO Standard >=70%)',
    whoStandardBelow: '⚠️ (<70%)',
    startDay: 'Start Day:',
    immunityDurationMonths: 'Immunity Duration (Mo):',
    reactiveVaccination: '2. Reactive Ring Vaccination',
    reactiveVaccinationTitle: '2. Reactive Ring Vaccination',
    triggerThreshold: 'Case Trigger Threshold:',
    casesCount: 'cases',
    ringRadiusKm: 'Ring Radius (km):',
    ringRadiusLabel: 'Ring Vaccination Radius:',
    ringTargetPct: 'Ring Target (%):',
    delayDays: 'Response Lag (Days):',
    cullingTitle: '3. Culling / Depopulation',
    cullingEfficiency: 'Culling Efficiency (%):',
    cullingRate: 'Stray Dog Culling Efficiency:',
    cullingRadius: 'Culling Radius (km):',
    whoCullingWarning: 'WHO & WOAH emphasize indiscriminate mass culling is ineffective & can trigger dog migration compared to vaccination.',
    movementBanTitle: '4. Movement Restriction (Quarantine)',
    compliancePct: 'Compliance / Reduction Rate:',
    banStrictness: 'Movement Restriction Effectiveness:',
    durationDays: 'Enforcement Duration (Days):',
    active: 'ACTIVE',
    inactive: 'INACTIVE',

    // Results Panel
    noSimulationYet: 'Simulation Not Run Yet',
    noSimulationSubtitle: 'Click the "RUN SIMULATION" button at the top to run spatial kernel modeling and view comprehensive impact analytics.',
    totalDogCases: 'Total Rabid Dog Cases',
    outbreakDuration: 'Outbreak Duration',
    affectedRegenciesCount: 'Affected Regencies',
    humanExposures: 'Human Bite Exposures',
    livesSaved: 'Estimated Lives Saved',
    tabCurve: 'Epidemic Curve & Rt',
    tabHealth: 'Health Impact',
    tabEconomy: 'Economic Impact',
    tabVaccineTable: 'Vaccine Demand Table',
    tabRecommendations: 'Policy Recommendations',
    dogsCountLabel: 'Dog Count',
    reproductionNumberRt: 'Reproduction Number (Rt)',
    baselineCurveLabel: 'Baseline (No Interventions)',
    exportCSV: 'Export CSV / Excel',
    searchPlaceholder: 'Search Regency or Province...',
    regencyCol: 'Regency / City',
    provinceCol: 'Province',
    dogPopCol: 'Dog Population',
    dogVacNeededCol: 'Dog Vaccines (Doses)',
    humanExposuresCol: 'Human Exposures',
    humanPepCol: 'Human PEP (Doses)',
    costCol: 'Dog Vaccine Cost',

    // One Health Banner
    oneHealthTitle: 'One Health Synergistic Integration',
    oneHealthDesc: 'Uniting animal health (mass canine vaccination & movement surveillance), human health (PEP/RIG & bite report tracking), and spatial ecosystem data.',
  }
};
