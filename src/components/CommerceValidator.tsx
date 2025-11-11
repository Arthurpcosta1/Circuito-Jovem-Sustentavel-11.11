import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  QrCode, 
  Camera, 
  X, 
  CheckCircle, 
  Gift,
  User,
  Key,
  Clock,
  AlertTriangle,
  FileText,
  Loader2
} from 'lucide-react';
import jsQR from 'jsqr';

interface RewardData {
  code: string;
  userName: string;
  rewardName: string;
  rewardValue: string;
  userKeys: number;
}

export function CommerceValidator() {
  const [scanMode, setScanMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  const storeName = 'Cafeteria Campus';
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    if (scanMode) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMode]);

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleCodeDetected(code.data);
        setScanMode(false);
        return;
      }
    }

    animationRef.current = requestAnimationFrame(scanQRCode);
  };

  const handleCodeDetected = (code: string) => {
    console.log('Código detectado:', code);
    
    try {
      // Tentar fazer parse do código de resgate
      const parsedData = JSON.parse(code);
      
      // Se for um QR code de resgate de vantagem
      if (parsedData.rewardCode || parsedData.userId) {
        setScannedData(parsedData);
        
        // Mock de dados de vantagem baseado no QR code
        const mockReward: RewardData = {
          code: parsedData.rewardCode || code.substring(0, 15),
          userName: parsedData.userName || 'Usuário',
          rewardName: parsedData.rewardName || 'Café Expresso Grátis',
          rewardValue: parsedData.rewardValue || '15 chaves',
          userKeys: parsedData.userKeys || 47
        };
        
        setRewardData(mockReward);
      } else {
        setCameraError('QR code inválido para resgate de vantagens.');
        setScanMode(false);
      }
    } catch (error) {
      // Se não for JSON, pode ser um código de resgate simples
      console.log('Processando código simples:', code);
      
      // Mock para desenvolvimento
      const mockReward: RewardData = {
        code: code.substring(0, 15) || 'VTG-2024-' + Date.now(),
        userName: 'Usuário',
        rewardName: 'Vantagem Resgatada',
        rewardValue: '15 chaves',
        userKeys: 47
      };
      
      setRewardData(mockReward);
    }
  };

  const handleManualValidation = () => {
    if (manualCode.trim()) {
      handleCodeDetected(manualCode);
    }
  };

  const handleConfirmRedemption = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🔵 Utilizando resgate:', rewardData?.code);
      
      // Fazer chamada real à API
      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'ieyqcvafbylfnzzjrvvd'}.supabase.co/functions/v1/make-server-7af4432d/resgates/${rewardData?.code}/utilizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao utilizar resgate');
      }

      console.log('✅ Resgate utilizado:', data);
      
      setIsProcessing(false);
      setIsComplete(true);
      
      setTimeout(() => {
        setIsComplete(false);
        setRewardData(null);
        setManualCode('');
        setScannedData(null);
      }, 3000);
    } catch (error) {
      console.error('❌ Erro ao confirmar resgate:', error);
      setIsProcessing(false);
      setCameraError(error instanceof Error ? error.message : 'Erro ao processar o resgate. Tente novamente.');
    }
  };

  const handleCancel = () => {
    stopCamera();
    setRewardData(null);
    setManualCode('');
    setCameraError('');
    setScannedData(null);
  };

  // Estados: Scanning, Validating, Complete
  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white border-2 border-green-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl text-blue-900 mb-2">Resgate Confirmado!</h2>
            <p className="text-blue-700">A vantagem foi utilizada com sucesso.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rewardData) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500">
          <div className="max-w-md mx-auto px-6 py-6">
            <h1 className="text-white mb-1">Validar Vantagem</h1>
            <p className="text-green-50">{storeName}</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6">
          <Card className="bg-white border-2 border-green-200 shadow-lg mb-6">
            <CardContent className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-blue-900">{rewardData.userName}</p>
                  <p className="text-sm text-blue-700 flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    {rewardData.userKeys} chaves disponíveis
                  </p>
                </div>
              </div>

              {/* Reward Info */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-blue-900 mb-1">{rewardData.rewardName}</p>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                      {rewardData.rewardValue}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Code */}
              <div className="flex items-center gap-2 text-sm text-blue-700 mb-4">
                <Clock className="w-4 h-4" />
                <p>Código: {rewardData.code}</p>
              </div>
            </CardContent>
          </Card>

          {cameraError && (
            <Alert className="mb-4 border-2 border-orange-300 bg-orange-50">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <AlertDescription className="text-blue-900">
                {cameraError}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmRedemption}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Resgate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (scanMode) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h2 className="text-white">Escanear QR Code</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScanMode(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-md aspect-square bg-black rounded-xl overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-green-400 rounded-lg"></div>
            </div>
          </div>

          {cameraError && (
            <Alert className="max-w-md bg-orange-50 border-2 border-orange-300 mb-4">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <AlertDescription className="text-blue-900">
                {cameraError}
              </AlertDescription>
            </Alert>
          )}

          <p className="text-white text-center">
            Posicione o QR code do resgate dentro do quadrado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500">
        <div className="max-w-md mx-auto px-6 py-6">
          <h1 className="text-white mb-1">Validar Vantagem</h1>
          <p className="text-green-50">{storeName}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Scan Button */}
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg h-16 mb-6"
          onClick={() => setScanMode(true)}
        >
          <Camera className="w-6 h-6 mr-3" />
          <span className="text-lg">Escanear QR Code do Usuário</span>
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-green-200"></div>
          <span className="text-sm text-blue-700">OU</span>
          <div className="flex-1 h-px bg-green-200"></div>
        </div>

        {/* Manual Input */}
        <Card className="bg-white border-2 border-green-100 shadow-sm mb-6">
          <CardContent className="p-4">
            <label className="text-sm text-blue-900 mb-2 block">
              Digite o código de resgate
            </label>
            <div className="flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ex: VTG-2024-ABC123"
                className="flex-1 border-2 border-green-200 focus:border-green-500"
              />
              <Button
                onClick={handleManualValidation}
                disabled={!manualCode.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Validar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link to History */}
        <div className="text-center">
          <button className="text-blue-700 hover:text-green-600 flex items-center gap-2 mx-auto">
            <FileText className="w-4 h-4" />
            Ver histórico de resgates
          </button>
        </div>
      </div>
    </div>
  );
}
