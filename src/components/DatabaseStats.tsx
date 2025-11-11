import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Database, Users, MapPin, Gift, Recycle, TrendingUp } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7af4432d`;

interface Stats {
  totalUsers: number;
  totalStations: number;
  totalRewards: number;
  totalCollections: number;
  totalKgRecycled: number;
  totalKeysDistributed: number;
}

export function DatabaseStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all data to calculate stats
      const [stationsRes, rewardsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stations`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${API_BASE_URL}/rewards`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
      ]);

      const stations = await stationsRes.json();
      const rewards = await rewardsRes.json();

      // Calculate stats
      const calculatedStats: Stats = {
        totalUsers: 0, // Would need auth to get this
        totalStations: stations.stations?.length || 0,
        totalRewards: rewards.rewards?.length || 0,
        totalCollections: 0,
        totalKgRecycled: stations.stations?.reduce((sum: number, s: any) => sum + (s.total_kg_coletados || 0), 0) || 0,
        totalKeysDistributed: 0,
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
        <CardContent className="pt-6">
          <div className="text-center text-purple-300">Carregando estatísticas...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-300" />
            <CardTitle className="text-purple-100">Estatísticas do Banco de Dados</CardTitle>
          </div>
          <CardDescription className="text-purple-200/70">
            Dados em tempo real do sistema
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Estações */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Estações</p>
                <p className="text-2xl text-white mt-1">{stats.totalStations}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        {/* Vantagens */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Vantagens</p>
                <p className="text-2xl text-white mt-1">{stats.totalRewards}</p>
              </div>
              <Gift className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        {/* KG Reciclados */}
        <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Total Reciclado</p>
                <p className="text-2xl text-white mt-1">{stats.totalKgRecycled.toFixed(1)} kg</p>
                <p className="text-xs text-purple-400 mt-1">
                  Equivalente a {Math.floor(stats.totalKgRecycled / 0.5)} garrafas PET
                </p>
              </div>
              <Recycle className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entidades do MER */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-purple-100 text-sm">Modelo Entidade-Relacionamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-purple-200">
            <span className="text-purple-400">• Entidades:</span> 9 (USUARIOS, EMBAIXADORES, INSTITUICOES, ESTACOES, COLETAS, COMERCIOS, VANTAGENS + 2 associativas)
          </div>
          <div className="text-sm text-purple-200">
            <span className="text-purple-400">• Relacionamentos:</span> 8 (1:1, 1:N, N:N)
          </div>
          <div className="text-sm text-purple-200">
            <span className="text-purple-400">• Normalização:</span> 3ª Forma Normal (3FN)
          </div>
          <div className="text-sm text-purple-200">
            <span className="text-purple-400">• Tipos de dados:</span> UUID, VARCHAR, INTEGER, DECIMAL, BOOLEAN, TIMESTAMP, TEXT[]
          </div>
        </CardContent>
      </Card>

      {/* Regras de Negócio */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-purple-100 text-sm">Multiplicadores de Chaves</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-purple-200">Eletrônico</span>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">20x</Badge>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-purple-200">Metal</span>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">15x</Badge>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-purple-200">Vidro</span>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">12x</Badge>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-purple-200">Plástico</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">10x</Badge>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded col-span-2">
              <span className="text-purple-200">Papel</span>
              <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30">8x</Badge>
            </div>
          </div>
          <p className="text-xs text-purple-300/70 pt-2 border-t border-purple-500/20">
            Exemplo: 2.5 kg de plástico = 2.5 × 10 = 25 chaves
          </p>
        </CardContent>
      </Card>

      {/* Sistema de Níveis */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-purple-100 text-sm">Sistema de Níveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-gray-300">Iniciante</span>
              <span className="text-purple-300">0-99 chaves</span>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-orange-300">Bronze</span>
              <span className="text-purple-300">100-299 chaves</span>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-gray-200">Prata</span>
              <span className="text-purple-300">300-599 chaves</span>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-yellow-300">Ouro</span>
              <span className="text-purple-300">600-999 chaves</span>
            </div>
            <div className="flex items-center justify-between bg-purple-950/30 p-2 rounded">
              <span className="text-cyan-300">Diamante</span>
              <span className="text-purple-300">1000+ chaves</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arquitetura */}
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-purple-100 text-sm">Arquitetura em 3 Camadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-purple-950/30 p-3 rounded">
            <p className="text-purple-100 font-medium">Frontend</p>
            <p className="text-sm text-purple-300">React + TypeScript + Tailwind CSS</p>
          </div>
          <div className="flex justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400 rotate-90" />
          </div>
          <div className="bg-purple-950/30 p-3 rounded">
            <p className="text-purple-100 font-medium">Backend (API)</p>
            <p className="text-sm text-purple-300">Deno + Hono Framework + Validações</p>
          </div>
          <div className="flex justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400 rotate-90" />
          </div>
          <div className="bg-purple-950/30 p-3 rounded">
            <p className="text-purple-100 font-medium">Banco de Dados</p>
            <p className="text-sm text-purple-300">Supabase PostgreSQL + Auth</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
