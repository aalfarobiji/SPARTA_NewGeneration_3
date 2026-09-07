import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SettlementPoint } from '../types';

interface CustomDataUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSettlements: (settlements: SettlementPoint[]) => void;
}

export const CustomDataUploadModal: React.FC<CustomDataUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSettlements
}) => {
  const [fileContent, setFileContent] = useState('');
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      parseData(text);
    };
    reader.readAsText(file);
  };

  const parseData = (text: string) => {
    setErrorMsg('');
    try {
      if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        // Parse JSON
        const json = JSON.parse(text);
        const list = Array.isArray(json) ? json : json.features || [];
        const settlements: SettlementPoint[] = list.map((item: any, idx: number) => ({
          id: `CUSTOM-${idx + 1}`,
          name: item.name || item.properties?.name || `Pemukiman ${idx + 1}`,
          regencyId: item.regencyId || item.properties?.regencyId || 'R101',
          provinceId: item.provinceId || item.properties?.provinceId || 'P1',
          lat: Number(item.lat || item.geometry?.coordinates?.[1] || -8.5),
          lng: Number(item.lng || item.geometry?.coordinates?.[0] || 115.2),
          dogPopulation: Number(item.dogPopulation || item.properties?.dogPopulation || 100),
          householdCount: Number(item.householdCount || item.properties?.householdCount || 150),
          isCustomUploaded: true
        }));

        setParsedCount(settlements.length);
        return settlements;
      } else {
        // Parse CSV
        const lines = text.trim().split('\n');
        if (lines.length < 2) throw new Error('File CSV kosong atau header tidak valid.');

        const settlements: SettlementPoint[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(s => s.replace(/"/g, '').trim());
          if (parts.length >= 4) {
            settlements.push({
              id: `CUSTOM-CSV-${i}`,
              name: parts[0] || `Pemukiman ${i}`,
              lat: Number(parts[1]),
              lng: Number(parts[2]),
              dogPopulation: Number(parts[3]) || 100,
              householdCount: Number(parts[4]) || 150,
              regencyId: 'R101',
              provinceId: 'P1',
              isCustomUploaded: true
            });
          }
        }
        setParsedCount(settlements.length);
        return settlements;
      }
    } catch (err: any) {
      setErrorMsg(`Gagal memuat data: ${err.message || 'Format tidak valid'}`);
      setParsedCount(null);
      return [];
    }
  };

  const handleApply = () => {
    if (!fileContent) return;
    const items = parseData(fileContent);
    if (items && items.length > 0) {
      onUploadSettlements(items);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">
              Upload Data Pemukiman &amp; Populasi Anjing Riil
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Gantikan data pemukiman sintetis dengan data lapangan riil dalam format <strong>CSV</strong> atau <strong>GeoJSON</strong>.
        </p>

        {/* Upload box */}
        <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/50">
          <input
            type="file"
            accept=".csv,.json,.geojson"
            onChange={handleFileUpload}
            className="hidden"
            id="custom-file-input"
          />
          <label htmlFor="custom-file-input" className="cursor-pointer space-y-2 block">
            <FileText className="w-8 h-8 text-blue-400 mx-auto" />
            <span className="text-xs font-semibold text-slate-200 block">
              Klik untuk Memilih File CSV / GeoJSON
            </span>
            <span className="text-[10px] text-slate-500 block">
              Format CSV: Nama, Latitude, Longitude, DogPopulation, HouseholdCount
            </span>
          </label>
        </div>

        {parsedCount !== null && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Berhasil memproses <strong>{parsedCount} titik pemukiman</strong> riil!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Batal
          </button>

          <button
            onClick={handleApply}
            disabled={parsedCount === null || parsedCount === 0}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-lg text-xs"
          >
            Gunakan Data Ini
          </button>
        </div>
      </div>
    </div>
  );
};
