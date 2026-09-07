import React from 'react';
import {
  Syringe,
  Target,
  XCircle,
  Ban,
  Shield,
  AlertOctagon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { InterventionsState } from '../types';
import { Language, ThemeMode, TRANSLATIONS } from '../data/translations';

interface InterventionPanelProps {
  interventions: InterventionsState;
  onUpdateInterventions: (newInterventions: InterventionsState) => void;
  lang: Language;
  themeMode?: ThemeMode;
}

export const InterventionPanel: React.FC<InterventionPanelProps> = ({
  interventions,
  onUpdateInterventions,
  lang,
  themeMode = 'dark'
}) => {
  const t = TRANSLATIONS[lang];
  const isLight = themeMode === 'light';

  const updatePreventive = (patch: Partial<InterventionsState['preventiveVaccination']>) => {
    onUpdateInterventions({
      ...interventions,
      preventiveVaccination: { ...interventions.preventiveVaccination, ...patch }
    });
  };

  const updateReactive = (patch: Partial<InterventionsState['reactiveVaccination']>) => {
    onUpdateInterventions({
      ...interventions,
      reactiveVaccination: { ...interventions.reactiveVaccination, ...patch }
    });
  };

  const updateCulling = (patch: Partial<InterventionsState['culling']>) => {
    onUpdateInterventions({
      ...interventions,
      culling: { ...interventions.culling, ...patch }
    });
  };

  const updateMovementBan = (patch: Partial<InterventionsState['movementBan']>) => {
    onUpdateInterventions({
      ...interventions,
      movementBan: { ...interventions.movementBan, ...patch }
    });
  };

  return (
    <div className={`border rounded-2xl p-4 shadow-xl space-y-4 backdrop-blur transition-colors ${
      isLight
        ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
        : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl'
    }`}>
      {/* Title Header */}
      <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center space-x-2">
          <Shield className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <h2 className={`font-bold text-xs uppercase tracking-wider font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {t.interventionsTitle}
          </h2>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
          isLight ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          One Health Matrix
        </span>
      </div>

      {/* 1. PREVENTIVE VACCINATION CARD */}
      <div className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
        interventions.preventiveVaccination.enabled
          ? isLight
            ? 'bg-emerald-50/70 border-emerald-300'
            : 'bg-emerald-950/30 border-emerald-500/40'
          : isLight
            ? 'bg-slate-50 border-slate-200 opacity-80'
            : 'bg-slate-950/60 border-slate-800/80'
      }`}>
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!interventions.preventiveVaccination?.enabled}
              onChange={(e) => updatePreventive({ enabled: e.target.checked })}
              className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
            />
            <span className={`font-bold text-xs flex items-center ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <Syringe className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              {t.preventiveVaccinationTitle}
            </span>
          </label>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            interventions.preventiveVaccination?.enabled
              ? 'bg-emerald-600 text-white border-emerald-500'
              : isLight
                ? 'bg-slate-200 text-slate-600 border-slate-300'
                : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {interventions.preventiveVaccination?.enabled ? t.active : t.inactive}
          </span>
        </div>

        {interventions.preventiveVaccination?.enabled && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isLight ? 'text-slate-900' : 'text-slate-200'}>{t.vaccineCoverage}</span>
              <span className={`font-mono font-extrabold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                {interventions.preventiveVaccination.coveragePct}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              step={5}
              value={interventions.preventiveVaccination?.coveragePct ?? 70}
              onChange={(e) => updatePreventive({ coveragePct: Number(e.target.value) })}
              className="w-full accent-emerald-600 h-2 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-900"
            />
            <p className={`text-[11px] font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              * Target WHO: minimal 70% cakupan vaksinasi massal anjing untuk mencapai Herd Immunity.
            </p>
          </div>
        )}
      </div>

      {/* 2. REACTIVE EMERGENCY VACCINATION CARD */}
      <div className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
        interventions.reactiveVaccination.enabled
          ? isLight
            ? 'bg-sky-50/70 border-sky-300'
            : 'bg-sky-950/30 border-sky-500/40'
          : isLight
            ? 'bg-slate-50 border-slate-200 opacity-80'
            : 'bg-slate-950/60 border-slate-800/80'
      }`}>
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!interventions.reactiveVaccination?.enabled}
              onChange={(e) => updateReactive({ enabled: e.target.checked })}
              className="accent-sky-600 w-4 h-4 rounded cursor-pointer"
            />
            <span className={`font-bold text-xs flex items-center ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <Target className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              {t.reactiveVaccinationTitle}
            </span>
          </label>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            interventions.reactiveVaccination?.enabled
              ? 'bg-sky-600 text-white border-sky-500'
              : isLight
                ? 'bg-slate-200 text-slate-600 border-slate-300'
                : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {interventions.reactiveVaccination?.enabled ? t.active : t.inactive}
          </span>
        </div>

        {interventions.reactiveVaccination?.enabled && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isLight ? 'text-slate-900' : 'text-slate-200'}>{t.triggerThreshold}</span>
              <span className={`font-mono font-extrabold ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                {interventions.reactiveVaccination.triggerCases} {t.casesCount}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={interventions.reactiveVaccination?.triggerCases ?? 1}
              onChange={(e) => updateReactive({ triggerCases: Number(e.target.value) })}
              className="w-full accent-sky-600 h-2 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-900"
            />

            <div className="flex justify-between items-center text-xs font-bold pt-1">
              <span className={isLight ? 'text-slate-900' : 'text-slate-200'}>{t.ringRadiusLabel}</span>
              <span className={`font-mono font-extrabold ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                {interventions.reactiveVaccination.radiusKm} km
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={interventions.reactiveVaccination?.radiusKm ?? 3}
              onChange={(e) => updateReactive({ radiusKm: Number(e.target.value) })}
              className="w-full accent-sky-600 h-2 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-900"
            />
          </div>
        )}
      </div>

      {/* 3. SELECTIVE STRAY DOG CULLING CARD */}
      <div className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
        interventions.culling?.enabled
          ? isLight
            ? 'bg-rose-50/70 border-rose-300'
            : 'bg-rose-950/30 border-rose-500/40'
          : isLight
            ? 'bg-slate-50 border-slate-200 opacity-80'
            : 'bg-slate-950/60 border-slate-800/80'
      }`}>
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!interventions.culling?.enabled}
              onChange={(e) => updateCulling({ enabled: e.target.checked })}
              className="accent-rose-600 w-4 h-4 rounded cursor-pointer"
            />
            <span className={`font-bold text-xs flex items-center ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              {t.cullingTitle}
            </span>
          </label>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            interventions.culling?.enabled
              ? 'bg-rose-600 text-white border-rose-500'
              : isLight
                ? 'bg-slate-200 text-slate-600 border-slate-300'
                : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {interventions.culling?.enabled ? t.active : t.inactive}
          </span>
        </div>

        {interventions.culling?.enabled && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isLight ? 'text-slate-900' : 'text-slate-200'}>{t.cullingRate}</span>
              <span className={`font-mono font-extrabold ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>
                {interventions.culling.efficiencyPct}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={interventions.culling?.efficiencyPct ?? 50}
              onChange={(e) => updateCulling({ efficiencyPct: Number(e.target.value) })}
              className="w-full accent-rose-600 h-2 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-900"
            />
          </div>
        )}
      </div>

      {/* 4. DOG MOVEMENT BAN / TRACEABILITY CARD */}
      <div className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
        interventions.movementBan?.enabled
          ? isLight
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-amber-950/30 border-amber-500/40'
          : isLight
            ? 'bg-slate-50 border-slate-200 opacity-80'
            : 'bg-slate-950/60 border-slate-800/80'
      }`}>
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!interventions.movementBan?.enabled}
              onChange={(e) => updateMovementBan({ enabled: e.target.checked })}
              className="accent-amber-600 w-4 h-4 rounded cursor-pointer"
            />
            <span className={`font-bold text-xs flex items-center ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <Ban className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              {t.movementBanTitle}
            </span>
          </label>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            interventions.movementBan?.enabled
              ? 'bg-amber-600 text-white border-amber-500'
              : isLight
                ? 'bg-slate-200 text-slate-600 border-slate-300'
                : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {interventions.movementBan?.enabled ? t.active : t.inactive}
          </span>
        </div>

        {interventions.movementBan?.enabled && (
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isLight ? 'text-slate-900' : 'text-slate-200'}>{t.banStrictness}</span>
              <span className={`font-mono font-extrabold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                {interventions.movementBan.compliancePct}% Efektivitas
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={interventions.movementBan?.compliancePct ?? 75}
              onChange={(e) => updateMovementBan({ compliancePct: Number(e.target.value) })}
              className="w-full accent-amber-600 h-2 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-900"
            />
            <p className={`text-[11px] font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              * Mengurangi potensi penularan rabies lintas wilayah kabupaten/kota.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

