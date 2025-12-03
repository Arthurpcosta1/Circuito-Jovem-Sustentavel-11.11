import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, Database, Image } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export function StorageConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connected: boolean | null;
    bucketExists: boolean | null;
    canUpload: boolean | null;
    canUploadImage: boolean | null;
    errorDetails: string | null;
  }>({
    connected: null,
    bucketExists: null,
    canUpload: null,
    canUploadImage: null,
    errorDetails: null
  });

  const testConnection = async () => {
    setTesting(true);
    const newResults = {
      connected: false,
      bucketExists: false,
      canUpload: false,
      canUploadImage: false,
      errorDetails: null as string | null
    };

    try {
      const supabase = createClient();

      // Teste 1: Conexão com Supabase
      try {
        const { data, error } = await supabase.from('usuarios').select('count').limit(1);
        newResults.connected = !error;
      } catch (error) {
        newResults.connected = false;
      }

      // Teste 2: Verificar se o bucket existe
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (!error && buckets) {
          newResults.bucketExists = buckets.some(b => b.name === 'circuito-jovem');
        }
      } catch (error) {
        console.error('Erro ao verificar bucket:', error);
        newResults.bucketExists = false;
      }

      // Teste 3: Testar upload de texto (criar arquivo temporário pequeno)
      if (newResults.bucketExists) {
        try {
          const testBlob = new Blob(['test'], { type: 'text/plain' });
          const testFile = new File([testBlob], 'test.txt');
          const testPath = `test-uploads/test-${Date.now()}.txt`;

          const { error: uploadError } = await supabase.storage
            .from('circuito-jovem')
            .upload(testPath, testFile, { upsert: true });

          newResults.canUpload = !uploadError;

          // Limpar arquivo de teste
          if (!uploadError) {
            await supabase.storage
              .from('circuito-jovem')
              .remove([testPath]);
          }
        } catch (error) {
          console.error('Erro ao testar upload:', error);
          newResults.canUpload = false;
        }
      }

      // Teste 4: Testar upload de IMAGEM (detectar erro de MIME type)
      if (newResults.bucketExists) {
        try {
          // Criar uma imagem de teste 1x1 pixel JPEG
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 1, 1);
          }

          await new Promise<void>((resolve, reject) => {
            canvas.toBlob(async (blob) => {
              if (!blob) {
                reject(new Error('Falha ao criar blob'));
                return;
              }

              const testImageFile = new File([blob], 'test.jpg', { type: 'image/jpeg' });
              const testImagePath = `test-uploads/test-image-${Date.now()}.jpg`;

              const { error: imageUploadError } = await supabase.storage
                .from('circuito-jovem')
                .upload(testImagePath, testImageFile, { upsert: true });

              if (imageUploadError) {
                console.error('Erro ao testar upload de imagem:', imageUploadError);
                
                // Detectar erro de MIME type específico
                if (imageUploadError.message?.includes('mime type') || imageUploadError.message?.includes('not supported')) {
                  newResults.errorDetails = '🔴 ERRO DE MIME TYPE DETECTADO: O bucket está bloqueando imagens JPEG. Vá no Supabase > Storage > circuito-jovem > Edit bucket > APAGUE o campo "Allowed MIME types" > Save';
                }
                
                newResults.canUploadImage = false;
              } else {
                newResults.canUploadImage = true;
                // Limpar imagem de teste
                await supabase.storage
                  .from('circuito-jovem')
                  .remove([testImagePath]);
              }

              resolve();
            }, 'image/jpeg', 0.95);
          });
        } catch (error: any) {
          console.error('Erro ao testar upload de imagem:', error);
          newResults.canUploadImage = false;
          
          if (error.message?.includes('mime type')) {
            newResults.errorDetails = '🔴 ERRO DE MIME TYPE: Configure o bucket corretamente';
          }
        }
      }

      setResults(newResults);

      // Mostrar resultado
      if (newResults.connected && newResults.bucketExists && newResults.canUpload && newResults.canUploadImage) {
        toast.success('✅ Supabase Storage configurado corretamente!');
      } else if (newResults.errorDetails) {
        toast.error('❌ Erro de MIME type detectado!');
      } else {
        toast.error('❌ Há problemas na configuração. Veja os detalhes.');
      }
    } catch (error) {
      console.error('Erro geral no teste:', error);
      toast.error('Erro ao testar conexão');
    } finally {
      setTesting(false);
    }
  };

  const renderStatus = (status: boolean | null, label: string) => {
    if (status === null) {
      return (
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
          <span>{label}</span>
        </div>
      );
    }

    if (status) {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span>{label}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-red-400">
        <XCircle className="w-5 h-5" />
        <span>{label}</span>
      </div>
    );
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="text-white">Teste de Conexão - Storage</h3>
        </div>

        <Alert className="bg-cyan-600/20 border-cyan-400/30 mb-4">
          <AlertDescription className="text-cyan-200 text-sm">
            <p>Este teste verifica se o Supabase Storage está configurado corretamente para fotos de perfil.</p>
          </AlertDescription>
        </Alert>

        <div className="space-y-3 mb-6">
          {renderStatus(results.connected, 'Conexão com Supabase')}
          {renderStatus(results.bucketExists, 'Bucket "circuito-jovem" existe')}
          {renderStatus(results.canUpload, 'Permissões de upload (arquivos)')}
          {renderStatus(results.canUploadImage, 'Upload de imagens JPEG/PNG')}
        </div>

        <Button
          onClick={testConnection}
          disabled={testing}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Testar Configuração
            </>
          )}
        </Button>

        {results.errorDetails && (
          <Alert className="bg-red-600/20 border-red-400/30 mt-4">
            <AlertDescription className="text-red-200 text-sm">
              <p className="mb-3">{results.errorDetails}</p>
              <div className="bg-gray-900/50 p-3 rounded space-y-1">
                <p className="text-xs font-bold">Solução rápida:</p>
                <ol className="text-xs list-decimal list-inside space-y-1">
                  <li>Acesse: https://app.supabase.com</li>
                  <li>Storage → circuito-jovem</li>
                  <li>Clique em ⋮ → Edit bucket</li>
                  <li>APAGUE o campo "Allowed MIME types"</li>
                  <li>Save</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {results.connected !== null && (!results.connected || !results.bucketExists || !results.canUpload || !results.canUploadImage) && !results.errorDetails && (
          <Alert className="bg-red-600/20 border-red-400/30 mt-4">
            <AlertDescription className="text-red-200 text-sm">
              <p className="mb-2">⚠️ Configuração incompleta. Veja o arquivo <code className="bg-gray-900/50 px-2 py-1 rounded">CORRECAO_ERROS_URGENTE.md</code></p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}