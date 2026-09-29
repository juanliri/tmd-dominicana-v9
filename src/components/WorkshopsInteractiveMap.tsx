import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Wrench, 
  Navigation, 
  ShieldCheck, 
  Truck, 
  Search, 
  ExternalLink, 
  MessageCircle, 
  Layers, 
  LocateFixed, 
  CheckCircle2, 
  Compass,
  Building2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { TMD_WORKSHOPS } from '../data/workshops';
import { TmdWorkshop } from '../types';
import { useTheme } from '../context/ThemeContext';
import tmdEntranceImg from '../assets/images/tmd_sede_central_entrance_km22.jpg';
import tmdPatioImg from '../assets/images/tmd_sede_central_patio_km22.jpg';

interface WorkshopsInteractiveMapProps {
  onSelectWorkshop?: (workshop: TmdWorkshop) => void;
  onNavigate?: (route: string) => void;
}

export const WorkshopsInteractiveMap: React.FC<WorkshopsInteractiveMapProps> = ({
  onSelectWorkshop,
  onNavigate
}) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [onlyMobileUnits, setOnlyMobileUnits] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeWorkshopId, setActiveWorkshopId] = useState<string | null>(TMD_WORKSHOPS[0].id);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Haversine distance calculator (km)
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Dominican Republic AST (UTC-4) Real-Time Operational Hours Checker
  const getAstStatus = () => {
    try {
      const now = new Date();
      const drTimeStr = now.toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' });
      const drDate = new Date(drTimeStr);
      const day = drDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const hour = drDate.getHours();
      const minute = drDate.getMinutes();
      const timeVal = hour + minute / 60;

      if (day === 0) {
        return { isOpen: false, text: 'Cerrado Domingo • Móviles 24/7 en Obra', isEmergency: true };
      } else if (day === 6) {
        if (timeVal >= 8 && timeVal < 13) {
          return { isOpen: true, text: 'Abierto Ahora (Cierra 1:00 PM)', isEmergency: false };
        } else {
          return { isOpen: false, text: 'Cerrado hoy • Rescate Móvil 24/7 Activo', isEmergency: true };
        }
      } else {
        if (timeVal >= 8 && timeVal < 18) {
          return { isOpen: true, text: 'Abierto Ahora (Cierra 6:00 PM)', isEmergency: false };
        } else {
          return { isOpen: false, text: 'Cerrado hoy • Guardias Técnicas 24/7', isEmergency: true };
        }
      }
    } catch {
      return { isOpen: true, text: 'Lunes a Viernes 8:00 AM - 6:00 PM', isEmergency: false };
    }
  };

  const astStatus = getAstStatus();

  // Locate nearest workshop using Browser Geolocation
  const handleFindNearestWorkshop = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocalización no soportada en su navegador');
      return;
    }
    setIsLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);

        let closestWs = TMD_WORKSHOPS[0];
        let minDistance = Infinity;

        TMD_WORKSHOPS.forEach((ws) => {
          const dist = calculateDistanceKm(latitude, longitude, ws.coordinates[0], ws.coordinates[1]);
          if (dist < minDistance) {
            minDistance = dist;
            closestWs = ws;
          }
        });

        setActiveWorkshopId(closestWs.id);
        setLocationMessage(`Taller más cercano: ${closestWs.name} (a ${minDistance} km)`);
        if (onSelectWorkshop) onSelectWorkshop(closestWs);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(closestWs.coordinates, 13, { duration: 1.2 });
          if (markersRef.current[closestWs.id]) {
            markersRef.current[closestWs.id].openPopup();
          }
        }
      },
      () => {
        setIsLocating(false);
        setLocationMessage('No se pudo obtener su ubicación. Mostrando sede central.');
      },
      { timeout: 8000 }
    );
  };

  // Filtered workshops list
  const filteredWorkshops = TMD_WORKSHOPS.filter(ws => {
    if (selectedRegion !== 'all' && ws.region !== selectedRegion) return false;
    if (selectedProvince !== 'all' && ws.province !== selectedProvince) return false;
    if (onlyMobileUnits && !ws.hasMobileUnits) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ws.name.toLowerCase().includes(q);
      const matchProv = ws.province.toLowerCase().includes(q);
      const matchAddress = ws.address.toLowerCase().includes(q);
      const matchSpecialty = ws.specialties.some(s => s.toLowerCase().includes(q));
      return matchName || matchProv || matchAddress || matchSpecialty;
    }
    return true;
  });

  const activeWorkshop = TMD_WORKSHOPS.find(w => w.id === activeWorkshopId) || filteredWorkshops[0] || TMD_WORKSHOPS[0];

  // Distinct provinces list for dropdown filter
  const provinces = Array.from(new Set(TMD_WORKSHOPS.map(w => w.province)));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid duplicate initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Dominican Republic approximate center & bounds
    const drCenter: L.LatLngExpression = [18.7357, -70.1627];
    const initialZoom = 8;

    const map = L.map(mapContainerRef.current, {
      center: drCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      minZoom: 7,
      maxZoom: 18
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Sleek tile layers according to theme
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme]);

  // Update Markers whenever filteredWorkshops or activeWorkshopId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    filteredWorkshops.forEach(ws => {
      const isSelected = ws.id === activeWorkshopId;
      const isMain = ws.isMainHub;

      // Create Custom HTML Icon with industrial TMD Amber branding
      const customIcon = L.divIcon({
        className: 'custom-tmd-pin',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}">
            ${isMain ? '<div class="absolute -inset-1.5 bg-amber-500 rounded-full animate-ping opacity-60"></div>' : ''}
            <div class="relative flex items-center justify-center w-9 h-9 rounded-2xl ${
              isSelected 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/50 ring-4 ring-amber-400/30' 
                : isMain 
                  ? 'bg-zinc-900 border-2 border-amber-500 text-amber-400 shadow-md' 
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-100 shadow-md'
            }">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
              isSelected ? 'bg-amber-500' : isMain ? 'bg-amber-500' : 'bg-zinc-900'
            }"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38]
      });

      const marker = L.marker(ws.coordinates, { icon: customIcon }).addTo(map);

      // Popup content
      const popupContent = `
        <div class="p-3 text-zinc-900 font-sans max-w-[260px]">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="inline-block w-2 h-2 rounded-full ${ws.isMainHub ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
            <span class="text-[10px] font-black uppercase tracking-wider text-amber-600">${ws.region}</span>
          </div>
          <h4 class="font-extrabold text-xs leading-tight text-zinc-950 mb-1">${ws.name}</h4>
          <p class="text-[11px] text-zinc-600 mb-2 leading-snug">${ws.address}</p>
          <div class="text-[10px] space-y-1 mb-2.5 pt-1.5 border-t border-zinc-200">
            <div class="flex items-center gap-1 font-semibold text-zinc-700">
              <span>📞 ${ws.phone}</span>
            </div>
            <div class="flex items-center gap-1 text-emerald-700 font-bold">
              <span>🚐 ${ws.mobileUnitsCount} Unidades Móviles 24/7</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <a 
              href="https://wa.me/${ws.whatsapp}?text=Hola%20TMD%20Dominicana,%20necesito%20soporte%20t%C3%A9cnico%20en%20el%20taller%20de%20${encodeURIComponent(ws.name)}"
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex-1 text-center py-1.5 px-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
            >
              WhatsApp
            </a>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${ws.coordinates[0]},${ws.coordinates[1]}"
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex-1 text-center py-1.5 px-2 bg-zinc-900 text-white rounded-lg text-[10px] font-bold"
            >
              Cómo Llegar
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'tmd-leaflet-popup'
      });

      marker.on('click', () => {
        setActiveWorkshopId(ws.id);
        if (onSelectWorkshop) onSelectWorkshop(ws);
      });

      markersRef.current[ws.id] = marker;
    });

    // If activeWorkshopId exists, center and open popup
    if (activeWorkshopId && markersRef.current[activeWorkshopId]) {
      const activeWs = TMD_WORKSHOPS.find(w => w.id === activeWorkshopId);
      if (activeWs) {
        map.flyTo(activeWs.coordinates, 12, { duration: 1.2 });
        markersRef.current[activeWorkshopId].openPopup();
      }
    }
  }, [filteredWorkshops, activeWorkshopId]);

  const handleSelectWorkshopItem = (ws: TmdWorkshop) => {
    setActiveWorkshopId(ws.id);
    setMobileTab('map');
    if (onSelectWorkshop) onSelectWorkshop(ws);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(ws.coordinates, 13, { duration: 1.2 });
      if (markersRef.current[ws.id]) {
        markersRef.current[ws.id].openPopup();
      }
    }
  };

  const handleResetMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([18.7357, -70.1627], 8, { duration: 1.2 });
    }
  };

  return (
    <section className="space-y-4 font-mono">
      {/* Header & Coverage Summary */}
      <div className="bg-zinc-950 text-white rounded-[5px] p-5 sm:p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Red Nacional de Soporte Técnico TMD</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
              Talleres Autorizados & Flotas Móviles en RD
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Estaciones de servicio equipadas con bancos hidráulicos, diagnóstico computarizado y unidades móviles de rescate técnico 24/7 en obra y mina.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 font-mono">
                {TMD_WORKSHOPS.length}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Talleres RD</span>
            </div>
            <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                30+
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Móviles 24/7</span>
            </div>
            <div className="p-3 rounded-[2px] bg-zinc-900 border border-zinc-800 text-center">
              <span className="block text-xl sm:text-2xl font-bold text-amber-400 font-mono">
                100%
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Nacional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-zinc-900 p-3.5 sm:p-4 rounded-[5px] border border-zinc-800 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por provincia, ciudad o especialidad..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Region Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {['all', 'Santo Domingo', 'Cibao / Norte', 'Este', 'Sur'].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1.5 rounded-[2px] text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-amber-400 text-black font-black'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {reg === 'all' ? 'Todas las Regiones' : reg}
              </button>
            ))}
          </div>

          {/* Province Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-[2px] bg-zinc-950 border border-zinc-800 text-zinc-200 font-bold uppercase focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">Provincias ({provinces.length})</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            {/* Mobile Units Filter Toggle */}
            <button
              onClick={() => setOnlyMobileUnits(!onlyMobileUnits)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-[2px] text-xs font-bold uppercase transition-all cursor-pointer border ${
                onlyMobileUnits
                  ? 'bg-emerald-600 text-white border-emerald-500 font-black'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Móviles 24/7</span>
              <span className="sm:hidden">Móviles</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Tabs (Map vs List) */}
        <div className="lg:hidden flex items-center bg-zinc-950 p-1 rounded-[2px] border border-zinc-800 gap-1">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-[2px] transition-all ${
              mobileTab === 'map'
                ? 'bg-amber-400 text-black font-black'
                : 'text-zinc-400'
            }`}
          >
            Mapa Interactivo
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-[2px] transition-all ${
              mobileTab === 'list'
                ? 'bg-amber-400 text-black font-black'
                : 'text-zinc-400'
            }`}
          >
            Lista ({filteredWorkshops.length})
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Sidebar + Right Interactive Leaflet Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Workshop List & Active Workshop Details */}
        <div className={`lg:col-span-5 space-y-3 ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between px-1 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                {filteredWorkshops.length} Talleres
              </span>
              <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                astStatus.isOpen 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-[1px] ${astStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{astStatus.text}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFindNearestWorkshop}
                disabled={isLocating}
                className="text-xs font-bold uppercase text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer bg-zinc-900 px-2 py-1 rounded-[2px] border border-zinc-800 disabled:opacity-50"
                title="Detectar taller más cercano según tu ubicación GPS"
              >
                <LocateFixed className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Buscando...' : 'Cercano'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetMap}
                className="text-xs font-bold uppercase text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Reset</span>
              </button>
            </div>
          </div>

          {locationMessage && (
            <div className="p-2 rounded-[2px] bg-amber-400/10 border border-amber-400/30 text-xs font-bold text-amber-400 flex items-center gap-2">
              <LocateFixed className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{locationMessage}</span>
            </div>
          )}

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredWorkshops.length === 0 ? (
              <div className="p-6 text-center rounded-[2px] bg-zinc-900 border border-zinc-800 space-y-2">
                <Building2 className="w-6 h-6 text-zinc-500 mx-auto" />
                <p className="font-bold text-xs uppercase text-white">No se encontraron talleres con esos filtros</p>
                <p className="text-xs text-zinc-400">Pruebe seleccionando otra provincia o limpiando la búsqueda.</p>
                <button
                  onClick={() => {
                    setSelectedRegion('all');
                    setSelectedProvince('all');
                    setSearchQuery('');
                    setOnlyMobileUnits(false);
                  }}
                  className="mt-2 py-1.5 px-3 bg-amber-400 text-black font-bold uppercase text-xs rounded-[2px] cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              filteredWorkshops.map((ws) => {
                const isSelected = ws.id === activeWorkshopId;
                return (
                  <div
                    key={ws.id}
                    onClick={() => handleSelectWorkshopItem(ws)}
                    className={`p-3.5 rounded-[2px] border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Main Hub Badge */}
                    {ws.isMainHub && (
                      <span className="absolute top-2.5 right-2.5 py-0.5 px-1.5 bg-amber-400 text-black text-[10px] font-bold uppercase rounded-[2px] tracking-wider">
                        Sede Máster
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-[2px] shrink-0 border ${
                        isSelected ? 'bg-amber-400 text-black border-amber-400 font-bold' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}>
                        <Wrench className="w-4 h-4" />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-amber-400">
                            {ws.province}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-white uppercase leading-tight">
                          {ws.name}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {ws.address}
                        </p>
                      </div>
                    </div>

                    {/* Meta Bar */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="flex items-center gap-1.5 text-[11px] font-mono">
                          <Phone className="w-3 h-3 text-amber-400" />
                          {ws.phone}
                        </span>
                      </div>

                      {ws.hasMobileUnits && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] uppercase bg-emerald-500/10 px-2 py-0.5 rounded-[2px] border border-emerald-500/20">
                          <Truck className="w-3 h-3" />
                          <span>{ws.mobileUnitsCount} Móviles 24/7</span>
                        </span>
                      )}
                    </div>

                    {/* If selected, show expanded action buttons */}
                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-zinc-800 space-y-2">
                        {userLocation && (
                          <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
                            <LocateFixed className="w-3 h-3 shrink-0" />
                            <span>Distancia: <strong className="text-white">{calculateDistanceKm(userLocation.lat, userLocation.lng, ws.coordinates[0], ws.coordinates[1])} km</strong> desde tu GPS</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                          <a
                            href={`https://wa.me/${ws.whatsapp}?text=Hola%20TMD%20Dominicana,%20necesito%20asistencia%20t%C3%A9cnica%20en%20el%20taller%20de%20${encodeURIComponent(ws.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 min-w-[110px] py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase rounded-[2px] text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${ws.coordinates[0]},${ws.coordinates[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 px-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold uppercase rounded-[2px] text-xs flex items-center justify-center gap-1 border border-zinc-800 cursor-pointer"
                            title="Navegar con Google Maps"
                          >
                            <Navigation className="w-3.5 h-3.5 text-amber-400" />
                            <span>Maps</span>
                          </a>

                          <a
                            href={`https://waze.com/ul?ll=${ws.coordinates[0]},${ws.coordinates[1]}&navigate=yes`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-1.5 px-2.5 bg-zinc-950 hover:bg-zinc-800 text-cyan-400 font-bold uppercase rounded-[2px] text-xs flex items-center justify-center gap-1 border border-zinc-800 cursor-pointer"
                            title="Navegar con Waze"
                          >
                            <Compass className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Waze</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Leaflet Interactive Map Canvas */}
        <div className={`lg:col-span-7 space-y-3 ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          <div className="relative rounded-[5px] overflow-hidden border border-zinc-800 shadow-xl bg-zinc-950">
            {/* Map Container */}
            <div 
              ref={mapContainerRef} 
              id="tmd-dominican-workshops-map"
              className="w-full h-[500px] sm:h-[560px] z-0"
            />

            {/* Floating Map Legend & Reset Controls */}
            <div className="absolute top-3 left-3 z-10 bg-zinc-950/95 backdrop-blur-md p-3 rounded-[2px] border border-zinc-800 shadow-xl max-w-[240px] hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 block mb-2">
                Leyenda de Cobertura
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-amber-400"></span>
                  <span className="font-bold text-white uppercase text-[10px]">Sede Máster</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-zinc-900 border border-zinc-700"></span>
                  <span className="font-bold text-zinc-300 uppercase text-[10px]">Centro Regional</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-[1px] bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-emerald-400 uppercase text-[10px]">Móvil 24/7</span>
                </div>
              </div>
            </div>

            {/* Quick Floating Action Button for Emergency Field Assistance */}
            <div className="absolute bottom-3 left-3 z-10">
              <a
                href="tel:8095609999"
                className="flex items-center gap-2 py-2 px-3.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase text-xs rounded-[2px] shadow-2xl transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Emergencia Campo 24/7</span>
              </a>
            </div>
          </div>

          {/* Detailed Card for Active Selected Workshop */}
          {activeWorkshop && (
            <div className="bg-zinc-900 p-4 sm:p-5 rounded-[5px] border border-zinc-800 shadow-md space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="py-0.5 px-2 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-bold uppercase rounded-[2px]">
                      {activeWorkshop.province}
                    </span>
                    {activeWorkshop.isMainHub && (
                      <span className="py-0.5 px-2 bg-amber-400 text-black text-[10px] font-bold uppercase rounded-[2px]">
                        Sede Máster Nacional
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase">
                    {activeWorkshop.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Responsable: <span className="font-bold text-zinc-200">{activeWorkshop.manager}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <a
                    href={`https://wa.me/${activeWorkshop.whatsapp}?text=Hola%20TMD,%20solicito%20asistencia%20en%20${encodeURIComponent(activeWorkshop.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase rounded-[2px] text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeWorkshop.coordinates[0]},${activeWorkshop.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-white font-bold uppercase rounded-[2px] text-xs flex items-center gap-1.5 border border-zinc-800 cursor-pointer shadow-md"
                    title="Navegar en Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Maps</span>
                  </a>

                  <a
                    href={`https://waze.com/ul?ll=${activeWorkshop.coordinates[0]},${activeWorkshop.coordinates[1]}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-zinc-950 hover:bg-zinc-800 text-cyan-400 font-bold uppercase rounded-[2px] text-xs flex items-center gap-1.5 border border-zinc-800 cursor-pointer shadow-md"
                    title="Navegar en Waze"
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Waze</span>
                  </a>
                </div>
              </div>

              {/* Authentic Physical Photos for Sede Central Km 22 */}
              {activeWorkshop.isMainHub && (
                <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
                  <div className="relative aspect-[16/9] rounded-[3px] overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img 
                      src={tmdEntranceImg} 
                      alt="Entrada Sede Central Km 22" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded-[1px] bg-black/85 text-[10px] font-bold text-amber-400 uppercase">
                      Fachada &amp; Acceso
                    </span>
                  </div>
                  <div className="relative aspect-[16/9] rounded-[3px] overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img 
                      src={tmdPatioImg} 
                      alt="Patio de Pruebas Km 22" 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded-[1px] bg-black/85 text-[10px] font-bold text-emerald-400 uppercase">
                      Patio 15,000+ m²
                    </span>
                  </div>
                </div>
              )}

              {/* Grid with Schedule, Certifications and Technical Capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5 bg-zinc-950 p-3 rounded-[2px] border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-white font-bold uppercase text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Horario de Atención</span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {activeWorkshop.schedule}
                  </p>

                  <div className="pt-1.5 border-t border-zinc-800">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{activeWorkshop.mobileUnitsCount} Móviles Asignadas a la Región</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 bg-zinc-950 p-3 rounded-[2px] border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-white font-bold uppercase text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Certificaciones & Homologaciones</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeWorkshop.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="py-0.5 px-2 rounded-[2px] bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono uppercase"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specialties List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Especialidades Técnicas de este Taller:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {activeWorkshop.specialties.map((spec, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
