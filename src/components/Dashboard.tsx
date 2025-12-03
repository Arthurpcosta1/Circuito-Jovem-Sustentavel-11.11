import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MapPin, Award, Gift, Key, User, Settings, MessageSquare, Sparkles, TrendingUp, Target } from 'lucide-react';
import { auth, listarResgatesUsuario, listarColetasUsuario, buscarRanking } from '../utils/api';
import { ConnectionTest } from './ConnectionTest';
import { calcularNivel, chavesParaProximoNivel, calcularProgresso } from '../utils/levelSystem';

interface DashboardProps {
  userName?: string;
  currentLevel?: string;
  impactKeys?: number;
  nextLevelKeys?: number;
  userAvatar?: string;
  onNavigateToStations?: () => void;
}

export function Dashboard({ 
  userName, 
  currentLevel,
  impactKeys,
  nextLevelKeys,
  userAvatar,
  onNavigateToStations
}: DashboardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [totalColetas, setTotalColetas] = useState<number>(0);
  const [totalResgates, setTotalResgates] = useState<number>(0);
  const [rankingPosition, setRankingPosition] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = auth.getCurrentUser();
      setCurrentUser(user);

      if (!user?.id) return;

      // Buscar coletas do usuário
      const { coletas } = await listarColetasUsuario(user.id);
      setTotalColetas(coletas?.length || 0);

      // Buscar resgates do usuário
      const { resgates } = await listarResgatesUsuario(user.id);
      setTotalResgates(resgates?.length || 0);

      // Buscar ranking
      const { ranking } = await buscarRanking(100);
      const userPosition = ranking?.findIndex((r: any) => r.id === user.id);
      setRankingPosition(userPosition >= 0 ? userPosition + 1 : 0);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = userName || currentUser?.nome || "Arthur";
  
  // Calcular nível baseado nas chaves de impacto
  const chavesAtuais = impactKeys ?? currentUser?.chaves_impacto ?? 0;
  const nivelInfo = calcularNivel(chavesAtuais);
  const displayLevel = currentLevel || `Nível ${nivelInfo.nivel} - ${nivelInfo.nome}`;
  const displayKeys = chavesAtuais;
  const chavesProxNivel = chavesParaProximoNivel(chavesAtuais);
  const displayNextLevelKeys = chavesProxNivel ? chavesAtuais + chavesProxNivel : chavesAtuais;
  const displayAvatar = userAvatar || currentUser?.foto_url || null;
  const progressPercentage = calcularProgresso(chavesAtuais);
  const keysToNext = chavesProxNivel || 0;

  // Buscar recompensas reais do usuário
  const [recentRewards, setRecentRewards] = useState<any[]>([]);

  useEffect(() => {
    loadRecentRewards();
  }, [currentUser]);

  const loadRecentRewards = async () => {
    if (!currentUser?.id) return;
    
    try {
      // Buscar últimas 3 recompensas resgatadas pelo usuário
      const { resgates } = await listarResgatesUsuario(currentUser.id);
      
      if (resgates && resgates.length > 0) {
        // Pegar os 3 mais recentes
        const ultimos = resgates.slice(0, 3).map((resgate: any) => ({
          title: resgate.beneficio_titulo || 'Benefício Resgatado',
          partner: resgate.parceiro_nome || 'Parceiro Local',
          level: `Nível ${currentUser.nivel || 1}`
        }));
        setRecentRewards(ultimos);
      } else {
        // Se não tem resgates, mostrar vazio
        setRecentRewards([]);
      }
    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
      setRecentRewards([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-gray-900">
      {/* Header - Modernizado com glassmorphism */}
      <div className="relative overflow-hidden">
        {/* Background com gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                Olá, {displayName}! 🚀
              </h1>
              <p className="text-white/80 text-sm">Bem-vindo ao Circuito Tech</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-md opacity-60"></div>
              <Avatar className="relative w-14 h-14 border-2 border-white/40 shadow-xl ring-2 ring-white/20">
                {displayAvatar ? (
                  <AvatarImage src={displayAvatar} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white">
                  <User className="w-7 h-7" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Mini Guide Card - Fluido e moderno */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold">Como funciona</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-2xl">♻️</span>
                  </div>
                  <p className="text-xs text-white/90 font-medium">Recicle</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-white/90 font-medium">Ganhe Chaves</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs text-white/90 font-medium">Resgate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-6 pb-6 space-y-5">
        {/* Main Progress Card - Super fluido e moderno */}
        <Card className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-cyan-900/40 backdrop-blur-xl border-purple-400/30 shadow-2xl rounded-3xl overflow-hidden relative">
          {/* Efeito de brilho sutil */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="text-purple-200 text-sm mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span>Suas Chaves de Impacto</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-5xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                    {displayKeys}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-200 text-xs mb-2">Nível Atual</p>
                <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 text-white border-0 shadow-lg px-3 py-1 rounded-full">
                  {displayLevel}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-purple-200 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Próximo nível
                </span>
                <span className="text-cyan-300 font-semibold">{keysToNext} chaves</span>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-3 bg-white/10 rounded-full overflow-hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main CTA - Mega destaque */}
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-cyan-500 via-cyan-600 to-purple-600 hover:from-cyan-600 hover:via-cyan-700 hover:to-purple-700 text-white py-8 rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-cyan-500/50 relative overflow-hidden group"
          onClick={onNavigateToStations}
        >
          {/* Efeito de brilho animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="text-base font-bold">Encontrar Pontos de Coleta</div>
              <div className="text-sm opacity-90">Recicle agora e ganhe chaves</div>
            </div>
          </div>
        </Button>

        {/* Quick Stats - Cards fluidos */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-purple-300/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{loading ? '...' : totalColetas}</p>
              <p className="text-xs text-purple-300">Reciclagens</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-lg border-cyan-300/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-cyan-400 mb-1">{loading ? '...' : totalResgates}</p>
              <p className="text-xs text-purple-300">Benefícios</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-lg border-purple-300/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{loading ? '...' : (rankingPosition > 0 ? `#${rankingPosition}` : '-')}</p>
              <p className="text-xs text-purple-300">Ranking</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rewards - Cards modernos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Gift className="w-4 h-4 text-white" />
              </div>
              Meus Benefícios Resgatados
            </h3>
          </div>
          
          {recentRewards.length > 0 ? (
            <div className="space-y-3">
              {recentRewards.slice(0, 2).map((reward, index) => (
                <Card 
                  key={index} 
                  className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg border-purple-300/20 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-1">{reward.title}</p>
                        <p className="text-xs text-purple-300">{reward.partner}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg px-3 py-1 rounded-full text-xs flex-shrink-0">
                        Resgatado
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-lg border-purple-300/20 rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-white font-semibold mb-1">Nenhum benefício resgatado ainda</p>
                <p className="text-sm text-purple-300">Continue reciclando para ganhar chaves e resgatar benefícios!</p>
              </CardContent>
            </Card>
          )}
          
          <Button 
            variant="outline" 
            className="w-full border-purple-300/30 text-purple-200 hover:bg-purple-600/20 rounded-xl py-6 backdrop-blur transition-all hover:border-purple-300/50" 
            size="sm"
            onClick={() => {
              const event = new CustomEvent('navigate', { detail: 'rewards' });
              window.dispatchEvent(event);
            }}
          >
            Ver Todos os Benefícios Disponíveis
          </Button>
        </div>
      </div>

      {/* Admin Debug Tools */}
      {(currentUser?.tipo === 'embaixador' || currentUser?.tipo === 'admin') && (
        <div className="max-w-md mx-auto px-6 pb-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-2 mx-auto transition-colors"
          >
            <Settings className="w-3 h-3" />
            {showDebug ? 'Ocultar' : 'Mostrar'} Debug Administrativo
          </button>
          
          {showDebug && (
            <div className="mt-4">
              <ConnectionTest />
            </div>
          )}
        </div>
      )}

      {/* Footer - Modernizado */}
      <div className="relative overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-md mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-white font-semibold mb-1">Continue reciclando! 🌱</p>
            <p className="text-sm text-white/80">Cada reciclagem ganha chaves para benefícios</p>
          </div>
        </div>
      </div>
    </div>
  );
}