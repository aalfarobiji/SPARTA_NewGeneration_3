import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapComponent } from './components/MapComponent';
import { PopulationPanel } from './components/PopulationPanel';
import { InterventionPanel } from './components/InterventionPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { AboutMethodologyModal } from './components/AboutMethodologyModal';
import { CustomDataUploadModal } from './components/CustomDataUploadModal';

import {
  EpiParameters,
  InterventionsState,
  Regency,
  SettlementPoint,
  SimulationResult,
  SimulationSettings
} from './types';
import { DEFAULT_EPI_PARAMS, DEFAULT_INTERVENTIONS, DEFAULT_SETTINGS } from './data/defaultSettings';
import { generateSyntheticSettlements, getAllRegencies, getProvinceById, getRegencyById } from './data/indonesiaData';
import { runRabiesSimulation } from './simulation/spatialKernelEngine';
import { Language, ThemeMode } from './data/translations';

export default function App() {
  // Language State ('id' = Bahasa Indonesia, 'en' = English)
  const [lang, setLang] = useState<Language>('id');
  // Theme State ('light' | 'dark')
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');

  // Sync dark class on document element for Tailwind dark mode selector
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Core Simulation State Initialization
  const [settings, setSettings] = useState<SimulationSettings>(DEFAULT_SETTINGS);
  const [interventions, setInterventions] = useState<InterventionsState>(DEFAULT_INTERVENTIONS);
  const [epiParams, setEpiParams] = useState<EpiParameters>(DEFAULT_EPI_PARAMS);

  const [customSettlements, setCustomSettlements] = useState<SettlementPoint[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<SimulationResult | null>(null);

  // Playback state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2); // 2x default speed
  const [isSimulating, setIsSimulating] = useState(false);

  // Modal open states
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Target regencies calculation based on scale mode
  const getTargetRegencies = (): Regency[] => {
    if (settings.scaleMode === 'kabupaten') {
      const reg = getRegencyById(settings.selectedRegencyId);
      return reg ? [reg] : [getAllRegencies()[0]];
    } else if (settings.scaleMode === 'provinsi') {
      const prov = getProvinceById(settings.selectedProvinceId);
      return prov ? prov.regencies : getAllRegencies().slice(0, 5);
    } else if (settings.scaleMode === 'custom') {
      const selected = getAllRegencies().filter(r => settings.selectedCustomRegencyIds.includes(r.id));
      return selected.length > 0 ? selected : getAllRegencies().slice(0, 3);
    } else {
      // 'nasional'
      return getAllRegencies();
    }
  };

  const targetRegencies = getTargetRegencies();

  // Active settlements calculation
  const getActiveSettlements = (): SettlementPoint[] => {
    if (customSettlements.length > 0) return customSettlements;

    const settlementsList: SettlementPoint[] = [];
    targetRegencies.forEach(reg => {
      const count = settings.scaleMode === 'nasional' ? 8 : settings.scaleMode === 'provinsi' ? 16 : 24;
      settlementsList.push(...generateSyntheticSettlements(reg, count));
    });
    return settlementsList;
  };

  const settlements = getActiveSettlements();

  // Handle running simulation
  const handleRunSimulation = (runBaselineOverlay = false) => {
    setIsSimulating(true);
    setIsPlaying(false);

    setTimeout(() => {
      const activeSettlementList = getActiveSettlements();
      const res = runRabiesSimulation(settings, interventions, epiParams, activeSettlementList);

      if (runBaselineOverlay) {
        const disabledInterventions: InterventionsState = {
          preventiveVaccination: { ...interventions.preventiveVaccination, enabled: false },
          reactiveVaccination: { ...interventions.reactiveVaccination, enabled: false },
          culling: { ...interventions.culling, enabled: false },
          movementBan: { ...interventions.movementBan, enabled: false }
        };
        const baseRes = runRabiesSimulation(settings, disabledInterventions, epiParams, activeSettlementList);
        setBaselineResult(baseRes);
      } else {
        setBaselineResult(null);
      }

      setSimulationResult(res);
      setCurrentStepIndex(0);
      setIsSimulating(false);
      setIsPlaying(true); // Auto-start animation playback
    }, 150);
  };

  // Run initial simulation on first load or when key scale settings change
  useEffect(() => {
    handleRunSimulation(false);
  }, [settings.scaleMode, settings.selectedRegencyId, settings.selectedProvinceId, settings.durationYears]);

  // Handle manual coordinate placement
  const handleAddManualIndexCoord = (coord: [number, number]) => {
    if (settings.placementMode === 'manual') {
      setSettings(prev => ({
        ...prev,
        manualIndexCoords: [...prev.manualIndexCoords, coord]
      }));
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSettings(DEFAULT_SETTINGS);
    setInterventions(DEFAULT_INTERVENTIONS);
    setEpiParams(DEFAULT_EPI_PARAMS);
    setCustomSettlements([]);
    setBaselineResult(null);
    handleRunSimulation(false);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      themeMode === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header Bar */}
      <Header
        settings={settings}
        onUpdateSettings={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
        onRunSimulation={handleRunSimulation}
        onReset={handleReset}
        isSimulating={isSimulating}
        onOpenAdvancedModal={() => setIsAdvancedModalOpen(true)}
        onOpenMethodologyModal={() => setIsMethodologyModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        hasBaselineComparison={!!baselineResult}
        lang={lang}
        onToggleLanguage={setLang}
        themeMode={themeMode}
        onToggleTheme={setThemeMode}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* Top Section: Left Panel (Population) | Center (GIS Map) | Right Panel (Interventions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Population & Region Settings (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <PopulationPanel
              settings={settings}
              onUpdateSettings={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
              targetRegencies={targetRegencies}
              lang={lang}
              themeMode={themeMode}
            />
          </div>

          {/* Center Column: Interactive GIS Map & Timeline Playback (6 cols) */}
          <div className="lg:col-span-6 h-[580px]">
            <MapComponent
              settings={settings}
              targetRegencies={targetRegencies}
              settlements={settlements}
              simulationResult={simulationResult}
              currentStepIndex={currentStepIndex}
              setCurrentStepIndex={setCurrentStepIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              onAddManualIndexCoord={handleAddManualIndexCoord}
              lang={lang}
              themeMode={themeMode}
            />
          </div>

          {/* Right Column: Interventions Strategy Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <InterventionPanel
              interventions={interventions}
              onUpdateInterventions={setInterventions}
              lang={lang}
              themeMode={themeMode}
            />
          </div>
        </div>

        {/* Bottom Section: Comprehensive Results & Impact Analysis Dashboard */}
        <ResultsPanel
          simulationResult={simulationResult}
          baselineResult={baselineResult}
          settings={settings}
          interventions={interventions}
          epiParams={epiParams}
          lang={lang}
          themeMode={themeMode}
        />
      </main>

      {/* Auxiliary Modals */}
      <AdvancedSettingsModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        epiParams={epiParams}
        onUpdateEpiParams={setEpiParams}
      />

      <AboutMethodologyModal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
      />

      <CustomDataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSettlements={(newSettlements) => {
          setCustomSettlements(newSettlements);
          handleRunSimulation(false);
        }}
      />

      {/* Footer */}
      <footer className={`border-t text-xs py-3 text-center transition-colors ${
        themeMode === 'light'
          ? 'bg-slate-200/90 border-slate-300 text-slate-700'
          : 'bg-slate-900/80 border-slate-800/80 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium">SPARTA &copy; 2026 — Spatial Prediction And Rabies Transmission Analysis (One Health Framework)</span>
          <span className={`font-mono text-[11px] ${themeMode === 'light' ? 'text-slate-600 font-semibold' : 'text-slate-500'}`}>
            Leaflet GIS &bull; Chart.js &bull; Spatial Agent SEIRD-V Kernel Model
          </span>
        </div>
      </footer>
    </div>
  );
}
