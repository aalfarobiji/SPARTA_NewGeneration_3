import React, { useState } from 'react';
import {
  Line,
  Bar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Activity,
  HeartPulse,
  DollarSign,
  Table as TableIcon,
  Lightbulb,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Dog,
  Users,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { EpiParameters, InterventionsState, SimulationResult, SimulationSettings } from '../types';
import { getAllRegencies, getAllProvinces } from '../data/indonesiaData';
import { Language, ThemeMode, TRANSLATIONS } from '../data/translations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ResultsPanelProps {
  simulationResult: SimulationResult | null;
  baselineResult: SimulationResult | null;
  settings: SimulationSettings;
  interventions: InterventionsState;
  epiParams: EpiParameters;
  lang: Language;
  themeMode?: ThemeMode;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  simulationResult,
  baselineResult,
  settings,
  interventions,
  epiParams,
  lang,
  themeMode = 'dark'
}) => {
  const t = TRANSLATIONS[lang];
  const isLight = themeMode === 'light';
  const [activeTab, setActiveTab] = useState<'curve' | 'health' | 'economy' | 'table' | 'recommendations'>('curve');
  const [searchTerm, setSearchTerm] = useState('');

  if (!simulationResult) {
    return (
      <div className={`border rounded-2xl p-8 text-center backdrop-blur flex flex-col items-center justify-center space-y-3 min-h-[220px] transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-600 shadow-md' : 'bg-slate-900/90 border-slate-800 text-slate-400 shadow-2xl'
      }`}>
        <Activity className={`w-10 h-10 animate-pulse ${isLight ? 'text-emerald-600' : 'text-emerald-500/50'}`} />
        <div>
          <h3 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.noSimulationYet}</h3>
          <p className={`text-xs max-w-md mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.noSimulationSubtitle}</p>
        </div>
      </div>
    );
  }

  const { summary, history } = simulationResult;
  const allRegencies = getAllRegencies();

  // Export Table Data to CSV
  const handleExportCSV = () => {
    const headers = ['Kabupaten_Kota', 'Provinsi', 'Populasi_Anjing', 'Dosis_Vaksin_Anjing_Dibutuhkan', 'Paparan_Gigitan_Manusia', 'Dosis_PEP_Manusia', 'Estimasi_Biaya_IDR'];
    const rows = summary.regencyDemandTable.map(row => [
      `"${row.regencyName}"`,
      `"${row.provinceName}"`,
      row.dogPopulation,
      row.dogVaccinesNeeded,
      row.humanBiteExposures,
      row.humanPepRegimens,
      row.totalCostIDR
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPARTA_Kebutuhan_Vaksin_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare Epidemic Curve Chart Data
  const sampleHistory = history.filter((_, idx) => idx % Math.max(1, Math.floor(history.length / 50)) === 0);
  const labels = sampleHistory.map(h => `Hari ${h.day}`);

  const curveChartData = {
    labels,
    datasets: [
      {
        label: `${t.statusInfectious} (I)`,
        data: sampleHistory.map(h => h.I),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
        fill: true,
        tension: 0.3
      },
      {
        label: `${t.statusExposed} (E)`,
        data: sampleHistory.map(h => h.E),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        fill: true,
        tension: 0.3
      },
      {
        label: `${t.statusVaccinated} (V)`,
        data: sampleHistory.map(h => h.V),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: false,
        tension: 0.3
      },
      ...(baselineResult ? [{
        label: `${t.baselineCurveLabel} (I)`,
        data: baselineResult.history
          .filter((_, idx) => idx % Math.max(1, Math.floor(baselineResult.history.length / 50)) === 0)
          .map(h => h.I),
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        fill: false,
        tension: 0.3
      }] : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isLight ? '#1e293b' : '#cbd5e1', font: { size: 11, weight: 'bold' as const } } },
      tooltip: { mode: 'index' as const, intersect: false }
    },
    scales: {
      x: { ticks: { color: isLight ? '#475569' : '#94a3b8', font: { size: 10 } }, grid: { color: isLight ? '#e2e8f0' : '#1e293b' } },
      y: { ticks: { color: isLight ? '#475569' : '#94a3b8', font: { size: 10 } }, grid: { color: isLight ? '#e2e8f0' : '#1e293b' } }
    }
  };

  // Filter demand table based on search
  const filteredDemandTable = summary.regencyDemandTable.filter(r =>
    r.regencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.provinceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`border rounded-2xl p-4 shadow-2xl space-y-4 backdrop-blur transition-colors ${
      isLight
        ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
        : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Key Metric KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className={`text-[11px] uppercase font-extrabold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.totalDogCases}</span>
          <div className="flex items-baseline space-x-1">
            <strong className={`text-lg font-bold font-mono ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>{summary.totalDogCases.toLocaleString('id-ID')}</strong>
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>ekor</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className={`text-[11px] uppercase font-extrabold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.outbreakDuration}</span>
          <div className="flex items-baseline space-x-1">
            <strong className={`text-lg font-bold font-mono ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{summary.outbreakClearedDay ? `${summary.outbreakClearedDay}` : `${settings.durationYears * 365}+`}</strong>
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{t.days}</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className={`text-[11px] uppercase font-extrabold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.affectedRegenciesCount}</span>
          <div className="flex items-baseline space-x-1">
            <strong className={`text-lg font-bold font-mono ${isLight ? 'text-sky-700' : 'text-sky-400'}`}>{summary.affectedRegenciesCount}</strong>
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Kab/Kota</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className={`text-[11px] uppercase font-extrabold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.humanExposures}</span>
          <div className="flex items-baseline space-x-1">
            <strong className={`text-lg font-bold font-mono ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>{summary.totalHumanBiteExposures.toLocaleString('id-ID')}</strong>
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>kasus</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border space-y-1 col-span-2 md:col-span-1 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <span className={`text-[11px] uppercase font-extrabold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{t.livesSaved}</span>
          <div className="flex items-baseline space-x-1">
            <strong className={`text-lg font-bold font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{summary.estimatedHumanLivesSaved.toLocaleString('id-ID')}</strong>
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>jiwa</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex flex-wrap border-b gap-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('curve')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center space-x-1.5 transition-all ${
            activeTab === 'curve'
              ? isLight
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/80 font-bold'
                : 'border-emerald-500 text-emerald-400 bg-slate-950 font-bold'
              : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{t.tabCurve}</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center space-x-1.5 transition-all ${
            activeTab === 'health'
              ? isLight
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/80 font-bold'
                : 'border-emerald-500 text-emerald-400 bg-slate-950 font-bold'
              : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{t.tabHealth}</span>
        </button>

        <button
          onClick={() => setActiveTab('economy')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center space-x-1.5 transition-all ${
            activeTab === 'economy'
              ? isLight
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/80 font-bold'
                : 'border-emerald-500 text-emerald-400 bg-slate-950 font-bold'
              : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{t.tabEconomy}</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center space-x-1.5 transition-all ${
            activeTab === 'table'
              ? isLight
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/80 font-bold'
                : 'border-emerald-500 text-emerald-400 bg-slate-950 font-bold'
              : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>{t.tabVaccineTable}</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center space-x-1.5 transition-all ${
            activeTab === 'recommendations'
              ? isLight
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/80 font-bold'
                : 'border-emerald-500 text-emerald-400 bg-slate-950 font-bold'
              : isLight
                ? 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.tabRecommendations}</span>
        </button>
      </div>

      {/* TAB CONTENT 1: EPIDEMIC CURVE CHART */}
      {activeTab === 'curve' && (
        <div className={`p-4 rounded-xl border space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
        }`}>
          <div className="flex justify-between items-center text-xs mb-2">
            <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Dinamika Kompartemen SEIRD-V (Durasi {settings.durationYears} Tahun)
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Peak Daily: {summary.peakInfectedDogs} ekor</span>
          </div>
          <div className="h-64 w-full">
            <Line data={curveChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: HEALTH IMPACT */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <h4 className="font-bold text-sm flex items-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4 mr-1.5" /> Beban Kesehatan Manusia
            </h4>
            <ul className={`space-y-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <li className={`flex justify-between border-b pb-1 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Estimasi Gigitan Anjing Rabies:</span>
                <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{summary.totalHumanBiteExposures.toLocaleString('id-ID')} kasus</strong>
              </li>
              <li className={`flex justify-between border-b pb-1 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Dosis PEP Manusia Dibutuhkan:</span>
                <strong className="font-mono text-indigo-600 dark:text-indigo-300">{summary.totalHumanPepNeeded.toLocaleString('id-ID')} dosis</strong>
              </li>
              <li className={`flex justify-between border-b pb-1 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Estimasi Kematian Tanpa PEP:</span>
                <strong className="font-mono text-rose-600 dark:text-rose-400">{summary.estimatedHumanFatalitiesWithoutPEP.toLocaleString('id-ID')} jiwa</strong>
              </li>
              <li className="flex justify-between pb-1">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Estimasi Jiwa Terselamatkan (PEP):</span>
                <strong className="font-mono text-emerald-600 dark:text-emerald-400">{summary.estimatedHumanLivesSaved.toLocaleString('id-ID')} jiwa</strong>
              </li>
            </ul>
          </div>

          <div className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            <h4 className="font-bold text-sm flex items-center text-emerald-600 dark:text-emerald-400">
              <Dog className="w-4 h-4 mr-1.5" /> Kesehatan &amp; Cakupan Populasi Anjing
            </h4>
            <ul className={`space-y-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <li className={`flex justify-between border-b pb-1 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Total Dosis Vaksin Anjing Diberikan:</span>
                <strong className="font-mono text-emerald-600 dark:text-emerald-300">{summary.totalDogVaccinesAdministered.toLocaleString('id-ID')} dosis</strong>
              </li>
              <li className={`flex justify-between border-b pb-1 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Total Anjing Di-cull (Depopulasi):</span>
                <strong className="font-mono text-rose-600 dark:text-rose-300">{summary.totalDogsCulled.toLocaleString('id-ID')} ekor</strong>
              </li>
              <li className="flex justify-between pb-1">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Puncak Kasus Harian (Peak):</span>
                <strong className="font-mono text-amber-600 dark:text-amber-300">{summary.peakInfectedDogs} ekor / hari</strong>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ECONOMIC IMPACT */}
      {activeTab === 'economy' && (
        <div className={`p-4 rounded-xl border space-y-4 text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
        }`}>
          <h4 className="font-bold text-sm flex items-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-4 h-4 mr-1.5" /> Rincian Estimasi Biaya Program One Health (IDR)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-3 border rounded-xl space-y-1 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`text-[11px] block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Biaya Vaksinasi Anjing:</span>
              <strong className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Rp {summary.totalDogVaccineCostIDR.toLocaleString('id-ID')}
              </strong>
            </div>

            <div className={`p-3 border rounded-xl space-y-1 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`text-[11px] block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Biaya PEP Manusia:</span>
              <strong className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Rp {summary.totalHumanPepCostIDR.toLocaleString('id-ID')}
              </strong>
            </div>

            <div className={`p-3 border rounded-xl space-y-1 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`text-[11px] block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Biaya Operasional Culling:</span>
              <strong className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">
                Rp {summary.totalCullingCostIDR.toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          <div className={`p-3 border rounded-xl flex justify-between items-center text-sm font-bold ${
            isLight ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
          }`}>
            <span>TOTAL ESTIMASI ANGGARAN DIREKOMENDASIKAN:</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 text-base">
              Rp {summary.totalEconomicCostIDR.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: VACCINE DEMAND TABLE */}
      {activeTab === 'table' && (
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm ?? ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-800 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportCSV}</span>
            </button>
          </div>

          <div className={`max-h-72 overflow-x-auto overflow-y-auto border rounded-xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <table className="w-full text-left border-collapse">
              <thead className={`sticky top-0 border-b text-[11px] font-semibold ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}>
                <tr>
                  <th className="p-2.5">{t.regencyCol}</th>
                  <th className="p-2.5">{t.provinceCol}</th>
                  <th className="p-2.5 text-right">{t.dogPopCol}</th>
                  <th className="p-2.5 text-right">{t.dogVacNeededCol}</th>
                  <th className="p-2.5 text-right">{t.humanExposuresCol}</th>
                  <th className="p-2.5 text-right">{t.humanPepCol}</th>
                  <th className="p-2.5 text-right">{t.costCol}</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono text-[11px] ${
                isLight ? 'divide-slate-200' : 'divide-slate-800/60'
              }`}>
                {filteredDemandTable.length > 0 ? (
                  filteredDemandTable.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${
                      isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'
                    }`}>
                      <td className={`p-2.5 font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{row.regencyName}</td>
                      <td className={`p-2.5 font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{row.provinceName}</td>
                      <td className={`p-2.5 text-right ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{row.dogPopulation.toLocaleString('id-ID')}</td>
                      <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">{row.dogVaccinesNeeded.toLocaleString('id-ID')}</td>
                      <td className="p-2.5 text-right text-rose-600 dark:text-rose-400">{row.humanBiteExposures.toLocaleString('id-ID')}</td>
                      <td className="p-2.5 text-right text-indigo-600 dark:text-indigo-400">{row.humanPepRegimens.toLocaleString('id-ID')}</td>
                      <td className={`p-2.5 text-right ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Rp {row.totalCostIDR.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={`p-4 text-center font-sans ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      Tidak ada data kabupaten/kota yang sesuai pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: ONE HEALTH POLICY RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className={`p-4 rounded-xl border space-y-3 text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-100'
        }`}>
          <h4 className="font-bold text-sm flex items-center text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-4 h-4 mr-1.5" /> Rekomendasi Strategis Kebijakan One Health
          </h4>

          <div className="space-y-2.5">
            <div className={`p-3 border rounded-xl space-y-1 ${
              isLight ? 'bg-white border-emerald-300' : 'bg-slate-900 border-emerald-500/30'
            }`}>
              <strong className="text-emerald-700 dark:text-emerald-300 font-bold block flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Target Vaksinasi Massal Minimun 70%
              </strong>
              <p className={`leading-relaxed text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Pertahankan cakupan kekebalan populasi anjing (V) di atas 70% untuk menciptakan herd immunity spasial, menurunkan Rt &lt; 1, dan mencegah eliminasi virus di reservoir utama.
              </p>
            </div>

            <div className={`p-3 border rounded-xl space-y-1 ${
              isLight ? 'bg-white border-sky-300' : 'bg-slate-900 border-sky-500/30'
            }`}>
              <strong className="text-sky-700 dark:text-sky-300 font-bold block flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-sky-600 dark:text-sky-400" /> Tim Reaksi Cepat Ring Vaccination
              </strong>
              <p className={`leading-relaxed text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Aktifkan tim reaksi cepat vaksinasi reaktif dalam radius 3 km dari index case terkonfirmasi dalam waktu kurang dari 3 hari untuk memutus rantai transmisi lokal.
              </p>
            </div>

            <div className={`p-3 border rounded-xl space-y-1 ${
              isLight ? 'bg-white border-indigo-300' : 'bg-slate-900 border-indigo-500/30'
            }`}>
              <strong className="text-indigo-700 dark:text-indigo-300 font-bold block flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" /> Penguatan Stok PEP Manusia di Puskesmas
              </strong>
              <p className={`leading-relaxed text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Pasokan Post-Exposure Prophylaxis (PEP) dan Serum Anti Rabies (SAR) harus didistribusikan secara proporsional ke wilayah dengan kepadatan populasi anjing tinggi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
