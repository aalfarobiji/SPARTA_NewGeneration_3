import React from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  Settings,
  BookOpen,
  Upload,
  Layers,
  ShieldAlert,
  GitCompare,
  Sparkles,
  Sun,
  Moon,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { ScaleMode, SimulationSettings } from '../types';
import { Language, ThemeMode, TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  settings: SimulationSettings;
  onUpdateSettings: (newSettings: Partial<SimulationSettings>) => void;
  onRunSimulation: (runBaselineOverlay?: boolean) => void;
  onReset: () => void;
  isSimulating: boolean;
  onOpenAdvancedModal: () => void;
  onOpenMethodologyModal: () => void;
  onOpenUploadModal: () => void;
  hasBaselineComparison: boolean;
  lang: Language;
  onToggleLanguage: (newLang: Language) => void;
  themeMode: ThemeMode;
  onToggleTheme: (newTheme: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onRunSimulation,
  onReset,
  isSimulating,
  onOpenAdvancedModal,
  onOpenMethodologyModal,
  onOpenUploadModal,
  hasBaselineComparison,
  lang,
  onToggleLanguage,
  themeMode,
  onToggleTheme
}) => {
  const t = TRANSLATIONS[lang];
  const isLight = themeMode === 'light';

  return (
    <div className="sticky top-0 z-40">
      {/* Main Header Bar */}
      <header className={`px-4 py-3 shadow-md border-b backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/95 text-slate-900 border-slate-200'
          : 'bg-slate-950/90 text-white border-slate-800/80 shadow-2xl'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Branding & One Health Tagline */}
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-md transition-colors ${
              isLight
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-emerald-950/30'
            }`}>
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`font-extrabold text-xl tracking-tight font-sans flex items-center ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  SPARTA <span className={`text-[10px] font-mono ml-1.5 px-1.5 py-0.5 rounded font-bold border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-800 text-emerald-400 border-emerald-500/30'
                  }`}>v3.0</span>
                </h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center border ${
                  isLight
                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  {t.oneHealthBadge}
                </span>
              </div>
              <p className={`text-xs hidden sm:block mt-0.5 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Middle Group: Spatial Scale Dropdown, Language Switcher & Theme Toggle */}
          <div className="flex items-center space-x-2 flex-wrap">
            {/* Scale Selector */}
            <div className={`flex items-center space-x-2 p-1.5 rounded-xl border shadow-inner ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <Layers className={`w-4 h-4 ml-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
              <span className={`text-xs font-medium hidden md:inline ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {t.scaleLabel}
              </span>
              <select
                value={settings?.scaleMode ?? 'kabupaten'}
                onChange={(e) => onUpdateSettings({ scaleMode: e.target.value as ScaleMode })}
                className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-semibold ${
                  isLight
                    ? 'bg-white text-slate-800 border-slate-300 shadow-sm'
                    : 'bg-slate-950 text-slate-100 border-slate-800'
                }`}
              >
                <option value="kabupaten">{t.scaleKabupaten}</option>
                <option value="provinsi">{t.scaleProvinsi}</option>
                <option value="nasional">{t.scaleNasional}</option>
                <option value="custom">{t.scaleCustom}</option>
              </select>
            </div>

            {/* Bilingual Switcher (ID / EN) */}
            <div className={`flex items-center border p-1 rounded-xl ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                onClick={() => onToggleLanguage('id')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  lang === 'id'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>🇮🇩</span>
                <span>ID</span>
              </button>
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => onToggleTheme(isLight ? 'dark' : 'light')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
                isLight
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-slate-900 text-amber-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {isLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span className="hidden sm:inline">{t.themeLight}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span className="hidden sm:inline">{t.themeDark}</span>
                </>
              )}
            </button>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center space-x-2">
            <button
              onClick={() => onRunSimulation(false)}
              disabled={isSimulating}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md ${
                isSimulating
                  ? 'bg-emerald-700/50 text-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-700/30'
              }`}
            >
              {isSimulating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-emerald-100" />
                  <span>{t.simulating}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.runSimulation}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onRunSimulation(true)}
              disabled={isSimulating}
              title={lang === 'id' ? 'Bandingkan dengan skenario tanpa intervensi' : 'Compare with baseline no-intervention scenario'}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                hasBaselineComparison
                  ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : isLight
                    ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden lg:inline">{t.compareBaseline}</span>
            </button>

            <button
              onClick={onReset}
              disabled={isSimulating}
              title={t.reset}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Auxiliary Modal Buttons */}
            <button
              onClick={onOpenUploadModal}
              title={t.uploadData}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAdvancedModal}
              title={t.advancedSettings}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenMethodologyModal}
              title={t.methodology}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

