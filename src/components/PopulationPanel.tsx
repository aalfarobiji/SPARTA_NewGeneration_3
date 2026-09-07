import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  Dog,
  Calendar,
  AlertTriangle,
  Globe,
  Sliders,
  MousePointerClick,
  Shuffle,
  ShieldCheck
} from 'lucide-react';
import { Regency, SimulationSettings } from '../types';
import { getAllProvinces, getAllRegencies } from '../data/indonesiaData';
import { Language, ThemeMode, TRANSLATIONS } from '../data/translations';

interface PopulationPanelProps {
  settings: SimulationSettings;
  onUpdateSettings: (newSettings: Partial<SimulationSettings>) => void;
  targetRegencies: Regency[];
  lang: Language;
  themeMode?: ThemeMode;
}

export const PopulationPanel: React.FC<PopulationPanelProps> = ({
  settings,
  onUpdateSettings,
  targetRegencies,
  lang,
  themeMode = 'dark'
}) => {
  const t = TRANSLATIONS[lang];
  const isLight = themeMode === 'light';
  const provinces = getAllProvinces();
  const regencies = getAllRegencies();

  const selectedProvince = provinces.find(p => p.id === settings.selectedProvinceId) || provinces[0];
  const provinceRegencies = selectedProvince.regencies;

  const defaultDogPop = targetRegencies.reduce((sum, r) => sum + r.dogPopulation, 0);
  const defaultHumanPop = targetRegencies.reduce((sum, r) => sum + r.humanPopulation, 0);

  const [dogInputStr, setDogInputStr] = useState<string>(
    settings.customDogPopulation !== null && settings.customDogPopulation !== undefined
      ? String(settings.customDogPopulation)
      : String(defaultDogPop || '')
  );

  const [humanInputStr, setHumanInputStr] = useState<string>(
    settings.customHumanPopulation !== null && settings.customHumanPopulation !== undefined
      ? String(settings.customHumanPopulation)
      : String(defaultHumanPop || '')
  );

  useEffect(() => {
    if (settings.customDogPopulation !== null && settings.customDogPopulation !== undefined) {
      setDogInputStr(String(settings.customDogPopulation));
    } else {
      setDogInputStr(String(defaultDogPop || ''));
    }
  }, [settings.customDogPopulation, defaultDogPop]);

  useEffect(() => {
    if (settings.customHumanPopulation !== null && settings.customHumanPopulation !== undefined) {
      setHumanInputStr(String(settings.customHumanPopulation));
    } else {
      setHumanInputStr(String(defaultHumanPop || ''));
    }
  }, [settings.customHumanPopulation, defaultHumanPop]);

  const effectiveDogPop = settings.customDogPopulation ?? defaultDogPop;
  const effectiveHumanPop = settings.customHumanPopulation ?? defaultHumanPop;

  const totalArea = targetRegencies.reduce((sum, r) => sum + r.areaKm2, 0);
  const density = totalArea > 0 ? (effectiveDogPop / totalArea).toFixed(1) : '0';

  const isCustomPop = (settings.customDogPopulation !== null && settings.customDogPopulation !== undefined) ||
                      (settings.customHumanPopulation !== null && settings.customHumanPopulation !== undefined);

  return (
    <div className={`border rounded-2xl p-4 shadow-xl space-y-4 backdrop-blur transition-colors ${
      isLight
        ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
        : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl'
    }`}>
      {/* Title Header */}
      <div className={`flex items-center space-x-2 border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <Sliders className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
        <h2 className={`font-bold text-xs uppercase tracking-wider font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          {t.populationSettingsTitle}
        </h2>
      </div>

      {/* Region Selector Controls depending on scaleMode */}
      <div className="space-y-3">
        {settings.scaleMode === 'kabupaten' && (
          <>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {t.selectProvince}
              </label>
              <select
                value={settings.selectedProvinceId ?? ''}
                onChange={(e) => {
                  const provId = e.target.value;
                  const newProv = provinces.find(p => p.id === provId);
                  const firstRegId = newProv?.regencies[0]?.id || 'R101';
                  onUpdateSettings({
                    selectedProvinceId: provId,
                    selectedRegencyId: firstRegId
                  });
                }}
                className={`w-full border text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              >
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.island})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {t.selectRegency}
              </label>
              <select
                value={settings.selectedRegencyId}
                onChange={(e) => onUpdateSettings({ selectedRegencyId: e.target.value })}
                className={`w-full border text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              >
                {provinceRegencies.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isEndemic ? '(Endemis Rabies)' : '(Bebas Rabies)'}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {settings.scaleMode === 'provinsi' && (
          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {t.selectProvinceScope}
            </label>
            <select
              value={settings.selectedProvinceId}
              onChange={(e) => onUpdateSettings({ selectedProvinceId: e.target.value })}
              className={`w-full border text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-100'
              }`}
            >
              {provinces.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - Semua {p.regencies.length} Kab/Kota ({p.island})
                </option>
              ))}
            </select>
          </div>
        )}

        {settings.scaleMode === 'nasional' && (
          <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
            isLight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          }`}>
            <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{t.nationalScopeActive}</span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {t.nationalScopeDesc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Target Regency Demographic Stats & Direct Number Typing Inputs */}
      <div className={`p-3 rounded-2xl border space-y-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center ${
            isLight ? 'text-slate-800' : 'text-slate-200'
          }`}>
            <Dog className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
            Penyesuaian Estimasi Populasi (Ketik Mandiri)
          </span>

          {isCustomPop && (
            <button
              onClick={() => onUpdateSettings({ customDogPopulation: null, customHumanPopulation: null })}
              className="text-[10px] text-rose-500 font-extrabold hover:underline transition-colors"
            >
              Reset ke Default BPS
            </button>
          )}
        </div>

        {/* Inputs for Direct Number Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className={`block text-[11px] font-bold mb-1 flex items-center justify-between ${
              isLight ? 'text-sky-900' : 'text-sky-300'
            }`}>
              <span className="flex items-center">
                <Dog className="w-3 h-3 mr-1 text-sky-500" />
                Estimasi Anjing (Ekor):
              </span>
            </label>
            <input
              type="number"
              min={10}
              max={10000000}
              step={10}
              value={dogInputStr}
              onChange={(e) => {
                const raw = e.target.value;
                setDogInputStr(raw);
                if (raw === '') {
                  onUpdateSettings({ customDogPopulation: null });
                } else {
                  const num = parseInt(raw, 10);
                  if (!isNaN(num) && num > 0) {
                    onUpdateSettings({ customDogPopulation: num });
                  }
                }
              }}
              className={`w-full border text-xs font-mono font-bold rounded-xl p-2 focus:ring-2 focus:ring-emerald-500 transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}
              placeholder="Ketik jumlah anjing..."
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
              {(settings.customDogPopulation !== null && settings.customDogPopulation !== undefined) ? '⚡ Diatur mandiri' : '• Default BPS/Kemenkes'}
            </span>
          </div>

          <div>
            <label className={`block text-[11px] font-bold mb-1 flex items-center justify-between ${
              isLight ? 'text-emerald-900' : 'text-emerald-300'
            }`}>
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1 text-emerald-500" />
                Estimasi Manusia (Jiwa):
              </span>
            </label>
            <input
              type="number"
              min={100}
              max={100000000}
              step={100}
              value={humanInputStr}
              onChange={(e) => {
                const raw = e.target.value;
                setHumanInputStr(raw);
                if (raw === '') {
                  onUpdateSettings({ customHumanPopulation: null });
                } else {
                  const num = parseInt(raw, 10);
                  if (!isNaN(num) && num > 0) {
                    onUpdateSettings({ customHumanPopulation: num });
                  }
                }
              }}
              className={`w-full border text-xs font-mono font-bold rounded-xl p-2 focus:ring-2 focus:ring-emerald-500 transition-all ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}
              placeholder="Ketik jumlah manusia..."
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
              {(settings.customHumanPopulation !== null && settings.customHumanPopulation !== undefined) ? '⚡ Diatur mandiri' : '• Default BPS/Kemenkes'}
            </span>
          </div>
        </div>

        {/* Calculated Indicators */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px]">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {t.dogDensity}:
            </span>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {density} ekor/km²
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {t.endemicStatus}:
            </span>
            <span className={`font-bold ${
              targetRegencies.some(r => r.isEndemic)
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {targetRegencies.some(r => r.isEndemic) ? t.statusEndemic : t.statusRabiesFree}
            </span>
          </div>
        </div>
      </div>

      {/* Epidemic Simulation Parameters (Index Dogs & Duration) */}
      <div className={`border-t pt-3 space-y-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`text-xs font-bold flex items-center ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <Dog className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
              {t.initialInfectedLabel}
            </label>
            <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md border ${
              isLight
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'text-rose-300 bg-rose-500/20 border-rose-500/30'
            }`}>
              {settings.indexCaseCount ?? 1} {t.dogsCount}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={settings.indexCaseCount ?? 1}
            onChange={(e) => onUpdateSettings({ indexCaseCount: Number(e.target.value) })}
            className="w-full accent-rose-500 h-2 bg-slate-200 dark:bg-slate-950 rounded-lg cursor-pointer"
          />
          <span className={`text-[11px] font-medium block mt-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {t.indexDogHelpText}
          </span>
        </div>

        {/* Index Dog Placement Strategy Mode */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            {t.placementModeLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateSettings({ placementMode: 'random' })}
              className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                settings.placementMode === 'random'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : isLight
                    ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{t.randomPlacement}</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ placementMode: 'manual' })}
              className={`p-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition-all ${
                settings.placementMode === 'manual'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : isLight
                    ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>{t.manualPlacement}</span>
            </button>
          </div>

          {settings.placementMode === 'manual' && (
            <div className={`mt-2 p-2 rounded-xl border text-[11px] space-y-1 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            }`}>
              <div className="font-bold flex items-center">
                <MapPin className="w-3 h-3 text-amber-600 mr-1" />
                {t.manualPinActiveTitle} ({settings.manualIndexCoords.length} {t.pinsPlaced})
              </div>
              <p className="opacity-90">{t.clickMapInstruction}</p>
              {settings.manualIndexCoords.length > 0 && (
                <button
                  onClick={() => onUpdateSettings({ manualIndexCoords: [] })}
                  className="text-[10px] underline text-rose-600 dark:text-rose-400 font-bold block pt-0.5"
                >
                  {t.clearPins}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Duration in Years */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`text-xs font-bold flex items-center ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <Calendar className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              {t.simulationDuration}
            </label>
            <span className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md border ${
              isLight
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'
            }`}>
              {settings.durationYears} {t.years} ({settings.durationYears * 365} {t.days})
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={settings.durationYears ?? 2}
            onChange={(e) => onUpdateSettings({ durationYears: Number(e.target.value) })}
            className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

