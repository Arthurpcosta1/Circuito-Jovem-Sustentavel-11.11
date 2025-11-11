import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Clock, User, List, Map as MapIcon, Navigation, X } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  address: string;
  hours: string;
  ambassador: string;
  distance: string;
  status: 'open' | 'closed' | 'busy';
  coordinates: { lat: number; lng: number };
}

export function StationsMap() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const stations: Station[] = [
    {
      id: '1',
      name: 'UNINASSAU das Graças',
      address: 'R. Joaquim Nabuco, 1469 - Graças, Recife',
      hours: '07:00 - 22:00',
      ambassador: 'Ana Carolina Tech',
      distance: '0.3 km',
      status: 'open',
      coordinates: { lat: -8.0385, lng: -34.9039 }
    },
    {
      id: '2',
      name: 'UFPE - Campus Recife',
      address: 'Av. Prof. Moraes Rego, 1235 - Cidade Universitária',
      hours: '08:00 - 18:00',
      ambassador: 'Rafael Santos',
      distance: '2.1 km',
      status: 'open',
      coordinates: { lat: -8.0522, lng: -34.9519 }
    },
    {
      id: '3',
      name: 'UNICAP - Universidade Católica',
      address: 'R. do Príncipe, 526 - Boa Vista, Recife',
      hours: '07:30 - 21:00',
      ambassador: 'João Gabriel',
      distance: '1.8 km',
      status: 'busy',
      coordinates: { lat: -8.0476, lng: -34.8770 }
    },
    {
      id: '4',
      name: 'UFRPE - Campus Dois Irmãos',
      address: 'R. Dom Manoel de Medeiros, s/n - Dois Irmãos',
      hours: '08:00 - 17:00',
      ambassador: 'Mariana Silva',
      distance: '4.2 km',
      status: 'open',
      coordinates: { lat: -8.0107, lng: -34.9487 }
    },
    {
      id: '5',
      name: 'FBV - Faculdade Boa Viagem',
      address: 'R. Jean Émile Favre, 422 - Imbiribeira',
      hours: '09:00 - 17:00',
      ambassador: 'Pedro Costa',
      distance: '3.5 km',
      status: 'closed',
      coordinates: { lat: -8.1180, lng: -34.9058 }
    }
  ];

  useEffect(() => {
    if (viewMode === 'map' && !mapLoaded) {
      loadLeafletMap();
    }
  }, [viewMode, mapLoaded]);

  const loadLeafletMap = () => {
    // Carregar CSS do Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Carregar JavaScript do Leaflet
    if (!(window as any).L && !document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);
    } else if ((window as any).L) {
      initializeMap();
    }
  };

  const initializeMap = () => {
    const L = (window as any).L;
    if (!L) return;

    // Centro de Recife
    const center: [number, number] = [-8.0476, -34.9036];
    
    const mapElement = document.getElementById('leaflet-map');
    if (!mapElement) return;

    // Limpar mapa existente se houver
    if (mapInstance) {
      mapInstance.remove();
    }

    // Criar mapa
    const map = L.map('leaflet-map').setView(center, 12);

    // Adicionar tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Adicionar marcadores para cada estação
    stations.forEach((station) => {
      const markerColor = 
        station.status === 'open' ? '#06b6d4' : 
        station.status === 'busy' ? '#a855f7' : '#ef4444';

      // Criar ícone customizado
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: ${markerColor}; 
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon })
        .addTo(map);

      // Adicionar popup
      const statusText = 
        station.status === 'open' ? 'Aberta' : 
        station.status === 'busy' ? 'Ocupada' : 'Fechada';
      
      const statusColor = 
        station.status === 'open' ? '#06b6d4' : 
        station.status === 'busy' ? '#a855f7' : '#ef4444';

      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">${station.name}</h3>
          <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">
            <div style="margin-bottom: 4px;">📍 ${station.address}</div>
            <div style="margin-bottom: 4px;">🕐 ${station.hours}</div>
            <div style="margin-bottom: 4px;">👤 ${station.ambassador}</div>
            <div style="margin-bottom: 8px;">📏 ${station.distance}</div>
          </div>
          <div style="
            display: inline-block;
            padding: 4px 8px;
            background: ${statusColor};
            color: white;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          ">
            ${statusText}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedStation(station);
      });
    });

    setMapInstance(map);
    setMapLoaded(true);
  };

  const getStatusColor = (status: Station['status']) => {
    switch (status) {
      case 'open': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'busy': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (status: Station['status']) => {
    switch (status) {
      case 'open': return 'Aberta';
      case 'busy': return 'Ocupada';
      case 'closed': return 'Fechada';
    }
  };

  const openInGoogleMaps = (station: Station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 backdrop-blur-lg border-b border-purple-300/20">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg text-gray-900">Estações de Coleta</h1>
              <p className="text-sm text-gray-800">Recife, PE</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'border-gray-900/30 text-gray-900 hover:bg-gray-900/20'}
              >
                <MapIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'border-gray-900/30 text-gray-900 hover:bg-gray-900/20'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {viewMode === 'map' ? (
          /* Map View */
          <div className="relative">
            <div 
              id="leaflet-map" 
              className="h-96 w-full"
              style={{ background: '#1e293b' }}
            >
              {!mapLoaded && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
                    <p className="text-white">Carregando mapa...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Legenda do Mapa */}
            <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-lg rounded-lg p-3 border border-purple-300/20">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-white">Aberta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-white">Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-white">Fechada</span>
                </div>
              </div>
            </div>

            {/* Station Detail Card */}
            {selectedStation && (
              <div className="absolute bottom-4 right-4 w-64">
                <Card className="bg-gray-900/95 backdrop-blur-lg border-purple-300/30">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-white text-sm pr-2">{selectedStation.name}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        onClick={() => setSelectedStation(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-xs mb-3">
                      <div className="flex items-start gap-2 text-cyan-300">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{selectedStation.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-cyan-300">
                        <Clock className="w-3 h-3" />
                        <span>{selectedStation.hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-cyan-300">
                        <User className="w-3 h-3" />
                        <span>{selectedStation.ambassador}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                      onClick={() => openInGoogleMaps(selectedStation)}
                    >
                      <Navigation className="w-3 h-3 mr-2" />
                      Ir para Estação
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : null}

        {/* Stations List */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-cyan-300">
              {stations.length} estações encontradas
            </p>
            <Button variant="outline" size="sm" className="border-purple-300/30 text-cyan-300 hover:bg-purple-600/20">
              <Navigation className="w-4 h-4 mr-2" />
              Mais próximas
            </Button>
          </div>

          <div className="space-y-3">
            {stations.map((station) => (
              <Card key={station.id} className="bg-white/10 backdrop-blur-lg border-purple-300/20 hover:bg-white/15 transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white mb-1">{station.name}</h3>
                      <p className="text-sm text-cyan-300 mb-2">{station.address}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(station.status)}>
                      {getStatusText(station.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Clock className="w-4 h-4" />
                      <span>{station.hours}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-cyan-300">
                      <User className="w-4 h-4" />
                      <span>Embaixador: {station.ambassador}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Navigation className="w-4 h-4" />
                      <span>{station.distance}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                      disabled={station.status === 'closed'}
                      onClick={() => openInGoogleMaps(station)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Ir para Estação
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-purple-300/30 text-cyan-300 hover:bg-purple-600/20"
                      disabled={station.status === 'closed'}
                      onClick={() => {
                        setSelectedStation(station);
                        setViewMode('map');
                      }}
                    >
                      Ver no Mapa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 mt-6">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-900">Encontre a estação mais próxima! 📍</p>
            <p className="text-xs text-gray-800 mt-1">Recife tem {stations.length} estações de coleta ativas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
