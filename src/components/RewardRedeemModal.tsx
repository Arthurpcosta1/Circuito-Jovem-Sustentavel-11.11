import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { QrCode, CheckCircle, X, Clock, Store, Gift, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RewardRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    id: string;
    title: string;
    partner: string;
    description: string;
  } | null;
  redeemCode: string;
  expiresAt: string;
}

export function RewardRedeemModal({
  isOpen,
  onClose,
  reward,
  redeemCode,
  expiresAt
}: RewardRedeemModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && redeemCode) {
      generateQRCode();
    }
  }, [isOpen, redeemCode]);

  const generateQRCode = async () => {
    if (!redeemCode) return;

    try {
      // Importar dinamicamente o QRCode
      const QRCode = (await import('qrcode')).default;
      
      // Gerar QR Code como Data URL
      const url = await QRCode.toDataURL(redeemCode, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      
      setQrCodeDataUrl(url);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(redeemCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiryTime = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutos`;
    }
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} horas`;
  };

  if (!reward) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-purple-300/30 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg">Vantagem Resgatada! 🎉</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-purple-200">
            Apresente este QR Code no estabelecimento parceiro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reward Info */}
          <Card className="bg-gradient-to-r from-purple-600 to-cyan-600 border-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm mb-1">{reward.title}</h3>
                  <p className="text-white/90 text-xs">{reward.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="bg-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="mb-3">
                  <Badge className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0">
                    <Store className="w-3 h-3 mr-1" />
                    {reward.partner}
                  </Badge>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <img src={qrCodeDataUrl} alt="QR Code" />
                </div>

                <div className="mt-4 w-full">
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                    <div className="flex-1 mr-2">
                      <p className="text-xs text-gray-600 mb-1">Código de Resgate</p>
                      <p className="text-sm font-mono font-bold text-gray-900 truncate">
                        {redeemCode}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyCode}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expiry Info */}
          <Card className="bg-white/5 border-purple-300/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-sm">Validade do Código</span>
              </div>
              <p className="text-purple-200 text-sm">
                Este código expira em <span className="text-cyan-400 font-bold">{formatExpiryTime(expiresAt)}</span>
              </p>
              <p className="text-purple-300 text-xs mt-2">
                Apresente no estabelecimento antes do prazo para aproveitar sua vantagem!
              </p>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-purple-600/20 border-purple-400/30">
            <CardContent className="p-4">
              <h4 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                Como usar:
              </h4>
              <ol className="text-purple-200 text-sm space-y-1 list-decimal list-inside">
                <li>Vá até o estabelecimento parceiro</li>
                <li>Mostre este QR Code para o atendente</li>
                <li>Aguarde a validação do código</li>
                <li>Aproveite sua vantagem! 🎁</li>
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
            >
              Entendi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}