import React from 'react';
import { X, BookOpen, ShieldAlert, Award, FileText } from 'lucide-react';

interface AboutMethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutMethodologyModal: React.FC<AboutMethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-slate-100">
              Tentang &amp; Metodologi SPARTA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scientific Basis Section */}
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-blue-400 flex items-center">
              <Award className="w-4 h-4 mr-1.5" /> Model Spatial Kernel Rabies (Agent-Based &amp; Stochastic)
            </h4>
            <p>
              SPARTA (Spatial Prediction And Rabies Transmission Analysis) menggunakan pendekatan pemodelan stokastik berbasis agen (agent-based) dan jaringan metapopulasi terstruktur spasial. Penularan virus rabies antar anjing memodelkan fungsi penurunan peluang kontak berdasarkan jarak fisik (<strong>Spatial Distance Transmission Kernel</strong>):
            </p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-center text-blue-300">
              P(kontak | jarak d) = exp( - &lambda; &middot; d )
            </div>
            <p className="text-[11px] text-slate-400">
              di mana <strong>&lambda;</strong> adalah parameter skala spasial kernel (default 0.3 - 0.5 / km). Peluang gigitan dan transmisi aktual dihitung dari perkalian probabilitas kontak, probabilitas gigitan saat kontak, dan efisiensi transmisi virus rabies per gigitan.
            </p>
          </div>

          {/* Deep Learning Settlement & ABM Pipeline */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-cyan-400 flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5" /> Pipeline Spasial AI &amp; Agent-Based Modeling (ABM)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-300 block mb-1">1. Deep Learning Footprint</span>
                <p className="text-slate-400">
                  Identifikasi batas spasial pemukiman warga (poligon kluster bangunan/perumahan) berbasis segmentasi citra satelit resolusi tinggi.
                </p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-sky-300 block mb-1">2. Stochastic Assignment</span>
                <p className="text-slate-400">
                  Titik agen anjing dialokasikan secara acak (uniform stochastic sampling) secara ketat di dalam batas poligon pemukiman terdeteksi.
                </p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-emerald-300 block mb-1">3. ABM Dynamic Mobility</span>
                <p className="text-slate-400">
                  Simulasi pergerakan harian agen (roaming normal S/V vs. erratic wandering rabid I) dan transmisi kontak kernel spasial real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center">
              <FileText className="w-4 h-4 mr-1.5" /> Struktur Kompartemen SEIRD-V
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>S (Susceptible):</strong> Anjing rentan terinfeksi rabies.</li>
              <li><strong>E (Exposed/Incubating):</strong> Anjing terinfeksi tapi belum menular (Masa inkubasi mengikuti distribusi Gamma, rata-rata 30-60 hari).</li>
              <li><strong>I (Infectious/Clinical):</strong> Anjing bergejala klinis dan dapat menularkan via gigitan (Masa infeksius pendek 3-10 hari sebelum mati).</li>
              <li><strong>D (Dead/Removed):</strong> Anjing mati akibat rabies atau di-cull/eliminasi.</li>
              <li><strong>V (Vaccinated/Immune):</strong> Anjing kebal berkat vaksinasi preventif/reaktif dengan durasi kekebalan 1-3 tahun.</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-amber-400">
              📚 Referensi Ilmiah Utama
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Townsend et al. (2013). <em>Surveillance and control of rabies in free-roaming dogs: spatial agent-based models</em>. PLoS Negl Trop Dis.</li>
              <li>Hampson et al. (2009). <em>Transmission dynamics and prospects for the elimination of canine rabies</em>. PLoS Biology.</li>
              <li>WHO Rabies Technical Report Series (2018). <em>WHO Expert Consultation on Rabies, Third Report</em>. World Health Organization.</li>
              <li>Zinsstag et al. (2017). <em>Vaccination of dogs against rabies in developing countries: A review of cost-effectiveness studies</em>. Vaccine.</li>
            </ol>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-300 text-[11px] flex items-start space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-red-200">Disclaimer &amp; Catatan Penting:</strong>
              <span>
                SPARTA adalah alat bantu simulasi edukatif dan perencanaan skenario kebijakan. Parameter default diambil dari literatur ilmiah internasional dan sebaiknya divalidasi dengan data surveilans lapangan nyata oleh Dinas Kesehatan dan Dinas Peternakan setempat sebelum pengambilan keputusan operasional.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
