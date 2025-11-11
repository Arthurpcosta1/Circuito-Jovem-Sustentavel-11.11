import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Share2,
  Award,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function ShareMenu({ isOpen, onClose }: ShareMenuProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const appLink = 'https://circuitojovemsustentavel.app/download';
  
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Primeira reciclagem registrada',
      earnedAt: 'Março 2024',
      icon: '🌱',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Reciclador de Papel',
      description: '50kg de papel reciclado',
      earnedAt: 'Abril 2024',
      icon: '♻️',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Embaixador Indicado',
      description: 'Indicou 5 amigos para o Circuito',
      earnedAt: 'Maio 2024',
      icon: '👥',
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Meta Mensal',
      description: 'Atingiu meta de reciclagem 3 meses seguidos',
      earnedAt: 'Junho 2024',
      icon: '🎯',
      rarity: 'legendary'
    }
  ];

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 border-gray-400/30 text-gray-300';
      case 'rare': return 'bg-blue-500/20 border-blue-400/30 text-blue-300';
      case 'epic': return 'bg-purple-500/20 border-purple-400/30 text-purple-300';
      case 'legendary': return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300';
    }
  };

  const getRarityBadgeColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600 text-white';
      case 'rare': return 'bg-blue-600 text-white';
      case 'epic': return 'bg-purple-600 text-white';
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareAchievement = (platform: 'whatsapp' | 'instagram' | 'tiktok') => {
    const achievement = achievements.find(a => a.id === selectedAchievement);
    if (!achievement) return;

    const shareText = `🎉 Acabei de conquistar "${achievement.title}" no Circuito Jovem Sustentável! ${achievement.description} 🌱♻️ #SustentabilidadeRecife #CircuitoJovem`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + appLink)}`, '_blank');
        break;
      case 'instagram':
        // Instagram não tem API de compartilhamento direto via web, então copiamos o texto
        navigator.clipboard.writeText(shareText);
        alert('Texto copiado! Cole na sua story ou post do Instagram 📸');
        break;
      case 'tiktok':
        // TikTok também não tem API web direta
        navigator.clipboard.writeText(shareText);
        alert('Texto copiado! Cole na descrição do seu TikTok 🎵');
        break;
    }
  };

  const handleShareApp = (platform: 'whatsapp' | 'instagram' | 'tiktok') => {
    const shareText = '🌱 Conheça o Circuito Jovem Sustentável! Um app gamificado de reciclagem que conecta universitários, comércio local e sustentabilidade em Recife. Ganhe recompensas reciclando! 🎮♻️';
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + appLink)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(shareText + '\n\n' + appLink);
        alert('Link copiado! Cole na sua bio ou story do Instagram 📸');
        break;
      case 'tiktok':
        navigator.clipboard.writeText(shareText + '\n\n' + appLink);
        alert('Link copiado! Cole na descrição do seu TikTok 🎵');
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-300/20 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Compartilhar
          </DialogTitle>
          <DialogDescription className="text-purple-300">
            Compartilhe suas conquistas e convide amigos para o Circuito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Share Achievements Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-purple-400" />
              <h3 className="text-white">Compartilhar Conquistas</h3>
            </div>
            <p className="text-purple-300 text-sm mb-4">Mostre suas conquistas e inspire outros!</p>

            {/* Achievements List */}
            <div className="space-y-2 mb-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`cursor-pointer transition-all ${
                    selectedAchievement === achievement.id
                      ? 'bg-purple-600/30 border-purple-400'
                      : 'bg-white/5 border-purple-300/20 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedAchievement(achievement.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getRarityColor(achievement.rarity)}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white text-sm truncate">{achievement.title}</h4>
                          <Badge className={`${getRarityBadgeColor(achievement.rarity)} text-xs px-1.5 py-0`}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-purple-200 text-xs">{achievement.description}</p>
                        <p className="text-purple-300/60 text-xs mt-1">{achievement.earnedAt}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Share Buttons for Achievement */}
            {selectedAchievement && (
              <div className="space-y-2">
                <p className="text-purple-200 text-xs mb-2">Compartilhar em:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleShareAchievement('whatsapp')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => handleShareAchievement('instagram')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    size="sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </Button>
                  <Button
                    onClick={() => handleShareAchievement('tiktok')}
                    className="bg-black hover:bg-gray-900 text-white"
                    size="sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                    TikTok
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-purple-300/20" />

          {/* Share App Link Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white">Compartilhar Link do App</h3>
            </div>
            <p className="text-purple-300 text-sm mb-4">Convide amigos para fazer parte do Circuito!</p>

            {/* App Link Card */}
            <Card className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-400/30 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <LinkIcon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm mb-1">Link de Convite</h4>
                    <p className="text-purple-200 text-xs truncate">{appLink}</p>
                  </div>
                </div>

                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full border-purple-300/30 text-white hover:bg-white/10"
                  size="sm"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Link Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Share App Buttons */}
            <div className="space-y-2">
              <p className="text-purple-200 text-xs mb-2">Compartilhar via:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleShareApp('whatsapp')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button
                  onClick={() => handleShareApp('instagram')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </Button>
                <Button
                  onClick={() => handleShareApp('tiktok')}
                  className="bg-black hover:bg-gray-900 text-white"
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  TikTok
                </Button>
              </div>
            </div>

            {/* Benefits Info */}
            <Card className="bg-cyan-600/10 border-cyan-400/30 mt-4">
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cyan-300 text-xs mb-1">Ganhe Recompensas!</p>
                    <p className="text-cyan-200/80 text-xs">
                      Para cada amigo que se cadastrar usando seu link, você ganha 5 Chaves de Impacto extras! 🎁
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
