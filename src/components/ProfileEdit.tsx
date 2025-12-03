import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, User, X, AlertCircle, HelpCircle } from 'lucide-react';
import { auth } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { uploadProfileImage, updateProfilePhoto, updateUserProfile, deleteOldProfilePhoto, ensureUserExists } from '../utils/profileImage';
import { StorageSetupGuide } from './StorageSetupGuide';

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onSave: (updatedUser: any) => void;
}

export function ProfileEdit({ isOpen, onClose, currentUser, onSave }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    nome: currentUser?.nome || '',
    email: currentUser?.email || '',
    curso: currentUser?.curso || '',
    periodo: currentUser?.periodo || ''
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(currentUser?.foto_url || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showStorageGuide, setShowStorageGuide] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!currentUser?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError(false);

    try {
      // Garantir que o usuário existe no banco de dados
      await ensureUserExists(currentUser);

      // Fazer upload da imagem para o Supabase Storage
      const photoUrl = await uploadProfileImage(file, currentUser.id);
      
      if (!photoUrl) {
        setIsUploadingPhoto(false);
        setUploadError(true);
        return;
      }

      // Deletar foto antiga se existir
      if (currentUser.foto_url) {
        await deleteOldProfilePhoto(currentUser.foto_url);
      }

      // Atualizar a foto no banco de dados
      const success = await updateProfilePhoto(currentUser.id, photoUrl);
      
      if (success) {
        setProfilePhoto(photoUrl);
        setUploadError(false);
        toast.success('Foto atualizada com sucesso!');
      } else {
        setUploadError(true);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao atualizar foto - Verifique a configuração do Storage');
      setUploadError(true);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validar campos obrigatórios
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório');
      return;
    }

    if (!currentUser?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    try {
      // Garantir que o usuário existe no banco de dados
      await ensureUserExists(currentUser);

      // Atualizar dados do perfil no banco de dados
      const updateData = {
        nome: formData.nome,
        email: formData.email,
        // Campos opcionais que podem não existir na tabela - apenas incluir se tiver valor
        ...(formData.curso && { curso: formData.curso }),
        ...(formData.periodo && { periodo: formData.periodo })
      };

      const success = await updateUserProfile(currentUser.id, updateData);

      if (!success) {
        return;
      }

      // Criar objeto de usuário atualizado
      const updatedUser = {
        ...currentUser,
        ...formData,
        foto_url: profilePhoto
      };

      // Atualizar localStorage
      auth.updateCurrentUser(updatedUser);

      // Notificar componente pai
      onSave(updatedUser);

      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">Editar Perfil</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <DialogDescription className="text-purple-300">
            Atualize suas informações pessoais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alerta de Erro de Upload */}
          {uploadError && (
            <Alert className="bg-red-600/20 border-red-400/30">
              <AlertDescription className="text-red-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="mb-2">Erro ao fazer upload da foto. O Supabase Storage pode não estar configurado.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowStorageGuide(true)}
                      className="border-red-400/30 text-red-200 hover:bg-red-600/20"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Ver Como Configurar
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Foto de Perfil */}
          <div className="bg-gray-800/50 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-purple-500/30">
                  {profilePhoto ? (
                    <AvatarImage src={profilePhoto} alt={formData.nome} />
                  ) : null}
                  <AvatarFallback className="bg-purple-600/20 text-purple-300">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handlePhotoClick}
                  disabled={isUploadingPhoto}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-white">Foto de Perfil</p>
                <p className="text-sm text-gray-400">Clique no ícone para alterar</p>
              </div>
            </div>
          </div>

          {/* Campos do Formulário */}
          <div className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Nome Completo
              </Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Arthur Silva"
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <span className="text-purple-400">✉️</span>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="arthur.silva@email.com"
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>

            {/* Curso */}
            <div className="space-y-2">
              <Label htmlFor="curso" className="text-white flex items-center gap-2">
                <span className="text-purple-400">🎓</span>
                Curso
              </Label>
              <Input
                id="curso"
                type="text"
                value={formData.curso}
                onChange={(e) => handleInputChange('curso', e.target.value)}
                placeholder="Engenharia Ambiental"
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>

            {/* Período */}
            <div className="space-y-2">
              <Label htmlFor="periodo" className="text-white flex items-center gap-2">
                <span className="text-purple-400">📅</span>
                Período
              </Label>
              <Input
                id="periodo"
                type="text"
                value={formData.periodo}
                onChange={(e) => handleInputChange('periodo', e.target.value)}
                placeholder="5º Período"
                className="bg-gray-800/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-purple-500/30 text-white hover:bg-gray-800"
            >
              Voltar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUploadingPhoto}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Guia de Configuração do Storage */}
      <StorageSetupGuide 
        isOpen={showStorageGuide} 
        onClose={() => setShowStorageGuide(false)} 
      />
    </Dialog>
  );
}
