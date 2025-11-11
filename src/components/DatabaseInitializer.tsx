import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Database, Check, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { DatabaseStats } from './DatabaseStats';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7af4432d`;

export function DatabaseInitializer() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('init');

  const initializeDatabase = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao inicializar banco de dados');
      }

      const data = await response.json();
      setStats(data.stats);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-300" />
            <CardTitle className="text-purple-100">Banco de Dados - Apresentação</CardTitle>
          </div>
          <CardDescription className="text-purple-200/70">
            Gestão e visualização do banco de dados para apresentação acadêmica
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-purple-900/40">
          <TabsTrigger value="init" className="data-[state=active]:bg-purple-600">
            <Database className="w-4 h-4 mr-2" />
            Inicializar
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="init" className="mt-4">
          <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-purple-100 text-lg">Inicializar Dados de Exemplo</CardTitle>
              <CardDescription className="text-purple-200/70">
                Popula o banco com estações, vantagens e instituições de Recife
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!success && !error && (
                <Button
                  onClick={initializeDatabase}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Inicializando...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Inicializar Banco de Dados
                    </>
                  )}
                </Button>
              )}

              {success && stats && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>Banco de dados inicializado com sucesso!</span>
                  </div>
                  
                  <div className="bg-purple-950/50 rounded-lg p-4 space-y-2">
                    <div className="text-purple-200">
                      <span className="text-purple-400">• Instituições criadas:</span> {stats.institutions}
                    </div>
                    <div className="text-purple-200">
                      <span className="text-purple-400">• Estações criadas:</span> {stats.stations}
                    </div>
                    <div className="text-purple-200">
                      <span className="text-purple-400">• Vantagens criadas:</span> {stats.rewards}
                    </div>
                  </div>

                  <div className="text-sm text-purple-300/70 pt-2 border-t border-purple-500/20">
                    ✓ Você agora pode explorar o app com dados de exemplo
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-red-400 bg-red-950/30 p-3 rounded">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Erro ao inicializar:</p>
                    <p className="text-sm text-red-300/70">{error}</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-purple-300/50 space-y-1 pt-2 border-t border-purple-500/20">
                <p><strong>Nota:</strong> Este processo cria dados de exemplo que incluem:</p>
                <ul className="list-disc list-inside pl-2 space-y-0.5">
                  <li>Estações de coleta em Recife (UFPE, UNICAP, etc)</li>
                  <li>Vantagens de comércios locais</li>
                  <li>Instituições parceiras</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <DatabaseStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
