import React from 'react';
import { X, Settings, RotateCcw, Sliders } from 'lucide-react';
import { EpiParameters } from '../types';
import { DEFAULT_EPI_PARAMS } from '../data/defaultSettings';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  epiParams: EpiParameters;
  onUpdateEpiParams: (params: EpiParameters) => void;
}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  epiParams,
  onUpdateEpiParams
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof EpiParameters, value: number) => {
    onUpdateEpiParams({
      ...epiParams,
      [field]: value
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-slate-100">
              Pengaturan Lanjutan Parameter Epidemiologi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Sections */}
        <div className="space-y-4 text-xs">
          {/* Section 1: Kernel & Transmission */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center">
              <Sliders className="w-4 h-4 mr-1.5 text-blue-400" /> Parameter Kernel Spasial &amp; Transmisi
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Parameter Skala Kernel Spasial ($\lambda$ / km):
                </label>
                <input
                  type="number"
                  step={0.05}
                  min={0.05}
                  max={2.0}
                  value={epiParams.lambdaKernel ?? 0.4}
                  onChange={(e) => handleChange('lambdaKernel', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 0.40 / km</span>
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Rata-rata Masa Inkubasi (Hari):
                </label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={epiParams.meanIncubationPeriod ?? 30}
                  onChange={(e) => handleChange('meanIncubationPeriod', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 30 hari (Distribusi Gamma)</span>
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Rata-rata Masa Infeksius (Hari):
                </label>
                <input
                  type="number"
                  min={2}
                  max={14}
                  value={epiParams.meanInfectiousPeriod ?? 5}
                  onChange={(e) => handleChange('meanInfectiousPeriod', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 5 hari sebelum kematian</span>
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Probabilitas Gigitan Per Kontak:
                </label>
                <input
                  type="number"
                  step={0.05}
                  min={0.1}
                  max={1.0}
                  value={epiParams.pBiteGivenContact ?? 0.5}
                  onChange={(e) => handleChange('pBiteGivenContact', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 0.50</span>
              </div>
            </div>
          </div>

          {/* Section 2: Human Exposure & Costs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs">
              💰 Parameter Paparan Manusia &amp; Estimasi Biaya
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Rasio Paparan Gigitan Manusia per Anjing Rabies:
                </label>
                <input
                  type="number"
                  step={0.05}
                  min={0.05}
                  max={1.0}
                  value={epiParams.humanBiteExposureRatio ?? 0.2}
                  onChange={(e) => handleChange('humanBiteExposureRatio', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 0.20</span>
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Harga Vaksin Anjing per Dosis (Rupiah):
                </label>
                <input
                  type="number"
                  step={1000}
                  min={5000}
                  value={epiParams.dogVaccineCostIDR ?? 25000}
                  onChange={(e) => handleChange('dogVaccineCostIDR', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default: Rp 25.000</span>
              </div>

              <div>
                <label className="block text-slate-200 font-bold mb-1">
                  Biaya VAR / PEP Manusia per Pasien (Rupiah):
                </label>
                <input
                  type="number"
                  step={50000}
                  min={100000}
                  value={epiParams.humanPEPCostIDR ?? 1500000}
                  onChange={(e) => handleChange('humanPEPCostIDR', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Default: Rp 1.500.000</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Faktor Cadangan Wastage Vaksin Anjing:
                </label>
                <input
                  type="number"
                  step={0.05}
                  min={1.0}
                  max={1.5}
                  value={epiParams.dogVaccineWastageFactor ?? 1.15}
                  onChange={(e) => handleChange('dogVaccineWastageFactor', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-100 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Default: 1.15 (+15%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            onClick={() => onUpdateEpiParams(DEFAULT_EPI_PARAMS)}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Default</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs"
          >
            Simpan &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
