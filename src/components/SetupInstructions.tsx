import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Database, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  AlertTriangle,
  ArrowRight,
  FileText
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';

export const SetupInstructions: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const supabaseDashboard = `https://supabase.com/dashboard/project/${projectId}/sql/new`;

  const handleCopySQL = async () => {
    try {
      // Copiar o conteúdo do arquivo SETUP_AUTOMATICO.sql
      const response = await fetch('/SETUP_AUTOMATICO.sql');
      const sql = await response.text();
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar SQL:', error);
      // Fallback: tentar copiar do endpoint do servidor
      try {
        const sqlSetupUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7af4432d/setup-sql`;
        const response = await fetch(sqlSetupUrl);
        const sql = await response.text();
        await navigator.clipboard.writeText(sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
    }
  };

  const handleOpenDashboard = () => {
    window.open(supabaseDashboard, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-3xl"></div>
      
      <div className="relative w-full max-w-2xl">
        <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Setup do Banco de Dados</CardTitle>
                <p className="text-purple-200 text-sm mt-1">Configure o PostgreSQL no Supabase</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="bg-yellow-900/20 border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200 ml-2">
                <strong>Ação Necessária:</strong> As tabelas do banco de dados precisam ser criadas manualmente no painel do Supabase.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-200">
                <Badge className="bg-purple-500">Passo 1</Badge>
                <span>Abra o Painel do Supabase</span>
              </div>
              <Button
                onClick={handleOpenDashboard}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 justify-between"
              >
                Abrir Supabase Dashboard
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="h-px bg-purple-300/20"></div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-200">
                <Badge className="bg-purple-500">Passo 2</Badge>
                <span>Copie o SQL de Configuração</span>
              </div>
              <Button
                onClick={handleCopySQL}
                className="w-full bg-white/10 hover:bg-white/20 border border-purple-300/30 justify-between"
              >
                {copied ? (
                  <>
                    <span className="text-green-300">SQL Copiado!</span>
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                  </>
                ) : (
                  <>
                    <span className="text-white">Copiar SQL para Clipboard</span>
                    <Copy className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="h-px bg-purple-300/20"></div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-200">
                <Badge className="bg-purple-500">Passo 3</Badge>
                <span>Execute o SQL no Editor</span>
              </div>
              <div className="bg-black/30 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2 text-purple-200 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>No painel do Supabase, clique em <strong className="text-white">"SQL Editor"</strong> no menu lateral</span>
                </div>
                <div className="flex items-start gap-2 text-purple-200 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Clique em <strong className="text-white">"New query"</strong></span>
                </div>
                <div className="flex items-start gap-2 text-purple-200 text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Cole o SQL copiado e clique em <strong className="text-white">"Run"</strong> (ou Ctrl+Enter)</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-purple-300/20"></div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-200">
                <Badge className="bg-purple-500">Passo 4</Badge>
                <span>Verifique a Criação</span>
              </div>
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-2 text-green-200 text-sm">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-400" />
                  <div>
                    <p>Você deverá ver uma mensagem de confirmação com:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                      <li>2 instituições criadas</li>
                      <li>2 estações de coleta</li>
                      <li>3 comércios parceiros</li>
                      <li>3 vantagens disponíveis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-purple-300/20"></div>

            <div className="bg-purple-900/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-4 h-4" />
                <strong>Documentação Completa</strong>
              </div>
              <p className="text-purple-200 text-sm">
                Para mais detalhes sobre o MER e a estrutura do banco, consulte os arquivos:
              </p>
              <ul className="text-purple-300 text-sm space-y-1 ml-4">
                <li>• <code className="bg-black/30 px-2 py-0.5 rounded">SETUP_AUTOMATICO.sql</code> - SQL de configuração</li>
                <li>• <code className="bg-black/30 px-2 py-0.5 rounded">COMO_USAR.md</code> - Guia completo</li>
                <li>• <code className="bg-black/30 px-2 py-0.5 rounded">DATABASE_DOCUMENTATION.md</code> - Documentação técnica</li>
              </ul>
            </div>

            <div className="pt-4 text-center">
              <p className="text-purple-300 text-xs">
                Após executar o SQL, recarregue a página e tente criar sua conta novamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
