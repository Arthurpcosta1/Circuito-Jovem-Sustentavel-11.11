import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { QrCode, Scan, Check, X, User, Scale, Package, Camera, AlertCircle, Shield } from 'lucide-react';
import { validarTokenQRCode } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface CollectionData {
  userId: string;
  userName: string;
  userLevel: string;
  weight: string;
  materialType: string;
  keysToAward: number;
}

export function AmbassadorValidation() {
  const [scanMode, setScanMode] = useState(false);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [weight, setWeight] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Mock user data - será substituído pelos dados reais do QR code
  const [scannedUserData, setScannedUserData] = useState<any>(null);

  const materialTypes = [
    { value: 'papel', label: 'Papel', keysPerKg: 2 },
    { value: 'plastico', label: 'Plástico', keysPerKg: 3 },
    { value: 'metal', label: 'Metal', keysPerKg: 5 },
    { value: 'vidro', label: 'Vidro', keysPerKg: 4 },
    { value: 'eletronico', label: 'Eletrônico', keysPerKg: 10 }
  ];

  const calculateKeys = (weightStr: string, material: string): number => {
    const weightNum = parseFloat(weightStr) || 0;
    const materialData = materialTypes.find(m => m.value === material);
    return Math.floor(weightNum * (materialData?.keysPerKg || 0));
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setScanMode(true);
    
    try {
      // Pedir permissão para câmera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usar câmera traseira em dispositivos móveis
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Começar a escanear após o vídeo estar pronto
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      if (error.name === 'NotAllowedError') {
        setCameraError('⚠️ Permissão de câmera negada.\n\n📱 Como permitir:\n\n1. Clique no ícone 🔒 ou ⓘ na barra de endereços (ao lado da URL)\n\n2. Procure por "Câmera" e mude para "Permitir"\n\n3. Recarregue esta página\n\nOu use o código manual abaixo! 👇');
      } else if (error.name === 'NotFoundError') {
        setCameraError('Nenhuma câmera encontrada no dispositivo. Use o código manual abaixo.');
      } else {
        setCameraError('Erro ao acessar a câmera. Use o código manual abaixo.');
      }
      setScanMode(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScanMode(false);
  };

  const startScanning = () => {
    // Carregar biblioteca jsQR dinamicamente
    if (!(window as any).jsQR) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.onload = () => {
        scanQRCode();
      };
      document.head.appendChild(script);
    } else {
      scanQRCode();
    }
  };

  const scanQRCode = () => {
    const jsQR = (window as any).jsQR;
    if (!jsQR || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Configurar tamanho do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Tentar escanear QR code a cada 300ms
    scanIntervalRef.current = window.setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // QR Code encontrado!
          handleQRCodeDetected(code.data);
          stopCamera();
        }
      }
    }, 300);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    console.log('🔍 QR Code detectado, validando...');
    
    // Mostrar loading
    setIsProcessing(true);
    
    try {
      // Validar token no servidor
      const response = await validarTokenQRCode(qrData);
      
      if (!response.success || !response.usuario) {
        throw new Error(response.error || 'QR Code inválido ou expirado');
      }

      const userData = response.usuario;
      console.log('✅ QR Code válido:', userData);
      
      // Toast de sucesso
      toast.success(`QR Code validado! Usuário: ${userData.nome}`);
      
      setScannedUserData(userData);
      setCollectionData({
        userId: userData.id,
        userName: userData.nome,
        userLevel: userData.nivel ? `Nível ${userData.nivel}` : 'Nível 1',
        weight: '',
        materialType: '',
        keysToAward: 0
      });
    } catch (error: any) {
      console.error('❌ Erro ao validar QR Code:', error);
      
      // Toast de erro
      toast.error(error.message || 'QR Code inválido ou expirado');
      
      setCameraError(
        error.message.includes('expirado') 
          ? '⏰ QR Code expirado!\n\nPeça ao usuário para gerar um novo QR Code no perfil dele.' 
          : '❌ QR Code inválido!\n\nPor favor, certifique-se de que o usuário está usando o QR Code gerado no perfil do app Circuito Jovem.'
      );
      setScanMode(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRScan = () => {
    startCamera();
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    if (collectionData && materialType) {
      const keys = calculateKeys(value, materialType);
      setCollectionData({
        ...collectionData,
        weight: value,
        keysToAward: keys
      });
    }
  };

  const handleMaterialChange = (value: string) => {
    setMaterialType(value);
    if (collectionData && weight) {
      const keys = calculateKeys(weight, value);
      setCollectionData({
        ...collectionData,
        materialType: value,
        keysToAward: keys
      });
    }
  };

  const handleConfirmCollection = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🔵 Enviando coleta para validação...');
      
      // Fazer chamada real à API
      const response = await fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || 'ieyqcvafbylfnzzjrvvd'}.supabase.co/functions/v1/make-server-7af4432d/coletas/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify({
          usuario_id: collectionData?.userId,
          estacao_id: 'estacao-default-recife', // TODO: Usar estação real do embaixador
          peso_kg: parseFloat(weight),
          material_tipo: materialType,
          embaixador_id: null, // TODO: Usar ID real do embaixador
          observacoes: `Validado via QR Code - ${new Date().toLocaleString('pt-BR')}`
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao validar coleta');
      }

      console.log('✅ Coleta validada:', data);
      
      setIsProcessing(false);
      setIsComplete(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsComplete(false);
        setCollectionData(null);
        setScannedUserData(null);
        setWeight('');
        setMaterialType('');
      }, 3000);
    } catch (error) {
      console.error('❌ Erro ao confirmar coleta:', error);
      setIsProcessing(false);
      setCameraError(error instanceof Error ? error.message : 'Erro ao processar a coleta. Tente novamente.');
    }
  };

  const handleCancel = () => {
    stopCamera();
    setCollectionData(null);
    setScannedUserData(null);
    setWeight('');
    setMaterialType('');
    setCameraError('');
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <Card className="border-cyan-400/30 bg-white/10 backdrop-blur">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg text-white mb-2">Coleta Registrada!</h3>
              <p className="text-cyan-300 mb-4">
                {collectionData?.keysToAward} Chaves de Impacto enviadas para {collectionData?.userName}
              </p>
              <div className="text-sm text-purple-300">
                Retornando ao painel...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900/20 rounded-full flex items-center justify-center">
              <QrCode className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h1 className="text-lg text-gray-900">Validação de Coleta</h1>
              <p className="text-gray-800 text-sm">Painel do Embaixador</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {!collectionData ? (
          /* QR Scanner Interface */
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur border-purple-300/20">
              <CardContent className="p-8 text-center">
                {scanMode ? (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-square max-w-sm mx-auto bg-black rounded-xl overflow-hidden">
                      <video 
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      <canvas 
                        ref={canvasRef}
                        className="hidden"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 border-2 border-cyan-400 rounded-xl">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-cyan-400 animate-pulse flex items-center justify-center gap-2">
                      <Camera className="w-4 h-4" />
                      Posicione o QR code no quadrado
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full border-purple-300/30 text-purple-200 hover:bg-purple-600/20"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-32 h-32 mx-auto mb-6 rounded-xl border-2 border-dashed border-purple-300/30 bg-white/5 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-purple-400" />
                    </div>
                    
                    <h3 className="text-white mb-2">Escanear QR Code do Usuário</h3>
                    <p className="text-sm text-purple-200 mb-6">
                      Posicione o código QR do usuário na frente da câmera
                    </p>
                    
                    {cameraError && (
                      <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                        <div className="flex items-start gap-3 text-left">
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-300 whitespace-pre-line">{cameraError}</p>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                      onClick={handleQRScan}
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Iniciar Escaneamento
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-purple-300/20">
              <CardContent className="p-6">
                <h4 className="text-white mb-3">Instruções</h4>
                <div className="space-y-2 text-sm text-purple-200">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
                    <span>Peça para o usuário mostrar o QR Code do perfil</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
                    <span>Escaneie o código usando o botão acima</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
                    <span>Pese o material e registre o tipo</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</span>
                    <span>Confirme para enviar as Chaves de Impacto</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Collection Form */
          <div className="space-y-6">
            {/* User Info */}
            <Card className="border-cyan-400/30 bg-white/10 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white">{collectionData.userName}</h3>
                    <Badge variant="outline" className="text-xs border-cyan-400/30 text-cyan-300 bg-cyan-500/10">
                      {collectionData.userLevel}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCancel} className="border-purple-300/30 text-purple-200 hover:bg-purple-600/20">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Collection Form */}
            <Card className="bg-white/10 backdrop-blur border-purple-300/20">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-white">Dados da Coleta</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-purple-200">Peso do Material (kg)</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={weight}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      className="pl-10 bg-white/5 border-purple-300/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material" className="text-purple-200">Tipo de Material</Label>
                  <Select value={materialType} onValueChange={handleMaterialChange}>
                    <SelectTrigger className="bg-white/5 border-purple-300/30 text-white">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-400" />
                        <SelectValue placeholder="Selecione o material" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes.map((material) => (
                        <SelectItem key={material.value} value={material.value}>
                          <div className="flex justify-between items-center w-full">
                            <span>{material.label}</span>
                            <span className="text-xs text-cyan-400 ml-4">
                              {material.keysPerKg} chaves/kg
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {weight && materialType && (
                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-300">Chaves de Impacto a conceder:</span>
                      <Badge className="bg-cyan-600 text-white">
                        {collectionData.keysToAward} chaves
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 border-purple-300/30 text-purple-200 hover:bg-purple-600/20"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                onClick={handleConfirmCollection}
                disabled={!weight || !materialType || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar e Enviar Chaves
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 mt-6">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-900">Obrigado por ser Embaixador! 👑</p>
            <p className="text-xs text-gray-800 mt-1">Você está fazendo a diferença no Circuito</p>
          </div>
        </div>
      </div>
    </div>
  );
}