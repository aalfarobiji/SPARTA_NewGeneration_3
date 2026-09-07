<div align="center">

# 🐾 SPARTA — New Generation

**S**patial **P**rediction **A**nd **R**abies **T**ransmission **A**nalysis

Alat simulasi dan analisis intervensi penyebaran rabies berbasis *agent-based* dan *metapopulasi spasial*, khusus untuk wilayah Indonesia.

</div>

---

## 📖 Tentang Project

**SPARTA** adalah aplikasi web interaktif untuk memodelkan penyebaran virus rabies pada populasi anjing (dan risiko paparan pada manusia) di berbagai skala wilayah Indonesia — mulai dari tingkat kabupaten/kota, provinsi, kombinasi wilayah custom, hingga skala nasional.

Aplikasi ini mensimulasikan dinamika penularan menggunakan **Spatial Distance Transmission Kernel**, dengan struktur kompartemen epidemiologi **SEIRD-V** (*Susceptible – Exposed – Infectious – Recovered/Dead – Vaccinated*), dan memungkinkan pengguna menguji berbagai skenario intervensi kesehatan hewan/masyarakat seperti:

- 💉 **Vaksinasi preventif** (cakupan rutin/berkala)
- 🎯 **Vaksinasi reaktif** (respons cincin/*ring vaccination* setelah kasus terdeteksi)
- 🐕 **Culling** (pengendalian populasi di radius tertentu)
- 🚧 **Pembatasan pergerakan** (movement ban antar wilayah)

Hasil simulasi ditampilkan dalam bentuk peta interaktif, grafik perkembangan kasus, estimasi kebutuhan vaksin (hewan & manusia/PEP), serta estimasi biaya operasional — untuk mendukung perencanaan intervensi rabies berbasis bukti (pendekatan **One Health**).

## ✨ Fitur Utama

- 🗺️ **Peta interaktif** (Leaflet) dengan visualisasi sebaran kasus per wilayah
- 📊 **Model epidemiologi SEIRD-V** berbasis kernel spasial dan simulasi stokastik antar-individu (agent-based)
- 🌏 **4 skala analisis**: Kabupaten/Kota, Provinsi, Kombinasi wilayah custom, dan Nasional
- ▶️ **Playback simulasi** dengan kontrol kecepatan, per hari/bulan/tahun
- 📈 **Panel hasil** lengkap dengan grafik (Chart.js): kasus baru, kumulatif, Rt, dsb.
- 🛡️ **Panel intervensi** untuk mengatur skenario vaksinasi, culling, dan pembatasan pergerakan
- ⚙️ **Pengaturan lanjutan (Advanced Settings)** untuk parameter epidemiologi kustom
- 📤 **Upload data custom** (populasi/pemukiman) untuk simulasi berbasis data pengguna sendiri
- 🌗 **Mode gelap/terang** dan 🇮🇩🇬🇧 **dukungan dwibahasa** (Bahasa Indonesia & English)
- 📚 **Modal metodologi** yang menjelaskan dasar ilmiah model secara transparan
- 🤖 Integrasi **Gemini API** untuk kapabilitas AI tambahan di dalam aplikasi

## 🧱 Teknologi yang Digunakan

| Kategori | Teknologi |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| Peta | Leaflet |
| Grafik | Chart.js + react-chartjs-2 |
| Animasi | Motion (Framer Motion) |
| AI | Google Gemini API (`@google/genai`) |
| Server (opsional) | Express |
| Package manager | Bun / npm |

## 📁 Struktur Project

```
sparta_new-generation/
├── src/
│   ├── App.tsx                     # Komponen utama & state management
│   ├── main.tsx                    # Entry point React
│   ├── types.ts                    # Definisi tipe TypeScript (Regency, EpiParameters, dll)
│   ├── index.css                   # Global styles (Tailwind)
│   │
│   ├── components/
│   │   ├── Header.tsx                    # Header, kontrol skala & bahasa
│   │   ├── MapComponent.tsx              # Peta interaktif Leaflet
│   │   ├── PopulationPanel.tsx           # Panel data populasi anjing/manusia
│   │   ├── InterventionPanel.tsx         # Panel pengaturan intervensi
│   │   ├── ResultsPanel.tsx              # Panel hasil simulasi & grafik
│   │   ├── AdvancedSettingsModal.tsx     # Modal parameter epidemiologi lanjutan
│   │   ├── AboutMethodologyModal.tsx     # Modal penjelasan metodologi ilmiah
│   │   └── CustomDataUploadModal.tsx     # Modal upload data custom
│   │
│   ├── data/
│   │   ├── indonesiaData.ts        # Dataset provinsi & kabupaten/kota Indonesia
│   │   ├── defaultSettings.ts      # Nilai default parameter & pengaturan simulasi
│   │   └── translations.ts         # Teks terjemahan (ID/EN)
│   │
│   ├── simulation/
│   │   └── spatialKernelEngine.ts  # Mesin simulasi (kernel spasial, SEIRD-V, agent-based)
│   │
│   └── utils/
│       └── geoUtils.ts             # Fungsi utilitas geospasial
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── metadata.json
└── .env.example
```

## 🚀 Menjalankan Secara Lokal

### Prasyarat

- **Node.js** (disarankan versi 18 atau lebih baru)
- **npm** atau **Bun**
- API key **Gemini** (jika ingin menggunakan fitur AI)

### Langkah-langkah

1. **Clone / ekstrak project**, lalu masuk ke direktori project.

2. **Install dependencies**
   ```bash
   npm install
   ```
   atau jika menggunakan Bun:
   ```bash
   bun install
   ```

3. **Konfigurasi environment variable**

   Salin `.env.example` menjadi `.env.local`, lalu isi `GEMINI_API_KEY` dengan API key Gemini Anda:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   GEMINI_API_KEY="isi_dengan_api_key_anda"
   ```

4. **Jalankan aplikasi (mode development)**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

### Script yang Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server development (Vite) di port 3000 |
| `npm run build` | Build aplikasi untuk produksi |
| `npm run preview` | Menjalankan preview hasil build produksi |
| `npm run lint` | Pengecekan tipe TypeScript (`tsc --noEmit`) |
| `npm run clean` | Menghapus folder `dist` dan `server.js` |

## 🔬 Ringkasan Metodologi

Model simulasi menggunakan **kernel transmisi berbasis jarak spasial**:

```
P(kontak | jarak d) = exp(−λ · d)
```

di mana `λ` adalah parameter skala kernel spasial (default 0.3–0.5 per km). Peluang penularan aktual dihitung dari perkalian antara peluang kontak, peluang gigitan saat kontak, dan efisiensi transmisi virus per gigitan.

Setiap individu anjing dimodelkan sebagai *agent* dengan status kompartemen **S – E – I – R/D – V** (Susceptible, Exposed, Infectious, Recovered/Dead, Vaccinated), sehingga dinamika wabah, dampak intervensi, dan estimasi kebutuhan sumber daya (vaksin & biaya) dapat disimulasikan secara realistis pada skala ruang dan waktu tertentu.

Penjelasan lengkap dapat dilihat langsung di aplikasi melalui tombol **"Tentang & Metodologi"**.

## 🌐 Bahasa & Tema

Aplikasi mendukung:
- **Bahasa**: Indonesia (default) dan English — dapat diganti dari header aplikasi
- **Tema**: Dark mode (default) dan Light mode

## 📝 Catatan

- Dataset wilayah (provinsi, kabupaten/kota, populasi anjing & manusia) bersifat estimatif/sintetis untuk keperluan simulasi dan edukasi, bukan data resmi real-time.
- Fitur upload data custom memungkinkan pengguna memasukkan data pemukiman/populasi sendiri untuk hasil simulasi yang lebih spesifik terhadap wilayah tertentu.

## 📄 Lisensi

© 2026 **aalfarobiji**. Seluruh hak cipta dilindungi.
