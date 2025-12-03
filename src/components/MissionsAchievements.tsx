import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Target,
  Trophy,
  Lock,
  CheckCircle,
  Clock,
  Users,
  Leaf,
  Recycle,
  Award,
  Star,
  Zap,
  Gift,
  Shield,
  Crown
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
  type: 'daily' | 'weekly' | 'community';
  status: 'active' | 'completed';
  icon: React.ReactNode;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

export function MissionsAchievements() {
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>('missions');

  // Missões
  const missions: Mission[] = [
    {
      id: '1',
      title: 'Missão da Semana: Recicle em 2 Estações diferentes',
      description: 'Visite e recicle em pelo menos 2 estações diferentes',
      progress: 1,
      total: 2,
      reward: 50,
      type: 'weekly',
      status: 'active',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: '2',
      title: 'Missão Comunitária: Atingir 100kg no Bloco A',
      description: 'Ajude sua estação a atingir a meta coletiva',
      progress: 100,
      total: 100,
      reward: 100,
      type: 'community',
      status: 'completed',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: '3',
      title: 'Missão Diária: Recicle 3kg de plástico',
      description: 'Contribua com a reciclagem de plástico hoje',
      progress: 2.5,
      total: 3,
      reward: 20,
      type: 'daily',
      status: 'active',
      icon: <Recycle className="w-5 h-5" />
    },
    {
      id: '4',
      title: 'Convide 3 amigos para o app',
      description: 'Compartilhe o app e ganhe recompensas',
      progress: 1,
      total: 3,
      reward: 75,
      type: 'weekly',
      status: 'active',
      icon: <Gift className="w-5 h-5" />
    }
  ];

  // Conquistas (Selos)
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Guardião do Papel',
      description: 'Reciclou 50kg de papel',
      icon: <Leaf className="w-6 h-6" />,
      rarity: 'common',
      unlocked: true
    },
    {
      id: '2',
      title: 'Primeiro Passo',
      description: 'Primeira reciclagem registrada',
      icon: <Star className="w-6 h-6" />,
      rarity: 'common',
      unlocked: true
    },
    {
      id: '3',
      title: 'Reciclador Expert',
      description: 'Reciclou em 5 estações diferentes',
      icon: <Trophy className="w-6 h-6" />,
      rarity: 'rare',
      unlocked: true
    },
    {
      id: '4',
      title: 'Líder Verde',
      description: 'Chegou ao Top 10 do ranking',
      icon: <Crown className="w-6 h-6" />,
      rarity: 'epic',
      unlocked: false
    },
    {
      id: '5',
      title: 'Recrutador Mestre',
      description: 'Convidou 10 amigos',
      icon: <Users className="w-6 h-6" />,
      rarity: 'epic',
      unlocked: false
    },
    {
      id: '6',
      title: 'Guardião Lendário',
      description: 'Reciclou 500kg no total',
      icon: <Shield className="w-6 h-6" />,
      rarity: 'legendary',
      unlocked: false
    },
    {
      id: '7',
      title: 'Velocista Eco',
      description: 'Completou 20 missões em um mês',
      icon: <Zap className="w-6 h-6" />,
      rarity: 'rare',
      unlocked: false
    },
    {
      id: '8',
      title: 'Herói Comunitário',
      description: 'Participou de 5 missões comunitárias',
      icon: <Award className="w-6 h-6" />,
      rarity: 'epic',
      unlocked: false
    },
    {
      id: '9',
      title: 'Reciclador Dedicado',
      description: 'Reciclou por 30 dias seguidos',
      icon: <CheckCircle className="w-6 h-6" />,
      rarity: 'rare',
      unlocked: false
    }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-green-300 bg-green-50 text-green-700';
      case 'rare': return 'border-blue-300 bg-blue-50 text-blue-700';
      case 'epic': return 'border-purple-300 bg-purple-50 text-purple-700';
      case 'legendary': return 'border-orange-300 bg-orange-50 text-orange-700';
    }
  };

  const getMissionTypeColor = (type: Mission['type']) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'weekly': return 'bg-green-100 text-green-700 border-green-300';
      case 'community': return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  const getMissionTypeLabel = (type: Mission['type']) => {
    switch (type) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'community': return 'Comunitária';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-md mx-auto px-6 py-6">
          <h1 className="text-lg text-gray-900 mb-1">Missões e Conquistas</h1>
          <p className="text-gray-800 text-sm">Complete desafios e ganhe recompensas</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-6 border border-purple-300/20">
            <TabsTrigger 
              value="missions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-purple-200"
            >
              <Target className="w-4 h-4 mr-2" />
              Missões
            </TabsTrigger>
            <TabsTrigger 
              value="achievements"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-purple-200"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          {/* Aba Missões */}
          <TabsContent value="missions" className="space-y-3">
            {missions.map((mission) => (
              <Card 
                key={mission.id}
                className={`border ${
                  mission.status === 'completed' 
                    ? 'bg-cyan-600/20 border-cyan-400/30' 
                    : 'bg-white/10 border-purple-300/20'
                } backdrop-blur`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      mission.status === 'completed' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {mission.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        mission.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white text-sm">{mission.title}</h3>
                        <Badge className={getMissionTypeColor(mission.type)} className="text-xs">
                          {getMissionTypeLabel(mission.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-purple-300 mb-3">{mission.description}</p>
                      
                      {mission.status === 'active' ? (
                        <>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-purple-300 mb-1">
                              <span>Progresso</span>
                              <span>{mission.progress}/{mission.total}</span>
                            </div>
                            <Progress 
                              value={(mission.progress / mission.total) * 100} 
                              className="h-2 bg-white/10"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-cyan-300">
                            <Gift className="w-3 h-3" />
                            <span>Recompensa: {mission.reward} chaves</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-cyan-300">
                          <CheckCircle className="w-3 h-3" />
                          <span>Missão Concluída! +{mission.reward} chaves</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Aba Conquistas (Selos) */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`${
                    achievement.unlocked
                      ? 'border-cyan-400/30 bg-cyan-600/20 backdrop-blur'
                      : 'border-purple-300/20 bg-white/5 backdrop-blur opacity-60'
                  }`}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      achievement.unlocked
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'bg-white/5 text-gray-500'
                    }`}>
                      {achievement.unlocked ? (
                        achievement.icon
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <p className={`text-xs mb-1 ${
                      achievement.unlocked ? 'text-white' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </p>
                    <p className={`text-xs ${
                      achievement.unlocked ? 'text-purple-300' : 'text-gray-600'
                    }`}>
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Legend */}
            <Card className="mt-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-300/20">
              <CardContent className="p-4">
                <p className="text-sm text-white mb-2">Raridades:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span className="text-purple-300">Comum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-purple-300">Raro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-purple-300">Épico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <span className="text-purple-300">Lendário</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 mt-6">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-900">Continue completando missões! 🎯</p>
            <p className="text-xs text-gray-800 mt-1">Ganhe chaves e conquistas exclusivas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
