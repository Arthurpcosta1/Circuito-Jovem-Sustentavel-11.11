import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react';
import { uploadProfileImage } from '../utils/profileImage';
import { auth } from '../utils/api';

/**
 * Componente de teste para validar upload de fotos
 * Use este componente para testar se o Supabase Storage está configurado corretamente
 */
export function PhotoUploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setErrorMessage('');
      setUploadedUrl('');
    }
  };

  const handleTestUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Por favor, selecione uma imagem primeiro');
      return;
    }

    const currentUser = auth.getCurrentUser();
    if (!currentUser?.id) {
      setErrorMessage('Usuário não encontrado. Faça login primeiro.');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const url = await uploadProfileImage(selectedFile, currentUser.id);
      
      if (url) {
        setUploadedUrl(url);
        setUploadStatus('success');
      } else {
        setErrorMessage('Falha no upload - verifique a configuração do Storage');
        setUploadStatus('error');
      }
    } catch (error: any) {
      console.error('Erro no teste de upload:', error);
      
      // Analisar o tipo de erro
      if (error.message?.includes('mime type')) {
        setErrorMessage('ERRO: MIME type não suportado. Solução: Vá no Supabase > Storage > circuito-jovem > Edit bucket > Apague o campo "Allowed MIME types" > Save');
      } else if (error.message?.includes('not found')) {
        setErrorMessage('ERRO: Bucket não encontrado. Crie o bucket "circuito-jovem" no Supabase Storage.');
      } else if (error.message?.includes('policy')) {
        setErrorMessage('ERRO: Política RLS bloqueou o upload. Configure as políticas de acesso no Storage.');
      } else {
        setErrorMessage(`ERRO: ${error.message || 'Erro desconhecido'}`);
      }
      
      setUploadStatus('error');
    }
  };

  return (
    <Card className="bg-gray-900 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-400" />
          Teste de Upload de Foto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-600/20 border-blue-400/30">
          <AlertDescription className="text-blue-200 text-sm">
            Use este componente para testar se o Supabase Storage está configurado corretamente.
            Veja o arquivo <code className="bg-gray-800 px-1 rounded">CORRECAO_ERROS_URGENTE.md</code> para instruções.
          </AlertDescription>
        </Alert>

        {/* Seletor de arquivo */}
        <div className="space-y-2">
          <label className="text-purple-200 text-sm block">
            Selecione uma imagem para testar:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-purple-300
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:bg-purple-600 file:text-white
              hover:file:bg-purple-700
              file:cursor-pointer cursor-pointer
              bg-gray-800 border border-purple-500/30 rounded p-2"
          />
          {selectedFile && (
            <p className="text-sm text-gray-400">
              Arquivo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Botão de teste */}
        <Button
          onClick={handleTestUpload}
          disabled={!selectedFile || uploadStatus === 'uploading'}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white disabled:opacity-50"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-pulse" />
              Testando Upload...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Testar Upload
            </>
          )}
        </Button>

        {/* Status do upload */}
        {uploadStatus === 'success' && (
          <Alert className="bg-green-600/20 border-green-400/30">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <AlertDescription className="text-green-200">
              <div className="space-y-2">
                <p className="font-bold">✅ Upload realizado com sucesso!</p>
                <p className="text-sm">O Supabase Storage está configurado corretamente.</p>
                {uploadedUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-green-300 mb-1">URL da imagem:</p>
                    <code className="block bg-gray-800 p-2 rounded text-xs break-all">
                      {uploadedUrl}
                    </code>
                    <img 
                      src={uploadedUrl} 
                      alt="Preview" 
                      className="mt-2 max-w-full h-32 object-cover rounded border border-green-400/30"
                    />
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'error' && (
          <Alert className="bg-red-600/20 border-red-400/30">
            <XCircle className="w-5 h-5 text-red-400" />
            <AlertDescription className="text-red-200">
              <div className="space-y-2">
                <p className="font-bold">❌ Erro no upload</p>
                <p className="text-sm">{errorMessage}</p>
                <div className="mt-3 p-3 bg-gray-800 rounded">
                  <p className="text-xs font-bold text-red-300 mb-2">Como resolver:</p>
                  <ol className="text-xs space-y-1 list-decimal list-inside text-gray-300">
                    <li>Acesse o Supabase: https://app.supabase.com</li>
                    <li>Vá em Storage {">"} circuito-jovem</li>
                    <li>Clique nos 3 pontos {">"} Edit bucket</li>
                    <li>Apague o campo "Allowed MIME types"</li>
                    <li>Salve e teste novamente</li>
                  </ol>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações adicionais */}
        <div className="bg-gray-800/50 border border-purple-500/20 rounded p-3">
          <p className="text-xs text-purple-200 mb-2">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Informações do teste:
          </p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Usuário ID: {auth.getCurrentUser()?.id || 'Não logado'}</li>
            <li>• Bucket: circuito-jovem</li>
            <li>• Pasta: profile-images/</li>
            <li>• Tamanho máximo: 5MB</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
