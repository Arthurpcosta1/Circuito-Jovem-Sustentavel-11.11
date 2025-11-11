import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Clock, User, Navigation, Trophy, Medal, Crown, TrendingUp, Map } from 'lucide-react';
import { StationsMap } from './StationsMap';

interface Station {
  id: string;
  name: string;
  address: string;
  hours: string;
  distance: string;
  status: 'open' | 'closed' | 'busy';
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  keys: number;
  avatar: string;
  trend: 'up' | 'down' | 'same';
}

export function RecycleHub() {
  const [activeView, setActiveView] = useState<'stations' | 'ranking'>('stations');
  const [showMap, setShowMap] = useState(false);

  if (showMap) {
    return (
      <>
        <StationsMap />
        <div className="fixed top-4 left-4 z-50">
          <Button
            size="sm"
            onClick={() => setShowMap(false)}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            ← Voltar
          </Button>
        </div>
      </>
    );
  }

  const stations: Station[] = [
    {
      id: '1',
      name: 'UNINASSAU das Graças',
      address: 'R. Joaquim Nabuco, 1469 - Graças',
      hours: '07:00 - 22:00',
      distance: '0.3 km',
      status: 'open',
    },
    {
      id: '2',
      name: 'UFPE - Campus Recife',
      address: 'Av. Prof. Moraes Rego, 1235',
      hours: '08:00 - 18:00',
      distance: '2.1 km',
      status: 'open',
    },
    {
      id: '3',
      name: 'UNICAP - Boa Vista',
      address: 'R. do Príncipe, 526 - Boa Vista',
      hours: '07:30 - 21:00',
      distance: '1.8 km',
      status: 'busy',
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Maria Santos', keys: 156, avatar: '👑', trend: 'same' },
    { rank: 2, name: 'João Silva', keys: 142, avatar: '🥈', trend: 'up' },
    { rank: 3, name: 'Ana Costa', keys: 128, avatar: '🥉', trend: 'down' },
    { rank: 4, name: 'Arthur Silva', keys: 47, avatar: '🎯', trend: 'up' },
    { rank: 5, name: 'Pedro Lima', keys: 38, avatar: '⭐', trend: 'same' }
  ];

  const getStatusColor = (status: Station['status']) => {
    switch (status) {
      case 'open': return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      case 'busy': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'closed': return 'bg-red-500/20 text-red-300 border-red-400/30';
    }
  };

  const getStatusText = (status: Station['status']) => {
    switch (status) {
      case 'open': return 'Aberta';
      case 'busy': return 'Ocupada';
      case 'closed': return 'Fechada';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-md mx-auto px-6 py-6">
          <div>
            <h1 className="text-xl text-gray-900">Reciclar</h1>
            <p className="text-sm text-gray-800">Encontre estações e veja seu ranking</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Tabs */}
        <div className="bg-gray-800/50 border-b border-purple-300/20 px-6 py-4">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/80">
              <TabsTrigger 
                value="stations" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Estações
              </TabsTrigger>
              <TabsTrigger 
                value="ranking" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ranking
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        {activeView === 'stations' ? (
          <div className="p-6 space-y-4">
            {/* Map Preview */}
            <Card className="bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border-purple-400/30 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-40 bg-gradient-to-br from-cyan-600/30 to-purple-600/30 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="w-10 h-10 text-cyan-400 mx-auto" />
                    <p className="text-sm text-purple-200">Mapa de Estações em Recife</p>
                  </div>
                </div>
                <div className="p-4">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                    onClick={() => setShowMap(true)}
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Ver Mapa Interativo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-cyan-300">{stations.length} estações próximas</p>
              <Button variant="outline" size="sm" className="border-purple-300/30 text-cyan-300 hover:bg-purple-600/20">
                <Navigation className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>

            {/* Stations List */}
            <div className="space-y-3">
              {stations.map((station) => (
                <Card key={station.id} className="bg-white/10 backdrop-blur border-purple-300/20 hover:bg-white/15 transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-white mb-1">{station.name}</h3>
                        <p className="text-sm text-cyan-300 mb-1">{station.address}</p>
                        <div className="flex items-center gap-3 text-sm text-purple-200">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {station.hours}
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {station.distance}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(station.status)}>
                        {getStatusText(station.status)}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                      disabled={station.status === 'closed'}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Ir para Estação
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* User Position Highlight */}
            <Card className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-cyan-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cyan-500/30 rounded-full flex items-center justify-center text-xl">
                      🎯
                    </div>
                    <div>
                      <p className="text-sm text-purple-200">Sua Posição</p>
                      <p className="text-xl text-white">#4 em Recife</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-200">Suas Chaves</p>
                    <p className="text-xl text-cyan-300">47</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking List */}
            <div className="space-y-2">
              <h3 className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cyan-400" />
                Top Recicladores
              </h3>
              
              {leaderboard.map((entry) => (
                <Card 
                  key={entry.rank} 
                  className={`border transition-all ${
                    entry.rank === 4 
                      ? 'bg-cyan-600/10 border-cyan-400/40' 
                      : 'bg-white/5 border-purple-300/20'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        {entry.rank <= 3 ? (
                          <div className="w-8 h-8 flex items-center justify-center text-xl">
                            {entry.rank === 1 && '👑'}
                            {entry.rank === 2 && '🥈'}
                            {entry.rank === 3 && '🥉'}
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-300">
                            #{entry.rank}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white text-sm">{entry.name}</p>
                          <p className="text-xs text-purple-300">{entry.keys} chaves</p>
                        </div>
                      </div>
                      {entry.trend === 'up' && (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 mt-6">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-900">
              {activeView === 'stations' ? '🌟 Recicle e ganhe chaves!' : '🏆 Continue reciclando e suba no ranking!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
