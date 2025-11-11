import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Database, Image, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface StorageSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StorageSetupGuide({ isOpen, onClose }: StorageSetupGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-purple-500/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white text-xl mb-2">Configuração do Supabase Storage</h2>
            <p className="text-purple-300 text-sm">
              Configure o armazenamento de imagens para ativar fotos de perfil
            </p>
          </div>

          {/* Alert */}
          <Alert className="bg-orange-600/20 border-orange-400/30">
            <AlertDescription className="text-orange-200">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="mb-1">Esta configuração precisa ser feita apenas uma vez!</p>
                  <p className="text-sm">Após configurar o Supabase Storage, você poderá fazer upload e salvar fotos de perfil.</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Passos */}
          <div className="space-y-4">
            <h3 className="text-white flex items-center gap-2">
              <span className="text-purple-400">📋</span>
              Passo a Passo
            </h3>

            {/* Passo 1 */}
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white mb-2">Acesse o Painel do Supabase</h4>
                    <p className="text-purple-200 text-sm mb-2">
                      Vá para{' '}
                      <a
                        href="https://app.supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        app.supabase.com
                      </a>
                      {' '}e selecione seu projeto
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passo 2 */}
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white mb-2">Criar Bucket de Storage</h4>
                    <ol className="text-purple-200 text-sm space-y-2 list-inside">
                      <li>• Clique em <strong className="text-white">Storage</strong> no menu lateral</li>
                      <li>• Clique em <strong className="text-white">New bucket</strong></li>
                      <li>• Nome: <code className="bg-gray-900/50 px-2 py-1 rounded text-cyan-400">circuito-jovem</code></li>
                      <li>• ✅ Marque <strong className="text-white">Public bucket</strong></li>
                      <li>• File size limit: <code className="bg-gray-900/50 px-2 py-1 rounded text-cyan-400">5242880</code> (5MB)</li>
                      <li>• Clique em <strong className="text-white">Create bucket</strong></li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passo 3 */}
            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white mb-2">Configurar Políticas de Acesso</h4>
                    <p className="text-purple-200 text-sm mb-2">
                      No bucket <strong className="text-white">circuito-jovem</strong>, vá para <strong className="text-white">Policies</strong> e crie 4 políticas:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-900/50 p-2 rounded">
                        <p className="text-cyan-400">1. Upload (INSERT) - authenticated</p>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded">
                        <p className="text-cyan-400">2. Visualização (SELECT) - public</p>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded">
                        <p className="text-cyan-400">3. Atualização (UPDATE) - authenticated</p>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded">
                        <p className="text-cyan-400">4. Exclusão (DELETE) - authenticated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentação Completa */}
          <Alert className="bg-cyan-600/20 border-cyan-400/30">
            <AlertDescription className="text-cyan-200">
              <div className="flex items-start gap-2">
                <span className="text-xl">📚</span>
                <div>
                  <p className="mb-1">Para instruções detalhadas com SQL queries:</p>
                  <p className="text-sm">Veja o arquivo <code className="bg-gray-900/50 px-2 py-1 rounded text-cyan-400">CONFIGURACAO_STORAGE.md</code></p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
            >
              Entendi! Vou Configurar
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-purple-500/20">
            <p className="text-purple-300 text-sm">
              💡 Após configurar, a foto de perfil será salva permanentemente no banco de dados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
