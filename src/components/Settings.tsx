import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
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
import { 
  User, 
  Mail, 
  Camera, 
  GraduationCap, 
  Calendar,
  Lock,
  Globe,
  History,
  ChevronRight,
  Save,
  X,
  Key,
  Recycle,
  LogOut
} from 'lucide-react';
import { auth } from '../utils/api';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: SettingsView;
}

type SettingsView = 'main' | 'edit-profile' | 'change-password' | 'language' | 'recycling-history';

export function Settings({ isOpen, onClose, initialView = 'main' }: SettingsProps) {
  const [currentView, setCurrentView] = useState<SettingsView>(initialView);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Reset view when sheet opens with a new initialView
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView);
    }
  }, [isOpen, initialView]);

  // Form states
  const [formData, setFormData] = useState({
    name: 'Arthur Silva',
    email: 'arthur.silva@email.com',
    course: 'Engenharia Ambiental',
    period: '5º Período',
    photo: 'https://images.unsplash.com/photo-1758599668209-783bd3691ec8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHBlb3BsZSUyMHJlY3ljbGluZyUyMHN1c3RhaW5hYmlsaXR5fGVufDF8fHx8MTc1OTkyNzYyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  // Mock recycling history data
  const recyclingHistory = [
    { id: '1', date: '08/10/2024', type: 'Papel', weight: '5kg', keys: 10, station: 'UNINASSAU Graças' },
    { id: '2', date: '05/10/2024', type: 'Plástico', weight: '3kg', keys: 6, station: 'Shopping Recife' },
    { id: '3', date: '03/10/2024', type: 'Metal', weight: '2kg', keys: 8, station: 'UNINASSAU Graças' },
    { id: '4', date: '30/09/2024', type: 'Vidro', weight: '4kg', keys: 7, station: 'Boa Viagem' },
    { id: '5', date: '28/09/2024', type: 'Papel', weight: '6kg', keys: 12, station: 'UNINASSAU Graças' },
    { id: '6', date: '25/09/2024', type: 'Eletrônico', weight: '1kg', keys: 15, station: 'Shopping Recife' },
  ];

  const totalKeys = recyclingHistory.reduce((sum, item) => sum + item.keys, 0);
  const totalCollections = recyclingHistory.length;

  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  ];

  const handleSaveProfile = () => {
    // Aqui você implementaria a lógica de salvar no backend
    setIsEditing(false);
    setCurrentView('main');
  };

  const handleChangePassword = () => {
    // Aqui você implementaria a lógica de alterar senha
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setCurrentView('main');
  };

  const handleBack = () => {
    setIsEditing(false);
    setCurrentView('main');
  };

  const renderMainMenu = () => (
    <div className="space-y-4">
      {/* Edit Profile Section */}
      <div>
        <h3 className="text-purple-200 text-sm mb-3 px-1">Perfil</h3>
        <Card className="bg-white/5 border-purple-300/20 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setCurrentView('edit-profile')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white text-sm">Editar Perfil</p>
                <p className="text-purple-300 text-xs">Nome, email, foto, curso</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-300" />
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-purple-300/20" />

      {/* Security Section */}
      <div>
        <h3 className="text-purple-200 text-sm mb-3 px-1">Segurança</h3>
        <Card className="bg-white/5 border-purple-300/20 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setCurrentView('change-password')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white text-sm">Alterar Senha</p>
                <p className="text-purple-300 text-xs">Redefinir login e senha</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-300" />
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-purple-300/20" />

      {/* Preferences Section */}
      <div>
        <h3 className="text-purple-200 text-sm mb-3 px-1">Preferências</h3>
        <Card className="bg-white/5 border-purple-300/20 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setCurrentView('language')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white text-sm">Idioma</p>
                <p className="text-purple-300 text-xs">Português (Brasil)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-300" />
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-purple-300/20" />

      {/* Activity Section */}
      <div>
        <h3 className="text-purple-200 text-sm mb-3 px-1">Atividade</h3>
        <Card className="bg-white/5 border-purple-300/20 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setCurrentView('recycling-history')}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <History className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white text-sm">Histórico de Reciclagem</p>
                <p className="text-purple-300 text-xs">Ver todas as coletas</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-purple-300" />
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-purple-300/20" />

      {/* Logout Section */}
      <div>
        <h3 className="text-purple-200 text-sm mb-3 px-1">Conta</h3>
        <Button 
          variant="outline" 
          className="w-full border-red-400/30 text-red-400 hover:bg-red-600/20 hover:text-red-300 justify-start"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="w-4 h-4 mr-2" />
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
                  const { toast } = await import('sonner@2.0.3');
                  await auth.signOut();
                  toast.success('Você saiu com sucesso!');
                  onClose();
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 500);
                } catch (error) {
                  console.error('Erro ao sair:', error);
                  const { toast } = await import('sonner@2.0.3');
                  toast.error('Erro ao sair. Tente novamente.');
                }
              }}
            >
              Sim, sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderEditProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-purple-200 hover:text-white hover:bg-white/10">
          <X className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button size="sm" onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>

      {/* Photo */}
      <Card className="bg-white/5 border-purple-300/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={formData.photo} alt="Foto de perfil" className="w-20 h-20 rounded-full object-cover border-2 border-purple-400" />
              <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-purple-600 hover:bg-purple-700">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm mb-1">Foto de Perfil</p>
              <p className="text-purple-300 text-xs">Clique no ícone para alterar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name */}
      <div className="space-y-2">
        <Label className="text-purple-200 flex items-center gap-2">
          <User className="w-4 h-4" />
          Nome Completo
        </Label>
        <Input 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className="text-purple-200 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          E-mail
        </Label>
        <Input 
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50"
        />
      </div>

      {/* Course */}
      <div className="space-y-2">
        <Label className="text-purple-200 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Curso
        </Label>
        <Input 
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          className="bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50"
        />
      </div>

      {/* Period */}
      <div className="space-y-2">
        <Label className="text-purple-200 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Período
        </Label>
        <Input 
          value={formData.period}
          onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          className="bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50"
        />
      </div>
    </div>
  );

  const renderChangePassword = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-purple-200 hover:text-white hover:bg-white/10">
          <X className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button size="sm" onClick={handleChangePassword} className="bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-2" />
          Alterar
        </Button>
      </div>

      <Card className="bg-purple-500/10 border-purple-300/30">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm mb-1">Segurança da Conta</p>
              <p className="text-purple-200 text-xs">Use uma senha forte com letras, números e caracteres especiais.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Password */}
      <div className="space-y-2">
        <Label className="text-purple-200">Senha Atual</Label>
        <Input 
          type="password"
          placeholder="Digite sua senha atual"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
          className="bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50"
        />
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label className="text-purple-200">Nova Senha</Label>
        <Input 
          type="password"
          placeholder="Digite sua nova senha"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          className="bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50"
        />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label className="text-purple-200">Confirmar Nova Senha</Label>
        <Input 
          type="password"
          placeholder="Confirme sua nova senha"
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          className="bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300/50"
        />
      </div>

      <Button variant="outline" className="w-full border-purple-300/30 text-purple-200 hover:bg-purple-600/20">
        Esqueci Minha Senha
      </Button>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-purple-200 hover:text-white hover:bg-white/10">
          <X className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="space-y-3">
        {languages.map((lang) => (
          <Card 
            key={lang.code}
            className={`cursor-pointer transition-all ${
              selectedLanguage === lang.code 
                ? 'bg-purple-600/30 border-purple-400' 
                : 'bg-white/5 border-purple-300/20 hover:bg-white/10'
            }`}
            onClick={() => setSelectedLanguage(lang.code)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <p className="text-white text-sm">{lang.name}</p>
              </div>
              {selectedLanguage === lang.code && (
                <Badge className="bg-purple-600 text-white">Ativo</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRecyclingHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-purple-200 hover:text-white hover:bg-white/10">
          <X className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-purple-600/20 border-purple-400/30">
          <CardContent className="p-4 text-center">
            <Key className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl text-white mb-1">{totalKeys}</p>
            <p className="text-xs text-purple-200">Total de Chaves</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-600/20 border-cyan-400/30">
          <CardContent className="p-4 text-center">
            <Recycle className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl text-white mb-1">{totalCollections}</p>
            <p className="text-xs text-cyan-200">Total de Coletas</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <h3 className="text-purple-200 text-sm">Histórico Completo</h3>
        {recyclingHistory.map((item) => (
          <Card key={item.id} className="bg-white/5 border-purple-300/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs border-purple-300/30 text-purple-300 bg-purple-400/10">
                      {item.type}
                    </Badge>
                    <span className="text-white text-sm">{item.weight}</span>
                  </div>
                  <p className="text-purple-300 text-xs">{item.station}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-cyan-400 mb-1">
                    <Key className="w-3 h-3" />
                    <span className="text-sm">+{item.keys}</span>
                  </div>
                  <p className="text-purple-300 text-xs">{item.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'edit-profile':
        return renderEditProfile();
      case 'change-password':
        return renderChangePassword();
      case 'language':
        return renderLanguage();
      case 'recycling-history':
        return renderRecyclingHistory();
      default:
        return renderMainMenu();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="bg-gray-900 border-l border-purple-300/20 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white text-left">
            {currentView === 'main' && 'Configurações'}
            {currentView === 'edit-profile' && 'Editar Perfil'}
            {currentView === 'change-password' && 'Alterar Senha'}
            {currentView === 'language' && 'Idioma'}
            {currentView === 'recycling-history' && 'Histórico de Reciclagem'}
          </SheetTitle>
          <SheetDescription className="text-purple-300 text-left">
            {currentView === 'main' && 'Gerencie suas preferências e informações da conta'}
            {currentView === 'edit-profile' && 'Atualize suas informações pessoais'}
            {currentView === 'change-password' && 'Altere sua senha de acesso'}
            {currentView === 'language' && 'Selecione o idioma do aplicativo'}
            {currentView === 'recycling-history' && 'Veja todo o histórico de suas coletas'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
