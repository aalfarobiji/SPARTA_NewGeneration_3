import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Flame,
  Dog,
  Clock,
  Calendar,
  Activity,
  Maximize2,
  Minimize2,
  Map as MapIcon,
  ChevronDown,
  Check
} from 'lucide-react';
import { Regency, SettlementPoint, SimulationResult, SimulationSettings } from '../types';
import { Language, ThemeMode, TRANSLATIONS } from '../data/translations';

export type BasemapType = 'auto' | 'satellite' | 'osm' | 'terrain' | 'street' | 'carto_dark' | 'carto_light';

export interface BasemapOption {
  id: BasemapType;
  name: string;
  category: string;
  icon: string;
  badge?: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'satellite',
    name: 'Citra Satelit (Esri World Imagery)',
    category: 'Satelit & Foto Udara',
    icon: '🛰️',
    badge: 'HD Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS Community',
    maxZoom: 19
  },
  {
    id: 'osm',
    name: 'OpenStreetMap (OSM Standard)',
    category: 'Vektor Standar',
    icon: '🗺️',
    badge: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  },
  {
    id: 'terrain',
    name: 'Topografi & Kontur Elevasi (OpenTopoMap)',
    category: 'Topografi & Elevasi',
    icon: '🏔️',
    badge: 'Topografi',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Peta: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Gaya: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    subdomains: ['a', 'b', 'c']
  },
  {
    id: 'street',
    name: 'Peta Jalan & Bangunan (Esri World Street)',
    category: 'Peta Jalan Terperinci',
    icon: '🛣️',
    badge: 'Esri Street',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; DeLorme, NAVTEQ, TomTom, USGS, Intermap, iPC, METI',
    maxZoom: 19
  },
  {
    id: 'carto_dark',
    name: 'CartoDB Dark Matter (Kontras Gelap)',
    category: 'Tema Gelap',
    icon: '🌑',
    badge: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  },
  {
    id: 'carto_light',
    name: 'CartoDB Voyager (Terang & Bersih)',
    category: 'Tema Terang',
    icon: '☀️',
    badge: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  },
  {
    id: 'auto',
    name: 'Otomatis (Mengikuti Tema Gelap/Terang)',
    category: 'Default Adaptif',
    icon: '⚡',
    badge: 'Auto',
    url: '',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
  }
];

interface MapComponentProps {
  settings: SimulationSettings;
  targetRegencies: Regency[];
  settlements: SettlementPoint[];
  simulationResult: SimulationResult | null;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  onAddManualIndexCoord: (coords: [number, number]) => void;
  lang: Language;
  themeMode?: ThemeMode;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  settings,
  targetRegencies,
  settlements,
  simulationResult,
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onAddManualIndexCoord,
  lang,
  themeMode = 'dark'
}) => {
  const t = TRANSLATIONS[lang];
  const isLight = themeMode === 'light';
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const basemapMenuRef = useRef<HTMLDivElement>(null);

  // Basemap & Layer visibility state
  const [selectedBasemap, setSelectedBasemap] = useState<BasemapType>('auto');
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showDogs, setShowDogs] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Close basemap dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (basemapMenuRef.current && !basemapMenuRef.current.contains(e.target as Node)) {
        setShowBasemapMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fullscreen toggle function (HTML5 API with fallback to CSS viewport overlay)
  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;

    if (!document.fullscreenElement && !isFullscreen) {
      if (mapWrapperRef.current.requestFullscreen) {
        mapWrapperRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Sync state on document fullscreenchange
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Resize Leaflet canvas whenever fullscreen toggles
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 150);
    }
  }, [isFullscreen]);

  // Helper to compute active tile parameters
  const getActiveBasemapConfig = () => {
    const opt = BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];
    if (selectedBasemap === 'auto') {
      return {
        url: isLight
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap | SPARTA One Health',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd']
      };
    }
    return {
      url: opt.url,
      attribution: opt.attribution + ' | SPARTA One Health',
      maxZoom: opt.maxZoom,
      subdomains: opt.subdomains || ['a', 'b', 'c', 'd']
    };
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149], // Indonesia center
        zoom: 5,
        zoomControl: false,
        preferCanvas: true
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      const activeCfg = getActiveBasemapConfig();
      const tileLayer = L.tileLayer(activeCfg.url, {
        attribution: activeCfg.attribution,
        maxZoom: activeCfg.maxZoom,
        subdomains: activeCfg.subdomains
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      layerGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;

      // Handle map click for manual index case placement
      map.on('click', (e: L.LeafletMouseEvent) => {
        onAddManualIndexCoord([e.latlng.lat, e.latlng.lng]);
      });
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when selectedBasemap or theme changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const activeCfg = getActiveBasemapConfig();

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(activeCfg.url, {
      attribution: activeCfg.attribution,
      maxZoom: activeCfg.maxZoom,
      subdomains: activeCfg.subdomains
    }).addTo(map);

    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [selectedBasemap, isLight]);

  // Center & Zoom map when target regencies change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || targetRegencies.length === 0) return;

    if (targetRegencies.length === 1) {
      const reg = targetRegencies[0];
      map.setView(reg.centroid, 11, { animate: true });
    } else {
      // Fit bounds for multiple regencies
      const bounds = L.latLngBounds(targetRegencies.map(r => r.centroid));
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  }, [targetRegencies, settings.scaleMode]);

  // Render Map Layers on simulation step or toggle change
  useEffect(() => {
    const map = leafletMapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw Regency Boundary Polygons
    if (showBoundaries) {
      targetRegencies.forEach(reg => {
        let polygon: L.Polygon;

        if (reg.bounds && reg.bounds.length >= 3) {
          polygon = L.polygon(reg.bounds, {
            color: reg.isEndemic ? '#e11d48' : '#059669',
            fillColor: reg.isEndemic ? '#f43f5e' : '#10b981',
            fillOpacity: isLight ? 0.15 : 0.08,
            weight: 2.2,
            dashArray: '5, 5'
          });
        } else {
          // Fallback smooth 12-point polygon within regency territory
          const fallbackPoly: [number, number][] = [];
          const numSides = 12;
          const rDeg = Math.min(0.04, Math.sqrt(reg.areaKm2) / 700);
          for (let i = 0; i < numSides; i++) {
            const angle = (i / numSides) * 2 * Math.PI;
            fallbackPoly.push([
              reg.centroid[0] + rDeg * Math.sin(angle),
              reg.centroid[1] + rDeg * Math.cos(angle)
            ]);
          }
          polygon = L.polygon(fallbackPoly, {
            color: reg.isEndemic ? '#e11d48' : '#059669',
            fillColor: reg.isEndemic ? '#f43f5e' : '#10b981',
            fillOpacity: isLight ? 0.15 : 0.08,
            weight: 2,
            dashArray: '5, 5'
          });
        }

        polygon.bindTooltip(
          `<div class="text-xs font-semibold font-sans p-1"><b>${reg.name}</b><br/><span class="text-xs opacity-90">Batas Resmi Wilayah</span><br/>Pop. Anjing: ${reg.dogPopulation.toLocaleString('id-ID')}</div>`,
          { permanent: false, direction: 'top' }
        );

        layerGroup.addLayer(polygon);
      });
    }

    const targetRegencyIds = new Set(targetRegencies.map(r => r.id));

    // 2. Render Simulated Dog Statuses or Heatmap for Current Step
    const currentStepLog = simulationResult?.history[currentStepIndex];

    if (currentStepLog) {
      // Draw Manual Placement Pins
      if (settings.placementMode === 'manual' && settings.manualIndexCoords.length > 0) {
        settings.manualIndexCoords.forEach(([mLat, mLng], idx) => {
          const pinMarker = L.marker([mLat, mLng], {
            icon: L.divIcon({
              className: 'custom-pin-icon',
              html: `<div class="bg-rose-600 text-white font-bold text-xs p-1 rounded-full border-2 border-white shadow-lg animate-bounce">📍 #${idx + 1}</div>`,
              iconSize: [28, 28]
            })
          });
          layerGroup.addLayer(pinMarker);
        });
      }

      // Draw Heatmap around active infectious and exposed cases
      if (showHeatmap) {
        const infDogs = (currentStepLog?.dogs || []).filter(d => d.status === 'I' || d.status === 'E');
        infDogs.forEach(infDog => {
          const heatCircle = L.circle([infDog.x, infDog.y], {
            radius: 1200,
            color: '#ef4444',
            fillColor: '#dc2626',
            fillOpacity: infDog.status === 'I' ? 0.35 : 0.18,
            weight: 0
          });
          layerGroup.addLayer(heatCircle);
        });
      }

      // Render ALL dog points directly from currentStepLog.dogs for 1-to-1 representation
      if (showDogs) {
        let dogList = currentStepLog?.dogs;
        if (dogList && dogList.length > 0) {
          // Filter dogs to target regencies when in kabupaten/provinsi/custom mode
          if (settings.scaleMode !== 'nasional') {
            dogList = dogList.filter(d => !d.regencyId || targetRegencyIds.has(d.regencyId));
          }

          const totalDogCount = dogList.length;
          // Scale dot radius so 2000+ points fit cleanly on land
          const dotRadius = totalDogCount > 1500 ? 2.5 : totalDogCount > 500 ? 3.5 : 4.5;

          dogList.forEach(dog => {
            if (dog.status === 'I') {
              // High-visibility animated pulsing beacon / kedap-kedip for Active Rabies Infectious dogs
              const infectiousIcon = L.divIcon({
                className: 'custom-rabies-beacon-icon',
                html: `<div class="marker-rabies-infectious" style="width:28px;height:28px;">
                  <span class="pulse-ring"></span>
                  <span class="core-dot"></span>
                </div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              });

              const marker = L.marker([dog.x, dog.y], {
                icon: infectiousIcon,
                zIndexOffset: 2000
              });

              marker.bindTooltip(
                `<div class="text-xs font-sans p-1 leading-snug">
                  <strong class="text-red-700 dark:text-red-400 font-bold block mb-0.5">⚠️ ANJING RABIES AKTIF (INFECTIOUS)</strong>
                  <b class="text-slate-800 dark:text-slate-100">ID: #${dog.id}</b><br/>
                  <span class="text-rose-600 dark:text-rose-400 font-semibold">Status: Menular (Klinis / Menggigit)</span>
                </div>`,
                { permanent: false, direction: 'top' }
              );

              layerGroup.addLayer(marker);
            } else if (dog.status === 'E') {
              // Glowing pulsing indicator for Exposed dogs in incubation
              const exposedIcon = L.divIcon({
                className: 'custom-rabies-exposed-icon',
                html: `<div class="marker-rabies-exposed" style="width:18px;height:18px;">
                  <span class="core-dot"></span>
                </div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
              });

              const marker = L.marker([dog.x, dog.y], {
                icon: exposedIcon,
                zIndexOffset: 1000
              });

              marker.bindTooltip(
                `<div class="text-xs font-sans p-1 leading-snug">
                  <strong class="text-amber-700 dark:text-amber-400 font-bold block mb-0.5">⏳ MASA INKUBASI (EXPOSED)</strong>
                  <b class="text-slate-800 dark:text-slate-100">ID: #${dog.id}</b><br/>
                  <span class="text-amber-600 dark:text-amber-400">Status: Tertular (Akan menjadi Infectious)</span>
                </div>`,
                { permanent: false, direction: 'top' }
              );

              layerGroup.addLayer(marker);
            } else {
              // S (Susceptible), V (Vaccinated), D (Dead)
              let color = '#2563eb'; // S (Susceptible - Blue)
              let r = dotRadius;
              let strokeColor = '#0284c7';
              let strokeWeight = 0.5;

              if (dog.status === 'V') {
                color = '#16a34a'; // V (Vaccinated - Green)
                strokeColor = '#22c55e';
              } else if (dog.status === 'D') {
                color = '#475569'; // D (Dead - Dark Gray)
                strokeColor = '#334155';
              }

              const dogCircle = L.circleMarker([dog.x, dog.y], {
                radius: r,
                color: strokeColor,
                weight: strokeWeight,
                fillColor: color,
                fillOpacity: dog.status === 'D' ? 0.35 : 0.88
              });

              const statusText = dog.status === 'V' ? 'Divaksinasi (Kebal)' :
                dog.status === 'D' ? 'Mati / Eliminated' : 'Rentan (Susceptible)';

              dogCircle.bindTooltip(
                `<div class="text-xs font-sans p-1">
                  <strong>Anjing #${dog.id}</strong><br/>
                  Status: <span style="color:${color};font-weight:bold;">${statusText}</span>
                </div>`,
                { permanent: false, direction: 'top' }
              );

              layerGroup.addLayer(dogCircle);
            }
          });
        }
      }
    }
  }, [
    currentStepIndex,
    simulationResult,
    showBoundaries,
    showDogs,
    showHeatmap,
    targetRegencies,
    settings.placementMode,
    settings.manualIndexCoords,
    isLight
  ]);

  // Handle Animation Interval Playback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && simulationResult && simulationResult.history.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= simulationResult.history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationResult, playbackSpeed]);

  const currentLog = simulationResult?.history[currentStepIndex];
  const maxSteps = simulationResult?.history.length || 1;

  const currentYear = currentLog?.year || 1;
  const totalYears = settings.durationYears;
  const currentDay = currentLog?.day || 1;
  const totalDays = settings.durationYears * 365;

  return (
    <div
      ref={mapWrapperRef}
      className={`relative w-full flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none border-0'
          : 'h-full min-h-[520px] rounded-2xl overflow-hidden border shadow-xl'
      } ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 shadow-2xl'
      }`}
    >
      {/* Map Header Overlay / Layer Toggles, Basemap Switcher & Fullscreen Toggle */}
      <div className={`absolute top-3 left-3 right-3 z-20 backdrop-blur border p-2.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-2 transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Basemap Selection Popover */}
          <div className="relative" ref={basemapMenuRef}>
            <button
              onClick={() => setShowBasemapMenu(!showBasemapMenu)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isLight
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border-indigo-700/60'
              }`}
              title="Pilih Tampilan Citra Peta / Basemap Provider"
            >
              <span className="text-sm">
                {BASEMAP_OPTIONS.find(b => b.id === selectedBasemap)?.icon || '🗺️'}
              </span>
              <span className="font-extrabold">
                {BASEMAP_OPTIONS.find(b => b.id === selectedBasemap)?.badge || 'Basemap'}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showBasemapMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Basemap Dropdown Popover */}
            {showBasemapMenu && (
              <div className={`absolute top-full left-0 mt-1.5 w-72 rounded-xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
                isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/95 border-slate-700 text-slate-100'
              }`}>
                <div className={`text-[11px] font-bold px-2 py-1 uppercase tracking-wider mb-1 flex items-center justify-between border-b pb-1.5 ${
                  isLight ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-800'
                }`}>
                  <span className="flex items-center gap-1">
                    <MapIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Tampilan Basemap
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">7 Pilihan</span>
                </div>

                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {BASEMAP_OPTIONS.map((opt) => {
                    const isSelected = selectedBasemap === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedBasemap(opt.id);
                          setShowBasemapMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${
                          isSelected
                            ? isLight
                              ? 'bg-indigo-100/90 text-indigo-900 font-bold shadow-sm'
                              : 'bg-indigo-600/30 text-indigo-200 font-bold border border-indigo-500/40'
                            : isLight
                              ? 'hover:bg-slate-100 text-slate-700'
                              : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{opt.icon}</span>
                          <div>
                            <div className="font-semibold text-xs leading-snug flex items-center gap-1.5">
                              {opt.name}
                              {opt.badge && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                  isSelected
                                    ? isLight ? 'bg-indigo-200 text-indigo-800' : 'bg-indigo-500/40 text-indigo-200'
                                    : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            <div className={`text-[10px] ${
                              isSelected
                                ? isLight ? 'text-indigo-700' : 'text-indigo-300'
                                : isLight ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              {opt.category}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Quick Basemap Switcher Chips */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedBasemap('satellite')}
              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                selectedBasemap === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Citra Satelit Esri Resolusi Tinggi"
            >
              🛰️ Satelit
            </button>
            <button
              onClick={() => setSelectedBasemap('osm')}
              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                selectedBasemap === 'osm'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="OpenStreetMap Standard"
            >
              🗺️ OSM
            </button>
            <button
              onClick={() => setSelectedBasemap('terrain')}
              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                selectedBasemap === 'terrain'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Peta Topografi & Kontur Elevasi"
            >
              🏔️ Topografi
            </button>
            <button
              onClick={() => setSelectedBasemap('street')}
              className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all flex items-center gap-1 ${
                selectedBasemap === 'street'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Esri World Street Map"
            >
              🛣️ Street
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Simulation & Epidemiological Layer Toggles */}
          <span className={`text-xs font-bold flex items-center mr-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <Layers className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {t.layerLabel}
          </span>

          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
              showBoundaries
                ? isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {t.boundariesLayer}
          </button>

          <button
            onClick={() => setShowDogs(!showDogs)}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
              showDogs
                ? isLight ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Dog className="w-3 h-3 inline mr-1" /> {t.dogsLayer}
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
              showHeatmap
                ? isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                : isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Flame className="w-3 h-3 inline mr-1" /> {t.heatmapLayer}
          </button>

          {settings.placementMode === 'manual' && (
            <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-lg animate-pulse font-bold">
              {t.manualPinPrompt}
            </span>
          )}
        </div>

        {/* Fullscreen Map Mode Toggle */}
        <button
          onClick={toggleFullscreen}
          className={`text-xs px-3 py-1.5 rounded-xl font-extrabold border transition-all flex items-center space-x-1.5 shadow-md active:scale-95 ${
            isFullscreen
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
          }`}
          title={isFullscreen ? 'Keluar Mode Layar Penuh (ESC)' : 'Tampilkan Peta Layar Penuh (Fullscreen)'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Keluar Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Layar Penuh (Fullscreen)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Map Legend Widget */}
      <div className={`absolute bottom-20 left-3 z-20 backdrop-blur border p-2.5 rounded-xl shadow-lg text-xs space-y-1.5 hidden sm:block ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-300'
      }`}>
        <div className={`font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center ${
          isLight ? 'text-slate-700' : 'text-slate-200'
        }`}>
          <Activity className="w-3 h-3 mr-1 text-emerald-600" /> {t.dogStatusTitle}
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span>{t.statusSusceptible}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>{t.statusExposed}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center w-3.5 h-3.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500/70 inline-block animate-ping absolute"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-white inline-block relative shadow-sm"></span>
          </div>
          <span className="font-bold text-red-600 dark:text-red-400">{t.statusInfectious}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span>{t.statusVaccinated}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span>
          <span>{t.statusDead}</span>
        </div>
      </div>

      {/* TIMELINE CONTROL PANEL BELOW MAP — SYNCHRONIZED WITH DURATION */}
      <div className={`z-20 border-t p-3 flex flex-col gap-2 backdrop-blur transition-colors ${
        isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-950/95 border-slate-800 text-slate-200'
      }`}>
        {/* Top duration display bar */}
        <div className="flex items-center justify-between text-xs font-mono px-1">
          <div className={`flex items-center space-x-2 font-bold px-2.5 py-1 rounded-lg border ${
            isLight
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {t.yearOfTotal} {currentYear} / {totalYears} {t.years} ({currentDay} / {totalDays} {t.days})
            </span>
          </div>

          <div className={`flex items-center space-x-2 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.monthLabel} {currentLog?.month || 1}</span>
          </div>
        </div>

        {/* Timeline Slider and Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Playback Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentStepIndex(0)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Awal Simulasi"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!simulationResult}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> <span>PLAY</span>
                </>
              )}
            </button>

            <button
              onClick={() => setCurrentStepIndex(prev => Math.min(maxSteps - 1, prev + 1))}
              className={`p-1.5 rounded-lg border transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Langkah Berikutnya (+1)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Speed selector */}
            <select
              value={playbackSpeed ?? 1}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className={`text-xs px-2 py-1.5 rounded-lg border cursor-pointer font-semibold ${
                isLight
                  ? 'bg-white text-slate-800 border-slate-300 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <option value={1}>{t.speed} 1x</option>
              <option value={2}>{t.speed} 2x</option>
              <option value={5}>{t.speed} 5x</option>
              <option value={10}>{t.speed} 10x</option>
            </select>
          </div>

          {/* Timeline Range Scrubber */}
          <div className="flex-1 min-w-[200px] flex items-center space-x-2 px-1">
            <span className={`text-[11px] font-mono whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {t.dayLabel} {currentDay}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, maxSteps - 1)}
              value={currentStepIndex ?? 0}
              onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-900 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold whitespace-nowrap">
              Thn {currentYear}/{totalYears}
            </span>
          </div>

          {/* Dynamic Active Stats Pills */}
          <div className={`flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}>
            <span className="text-rose-600 font-bold">
              I: {currentLog?.I || 0}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              E: {currentLog?.E || 0}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              V: {currentLog?.V || 0}
            </span>
            <span className="text-sky-600 dark:text-sky-400 font-bold">
              Rt: {currentLog?.rt || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

