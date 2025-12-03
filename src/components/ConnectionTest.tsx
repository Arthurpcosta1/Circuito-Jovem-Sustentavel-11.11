import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle2, XCircle, Wifi } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export const ConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    healthCheck?: boolean;
    serverUrl?: string;
    error?: string;
  }>({});

  const testConnection = async () => {
    setTesting(true);
    setResult({});

    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7af4432d`;
    
    try {
      // Test health endpoint
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          healthCheck: true,
          serverUrl,
        });
      } else {
        const text = await response.text();
        setResult({
          healthCheck: false,
          serverUrl,
          error: `Status ${response.status}: ${text.substring(0, 100)}`,
        });
      }
    } catch (error) {
      setResult({
        healthCheck: false,
        serverUrl,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          Teste de Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-purple-200 text-sm">
            <strong>Project ID:</strong> {projectId}
          </div>
          <div className="text-purple-200 text-sm break-all">
            <strong>API Key:</strong> {publicAnonKey.substring(0, 20)}...
          </div>
        </div>

        <Button
          onClick={testConnection}
          disabled={testing}
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-500"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            'Testar Conexão'
          )}
        </Button>

        {result.serverUrl && (
          <div className="space-y-2 p-4 bg-black/30 rounded">
            <div className="flex items-center justify-between">
              <span className="text-purple-200 text-sm">Health Check:</span>
              {result.healthCheck ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  OK
                </Badge>
              ) : (
                <Badge className="bg-red-500">
                  <XCircle className="w-3 h-3 mr-1" />
                  Falhou
                </Badge>
              )}
            </div>

            {result.error && (
              <div className="text-red-300 text-xs break-words">
                <strong>Erro:</strong> {result.error}
              </div>
            )}

            <div className="text-purple-300 text-xs break-all">
              <strong>URL:</strong> {result.serverUrl}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
