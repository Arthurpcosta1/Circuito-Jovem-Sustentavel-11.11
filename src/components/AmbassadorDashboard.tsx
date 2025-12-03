import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  QrCode, 
  Users, 
  Key, 
  TrendingUp, 
  Package, 
  MessageSquare,
  Trophy,
  Award,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AmbassadorDashboard() {
  const [stationName] = useState('Bloco A (UNINASSAU)');
  
  // Dados de estatísticas
  const stats = {
    weeklyTotal: '127.5',
    activeUsers: '23',
    keysGenerated: '438'
  };

  // Dados do gráfico de materiais
  const materialData = [
    { material: 'Plástico', kg: 45 },
    { material: 'Papel', kg: 52 },
    { material: 'Metal', kg: 18 },
    { material: 'Vidro', kg: 12.5 }
  ];

  // Top 5 recicladores da estação
  const topRecyclers = [
    { rank: 1, name: 'Maria Santos', keys: 87, avatar: '👑' },
    { rank: 2, name: 'João Silva', keys: 65, avatar: '🥈' },
    { rank: 3, name: 'Ana Costa', keys: 58, avatar: '🥉' },
    { rank: 4, name: 'Pedro Lima', keys: 42, avatar: '⭐' },
    { rank: 5, name: 'Julia Souza', keys: 38, avatar: '💎' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-gray-900" />
            <h1 className="text-lg text-gray-900">Minha Estação</h1>
          </div>
          <p className="text-xl text-gray-900">{stationName}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/10 backdrop-blur border-purple-300/20">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-lg text-white mb-1">{stats.weeklyTotal} kg</p>
              <p className="text-xs text-purple-300">Semana</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-purple-300/20">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-lg text-white mb-1">{stats.activeUsers}</p>
              <p className="text-xs text-purple-300">Usuários Hoje</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-purple-300/20">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Key className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-lg text-white mb-1">{stats.keysGenerated}</p>
              <p className="text-xs text-purple-300">Chaves Geradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Coleta por Material */}
        <Card className="bg-white/10 backdrop-blur border-purple-300/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Coleta por Material (Kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={materialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis 
                  dataKey="material" 
                  tick={{ fill: '#d1d5db', fontSize: 11 }}
                />
                <YAxis 
                  tick={{ fill: '#d1d5db', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #06b6d4',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="kg" 
                  fill="#06b6d4"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 5 Recicladores */}
        <Card className="bg-white/10 backdrop-blur border-purple-300/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <Trophy className="w-5 h-5 text-purple-400" />
              Top 5 Recicladores da Estação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {topRecyclers.map((recycler) => (
                <div 
                  key={recycler.rank}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-purple-300/20"
                >
                  <div className="text-xl">{recycler.avatar}</div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{recycler.name}</p>
                    <p className="text-xs text-purple-300">{recycler.keys} chaves</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xs"
                  >
                    #{recycler.rank}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-lg py-6"
            size="lg"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Validar Coleta Agora
          </Button>

          <Button 
            variant="outline"
            className="w-full border-purple-300/30 text-purple-200 hover:bg-purple-600/20"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Postar no Feed da Estação
          </Button>
        </div>

        {/* Info Adicional */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-300/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white mb-1 text-sm">Próximo Mutirão de Coleta</p>
                <p className="text-xs text-purple-300">Sábado, 26/10 às 9h - Participe!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 mt-6">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-900">Painel Embaixador Ativo! 🏆</p>
            <p className="text-xs text-gray-800 mt-1">Continue gerenciando sua estação</p>
          </div>
        </div>
      </div>
    </div>
  );
}
