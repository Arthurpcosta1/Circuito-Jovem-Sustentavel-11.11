import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { QrCode, Download, X, Info, RefreshCw, Shield, Clock } from 'lucide-react';
import { auth, gerarTokenQRCode } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function UserQRCode() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrToken, setQrToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const user = auth.getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (showQRCode && currentUser && !qrToken) {
      handleGenerateQRCode();
    }
  }, [showQRCode, currentUser]);

  // Contador de tempo restante
  useEffect(() => {
    if (expiresAt > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeRemaining(remaining);

        // Se expirou, limpar
        if (remaining === 0) {
          setQrToken('');
          setQrCodeDataUrl('');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  const handleGenerateQRCode = async () => {
    if (!currentUser?.id) {
      toast.error('Erro ao gerar QR Code. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);

    try {
      // Gerar token seguro no servidor
      const response = await gerarTokenQRCode(currentUser.id);

      if (!response.success || !response.token) {
        throw new Error(response.error || 'Erro ao gerar token');
      }

      const token = response.token;
      setQrToken(token);

      // Token expira em 5 minutos
      const expirationTime = Date.now() + (5 * 60 * 1000);
      setExpiresAt(expirationTime);

      // Criar QR Code com o token
      await createQRCode(token);
      
      toast.success('QR Code gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error(error.message || 'Erro ao gerar QR Code');
      setShowQRCode(false);
    } finally {
      setLoading(false);
    }
  };

  const createQRCode = async (token: string) => {
    // Usar biblioteca qrcode (melhor e mais confiável)
    const QRCode = await import('qrcode');
    
    try {
      // Gerar QR code como Data URL
      const qrDataUrl = await QRCode.toDataURL(token, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      
      // Setar a imagem no state (React vai renderizar automaticamente)
      setQrCodeDataUrl(qrDataUrl);
      
      console.log('✅ QR Code gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar QR Code:', error);
      throw new Error('Erro ao gerar imagem do QR Code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `circuito-jovem-qrcode-${currentUser?.nome || 'usuario'}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    
    toast.success('QR Code baixado com sucesso!');
  };

  const handleRefresh = () => {
    setQrToken('');
    setQrCodeDataUrl('');
    setExpiresAt(0);
    setTimeRemaining(0);
    handleGenerateQRCode();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showQRCode) {
    return (
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-purple-300/20 rounded-2xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Meu QR Code</h3>
              <p className="text-sm text-purple-200">
                Use para validar suas coletas nas estações
              </p>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-200">
                <p className="font-semibold mb-1">Sistema Seguro</p>
                <p className="text-xs opacity-90">
                  Cada QR Code é único, criptografado e expira em 5 minutos para sua segurança
                </p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 rounded-xl shadow-lg transition-all"
            onClick={() => setShowQRCode(true)}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Gerar Meu QR Code Seguro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-purple-300/20 rounded-2xl shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold">Meu QR Code</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowQRCode(false);
              setQrToken('');
              setQrCodeDataUrl('');
            }}
            className="text-purple-200 hover:text-white hover:bg-purple-600/20 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 mb-5">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Gerando QR Code seguro...</p>
            </div>
          </div>
        ) : (
          <>
            {/* QR Code */}
            <div className="bg-white rounded-2xl p-6 mb-5 shadow-lg">
              <div className="flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                    Gerando QR Code...
                  </div>
                )}
              </div>
            </div>

            {/* Time Remaining */}
            {timeRemaining > 0 && (
              <div className={`rounded-xl p-4 mb-5 flex items-center justify-between transition-colors ${
                timeRemaining <= 60 
                  ? 'bg-red-500/10 border border-red-400/30' 
                  : 'bg-cyan-500/10 border border-cyan-400/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    timeRemaining <= 60 
                      ? 'bg-red-500/20' 
                      : 'bg-cyan-500/20'
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      timeRemaining <= 60 
                        ? 'text-red-400' 
                        : 'text-cyan-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${
                      timeRemaining <= 60 
                        ? 'text-red-300' 
                        : 'text-cyan-300'
                    }`}>
                      {timeRemaining <= 60 ? 'Expira em breve!' : 'Tempo restante'}
                    </p>
                    <p className={`text-xs ${
                      timeRemaining <= 60 
                        ? 'text-red-200' 
                        : 'text-cyan-200'
                    }`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="border-purple-300/30 text-purple-200 hover:bg-purple-600/20 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Renovar
                </Button>
              </div>
            )}

            {/* User Info */}
            <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-purple-400/30 rounded-xl p-4 mb-5">
              <div className="text-center space-y-2">
                <p className="text-white font-semibold">{currentUser?.nome}</p>
                <Badge className="bg-gradient-to-r from-purple-600 to-purple-500 text-white border-0 shadow-lg">
                  {currentUser?.nivel ? `Nível ${currentUser.nivel}` : 'Iniciante'}
                </Badge>
                <div className="flex items-center justify-center gap-2 text-sm text-purple-200">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>{currentUser?.chaves_impacto || 0} Chaves de Impacto</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-200 space-y-2">
                  <p className="font-semibold">Como usar:</p>
                  <ol className="text-xs space-y-1 opacity-90 list-decimal list-inside">
                    <li>Mostre este QR Code para o Embaixador na estação</li>
                    <li>Aguarde ele escanear com o app dele</li>
                    <li>Confirme o peso e tipo do material</li>
                    <li>Receba suas Chaves de Impacto na hora!</li>
                  </ol>
                  <div className="pt-2 mt-2 border-t border-purple-400/20 flex items-start gap-2">
                    <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-cyan-300">
                      QR Code criptografado e validado pelo servidor. Expira automaticamente após 5 minutos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-purple-300/30 text-purple-200 hover:bg-purple-600/20 rounded-xl py-6 transition-all"
                onClick={downloadQRCode}
                disabled={!qrCodeDataUrl}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl py-6 shadow-lg transition-all"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Gerar Novo
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}