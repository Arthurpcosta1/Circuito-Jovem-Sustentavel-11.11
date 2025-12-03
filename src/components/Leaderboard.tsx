import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, Medal, TrendingUp, TrendingDown, Zap, Crown, Star, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { buscarRanking, auth } from '../utils/api';

interface RankingUser {
  id: string;
  nome: string;
  chaves_impacto: number;
  nivel: number;
  foto_url?: string;
  posicao?: number;
}

export function Leaderboard() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<'graças' | 'recife' | 'pe'>('recife');
  const currentUser = auth.getCurrentUser();

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const { ranking: data } = await buscarRanking(50); // Top 50
      setRanking(data || []);
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      setError('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  // Encontrar posição do usuário atual no ranking
  const currentUserIndex = ranking.findIndex(u => u.id === currentUser?.id);
  const currentUserRank = currentUserIndex >= 0 ? ranking[currentUserIndex] : null;
  const userAbove = currentUserIndex > 0 ? ranking[currentUserIndex - 1] : null;
  const userBelow = currentUserIndex >= 0 && currentUserIndex < ranking.length - 1 ? ranking[currentUserIndex + 1] : null;
  
  const keysToRankUp = userAbove ? userAbove.chaves_impacto - (currentUserRank?.chaves_impacto || 0) : 0;
  const keysToRankDown = userBelow ? (currentUserRank?.chaves_impacto || 0) - userBelow.chaves_impacto : 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-purple-300 font-mono">{rank}º</span>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getNivelBadge = (nivel: number) => {
    if (nivel >= 10) return 'Líder Eco';
    if (nivel >= 8) return 'Guardião';
    if (nivel >= 6) return 'Defensor';
    if (nivel >= 4) return 'Protetor';
    if (nivel >= 2) return 'Explorador';
    return 'Iniciante';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-purple-200">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <Card className="border-red-500/30 bg-red-900/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-white mb-2">Erro ao carregar ranking</h3>
            <p className="text-red-200 text-sm mb-4">{error}</p>
            <Button 
              onClick={loadRanking}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (ranking.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-gray-900" />
            <h1 className="text-gray-900">Ranking Local</h1>
          </div>
          <p className="text-gray-800 text-sm">
            Compete com a comunidade e suba no ranking
          </p>
        </div>

        <div className="p-6">
          <Card className="border-purple-500/30 bg-gray-800/50">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-white mb-2">Ranking vazio</h3>
              <p className="text-purple-200 text-sm">
                Seja o primeiro a fazer uma coleta e aparecer no ranking!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-gray-900" />
          <h1 className="text-gray-900">Ranking Local</h1>
        </div>
        <p className="text-gray-800 text-sm">
          {ranking.length} usuários competindo no Circuito Jovem
        </p>
      </div>

      {/* Filtros de escopo - Desabilitados por enquanto */}
      <div className="px-6 -mt-4 mb-6">
        <Card className="border-purple-500/30 bg-gray-800/50 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Recife
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-purple-500/30 text-purple-400 opacity-50"
              >
                Graças
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="border-purple-500/30 text-purple-400 opacity-50"
              >
                Pernambuco
              </Button>
            </div>
            <p className="text-xs text-purple-400 mt-2">
              Filtros geográficos em breve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sua posição e contexto */}
      {currentUserRank && (
        <div className="px-6 mb-6">
          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-cyan-900/40 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400" />
                Sua Posição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estatísticas principais */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      {currentUserRank.posicao}º
                    </div>
                    <div className="text-xs text-purple-300">Posição</div>
                  </div>
                  <div className="h-12 w-px bg-purple-500/30" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-xl text-purple-100">{currentUserRank.chaves_impacto}</span>
                    </div>
                    <div className="text-xs text-purple-300">Chaves de Impacto</div>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0">
                  Nível {currentUserRank.nivel}
                </Badge>
              </div>

              {/* Progresso para subir/cair */}
              <div className="space-y-2 pt-2 border-t border-purple-500/20">
                {userAbove && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/30">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-purple-200">Para subir:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-100">+{keysToRankUp} chaves</div>
                      <div className="text-xs text-purple-400">Ultrapassar {userAbove.nome}</div>
                    </div>
                  </div>
                )}
                
                {userBelow && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/30">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-purple-200">Margem de segurança:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-purple-100">{keysToRankDown} chaves</div>
                      <div className="text-xs text-purple-400">À frente de {userBelow.nome}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 3 Pódio */}
      {ranking.length >= 3 && (
        <div className="px-6 mb-6">
          <h2 className="text-purple-200 mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Pódio
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {/* 2º Lugar */}
            <div className="pt-6">
              <Card className="border-gray-400/30 bg-gray-800/50 backdrop-blur text-center">
                <CardContent className="p-3">
                  <div className="mb-2">
                    <Avatar className="w-12 h-12 mx-auto border-2 border-gray-400">
                      {ranking[1].foto_url ? (
                        <AvatarImage src={ranking[1].foto_url} alt={ranking[1].nome} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                        {getInitials(ranking[1].nome)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <div className="text-xs text-purple-100 mb-1 truncate">{ranking[1].nome}</div>
                  <div className="text-xs text-purple-300">{ranking[1].chaves_impacto} chaves</div>
                </CardContent>
              </Card>
            </div>

            {/* 1º Lugar */}
            <div>
              <Card className="border-yellow-400/40 bg-gradient-to-br from-yellow-900/30 to-amber-900/30 backdrop-blur text-center">
                <CardContent className="p-3">
                  <div className="mb-2">
                    <Avatar className="w-16 h-16 mx-auto border-2 border-yellow-400">
                      {ranking[0].foto_url ? (
                        <AvatarImage src={ranking[0].foto_url} alt={ranking[0].nome} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white">
                        {getInitials(ranking[0].nome)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Trophy className="w-7 h-7 text-yellow-400 mx-auto mb-1" />
                  <div className="text-sm text-purple-100 mb-1 truncate">{ranking[0].nome}</div>
                  <div className="text-xs text-purple-300">{ranking[0].chaves_impacto} chaves</div>
                  <Badge className="mt-2 bg-yellow-600/20 text-yellow-300 border-yellow-400/30 text-xs">
                    {getNivelBadge(ranking[0].nivel)}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* 3º Lugar */}
            <div className="pt-6">
              <Card className="border-amber-600/30 bg-gray-800/50 backdrop-blur text-center">
                <CardContent className="p-3">
                  <div className="mb-2">
                    <Avatar className="w-12 h-12 mx-auto border-2 border-amber-600">
                      {ranking[2].foto_url ? (
                        <AvatarImage src={ranking[2].foto_url} alt={ranking[2].nome} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-amber-700 to-amber-800 text-white">
                        {getInitials(ranking[2].nome)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Medal className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <div className="text-xs text-purple-100 mb-1 truncate">{ranking[2].nome}</div>
                  <div className="text-xs text-purple-300">{ranking[2].chaves_impacto} chaves</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Lista completa do ranking */}
      <div className="px-6 pb-6">
        <h2 className="text-purple-200 mb-3">Ranking Completo</h2>
        <div className="space-y-2">
          {ranking.map((user) => {
            const isCurrentUser = user.id === currentUser?.id;
            return (
              <Card
                key={user.id}
                className={`${
                  isCurrentUser
                    ? 'border-cyan-500/50 bg-gradient-to-r from-purple-900/60 to-cyan-900/60 backdrop-blur ring-2 ring-cyan-500/30'
                    : 'border-purple-500/20 bg-gray-800/30 backdrop-blur'
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Posição */}
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(user.posicao || 0)}
                    </div>

                    {/* Avatar */}
                    <Avatar className={`w-10 h-10 ${
                      isCurrentUser ? 'ring-2 ring-cyan-400' : ''
                    }`}>
                      {user.foto_url ? (
                        <AvatarImage src={user.foto_url} alt={user.nome} />
                      ) : null}
                      <AvatarFallback className={`${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white'
                          : 'bg-gradient-to-br from-purple-800 to-purple-900 text-purple-200'
                      }`}>
                        {getInitials(user.nome)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate ${
                          isCurrentUser ? 'text-cyan-100' : 'text-purple-100'
                        }`}>
                          {user.nome}
                        </span>
                        {isCurrentUser && (
                          <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-400/30 text-xs px-1.5 py-0">
                            Você
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-purple-400">
                        <span>Nível {user.nivel}</span>
                        <span>•</span>
                        <span>{getNivelBadge(user.nivel)}</span>
                      </div>
                    </div>

                    {/* Chaves */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-purple-100">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{user.chaves_impacto}</span>
                      </div>
                      <div className="text-xs text-purple-400">chaves</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
