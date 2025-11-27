import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Settings as SettingsComponent } from './Settings';
import { ShareMenu } from './ShareMenu';
import { UserQRCode } from './UserQRCode';
import { ProfileEdit } from './ProfileEdit';
import { auth } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { loadUserProfile, ensureUserExists } from '../utils/profileImage';
import { 
  User, 
  Award, 
  Key, 
  Recycle, 
  Gift, 
  Calendar,
  Edit3,
  Share2,
  Settings,
  Crown,
  Leaf,
  Target,
  Users,
  Shield,
  Camera,
  QrCode,
  Store,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

import { supabase } from '../utils/supabase';
import { calcularNivel, calcularProgresso, chavesParaProximoNivel } from '../utils/levelSystem';

interface ProfileProps {
  onNavigateToAdmin?: (screen: string) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function Profile({ onNavigateToAdmin }: ProfileProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = auth.getCurrentUser();
    
    if (user?.id) {
      // Garantir que o usuário existe no banco de dados
      await ensureUserExists(user);
      
      // Carregar dados atualizados do banco de dados
      const dbUser = await loadUserProfile(user.id);
      
      if (dbUser) {
        // Mesclar dados do localStorage com dados do banco
        const mergedUser = {
          ...user,
          ...dbUser
        };
        
        setCurrentUser(mergedUser);
        setProfilePhoto(dbUser.foto_url);
        
        // Atualizar localStorage com dados do banco
        auth.updateCurrentUser(mergedUser);
      } else {
        // Se não conseguir carregar do banco, usar dados do localStorage
        setCurrentUser(user);
        setProfilePhoto(user.foto_url);
      }
    } else {
      setCurrentUser(user);
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    if (updatedUser.foto_url) {
      setProfilePhoto(updatedUser.foto_url);
    }
    loadUserData();
  };

  // Calcular informações de nível
  const chavesAtuais = currentUser?.chaves_impacto || 0;
  const nivelInfo = calcularNivel(chavesAtuais);
  const progresso = calcularProgresso(chavesAtuais);
  const chavesRestantes = chavesParaProximoNivel(chavesAtuais);

  const userStats = {
    name: currentUser?.nome || 'Arthur Silva',
    email: currentUser?.email || 'arthur.silva@email.com',
    level: nivelInfo ? `Nível ${nivelInfo.nivel} - ${nivelInfo.nome}` : 'Nível 1 - Iniciante',
    impactKeys: chavesAtuais,
    totalRecycling: 0, // Será carregado do banco
    rewardsClaimed: 0, // Será carregado do banco
    joinDate: currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Março 2024',
    avatar: profilePhoto || currentUser?.foto_url || null,
    tipo: currentUser?.tipo || 'estudante'
  };

  // Carregar dados reais de reciclagens e resgates
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [currentUser]);

  const loadUserStats = async () => {
    if (!currentUser?.id) {
      setStatsLoading(false);
      return;
    }

    try {
      // Buscar coletas do usuário
      const { data: coletas } = await supabase
        .from('coletas')
        .select('id')
        .eq('usuario_id', currentUser.id);

      // Buscar resgates do usuário
      const { data: resgates } = await supabase
        .from('resgates')
        .select('id')
        .eq('usuario_id', currentUser.id);

      // Atualizar stats
      userStats.totalRecycling = coletas?.length || 0;
      userStats.rewardsClaimed = resgates?.length || 0;
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };



  const achievements: Achievement[] = [];

  // TODO: Buscar conquistas reais do banco de dados quando implementarmos o sistema de conquistas

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-200 bg-gray-50 text-gray-700';
      case 'rare': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'epic': return 'border-purple-200 bg-purple-50 text-purple-700';
      case 'legendary': return 'border-yellow-200 bg-yellow-50 text-yellow-700';
    }
  };

  const monthlyStats = [
    { month: 'Jan', recycling: 12, keys: 8 },
    { month: 'Fev', recycling: 18, keys: 12 },
    { month: 'Mar', recycling: 25, keys: 17 },
    { month: 'Abr', recycling: 20, keys: 14 },
    { month: 'Mai', recycling: 14, keys: 9 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pb-24">
      
      {/* ✅ Card de Acesso Administrativo ATUALIZADO - Moderno e bem posicionado */}
      {userStats.tipo === 'embaixador' && (
        <div className="relative overflow-hidden">
          {/* Background gradiente igual ao header */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative max-w-md mx-auto px-6 pt-6 pb-4">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur-md opacity-60"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base mb-0.5">Acesso Administrativo</h3>
                    <p className="text-white/90 text-sm">Validação de Coletas</p>
                  </div>
                  <Button 
                    onClick={() => onNavigateToAdmin?.('ambassador-validation')}
                    className="bg-white/20 backdrop-blur text-white hover:bg-white/30 font-semibold shadow-lg border border-white/30 rounded-xl px-4"
                    size="sm"
                  >
                    Validar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r from-purple-600 to-cyan-600 ${userStats.tipo === 'embaixador' ? '' : 'pt-8'}`}>
        <div className="max-w-md mx-auto px-6 ${userStats.tipo === 'embaixador' ? 'pt-2' : 'pt-0'} pb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg text-gray-900">Meu Perfil</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-900/30 text-gray-900 bg-gray-900/10 hover:bg-gray-900/20"
                onClick={() => setIsShareMenuOpen(true)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-900/30 text-gray-900 bg-gray-900/10 hover:bg-gray-900/20"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-gray-900/30">
                {userStats.avatar ? (
                  <AvatarImage src={userStats.avatar} alt={userStats.name} />
                ) : null}
                <AvatarFallback className="bg-gray-900/30 text-gray-900 text-2xl">
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-700 p-0 shadow-lg"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl text-gray-900 mb-1">{userStats.name}</h2>
              <p className="text-gray-800 text-sm mb-2">{userStats.email}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-900">{userStats.level}</span>
                </div>
                {userStats.tipo === 'embaixador' && (
                  <div className="flex items-center gap-1 bg-cyan-500/30 rounded px-2 py-1 w-fit">
                    <Shield className="w-3 h-3 text-cyan-900" />
                    <span className="text-xs text-gray-900">Jovem Embaixador</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-gray-900/30 text-gray-900 bg-gray-900/10 hover:bg-gray-900/20"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* QR Code Section */}
        <UserQRCode />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Key className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-lg text-white">{userStats.impactKeys}</p>
              <p className="text-xs text-purple-200">Chaves de Impacto</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Recycle className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-lg text-white">{userStats.totalRecycling}</p>
              <p className="text-xs text-purple-200">Reciclagens</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gift className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-lg text-white">{userStats.rewardsClaimed}</p>
              <p className="text-xs text-purple-200">Resgates</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section - Simplified */}
        <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-400" />
              <h3 className="text-white text-sm">Conquistas Recentes</h3>
            </div>
            
            <div className="space-y-2">
              {achievements.slice(0, 3).map((achievement) => (
                <Card key={achievement.id} className="bg-white/5 border-purple-300/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-base">{achievement.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{achievement.title}</p>
                        <p className="text-purple-300 text-xs truncate">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {achievements.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-purple-300 text-sm">🎯 Nenhuma conquista ainda</p>
                  <p className="text-purple-400 text-xs mt-1">Complete missões para ganhar conquistas!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
          <CardContent className="p-6">
            <h3 className="text-white mb-4">Informações da Conta</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-200">Tipo de conta</span>
                <span className="text-white capitalize">{userStats.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Membro desde</span>
                <span className="text-white">{userStats.joinDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Nível atual</span>
                <span className="text-white">{userStats.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Próximo nível em</span>
                <span className="text-cyan-400">{chavesRestantes} chaves</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full border-red-400/30 text-red-400 hover:bg-red-600/20 hover:text-red-300"
          onClick={() => setShowLogoutDialog(true)}
        >
          Sair da Conta
        </Button>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-gray-900 border-purple-300/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-purple-200">
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-purple-300/30 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                try {
                  await auth.signOut();
                  toast.success('Você saiu com sucesso!');
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 500);
                } catch (error) {
                  console.error('Erro ao sair:', error);
                  toast.error('Erro ao sair. Tente novamente.');
                }
              }}
            >
              Sim, sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 mt-6">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-900">Você é incrível! 🏆</p>
            <p className="text-xs text-gray-800 mt-1">Continue evoluindo no Circuito Jovem Tech</p>
          </div>
        </div>
      </div>

      {/* Settings Sheet */}
      <SettingsComponent isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Share Menu */}
      <ShareMenu isOpen={isShareMenuOpen} onClose={() => setIsShareMenuOpen(false)} />

      {/* Profile Edit Dialog */}
      <ProfileEdit 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}