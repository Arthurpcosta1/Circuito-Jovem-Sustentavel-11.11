import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Mail, Lock, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '../utils/api';

interface LoginProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
  onShowSetup?: () => void;
  onForgotPassword?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, onShowSetup, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await auth.signIn(email, password);
      onLogin();
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      
      // Se o erro for sobre tabela não encontrada, mostrar instruções de setup
      if (errorMessage.includes('table') || errorMessage.includes('usuarios')) {
        if (onShowSetup) {
          setTimeout(() => onShowSetup(), 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center p-4">
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-3xl"></div>
      
      <div className="relative w-full max-w-md">
        {/* App Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Circuito Jovem</h1>
          <p className="text-purple-200">Sustentável & Tech</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Entrar na sua conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-purple-200 text-sm">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-purple-200 text-sm">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="pl-10 pr-10 bg-white/10 border-purple-300/30 text-white placeholder:text-purple-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/30 p-3 rounded text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-purple-200 text-sm">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-cyan-300 hover:text-cyan-200 underline"
                  >
                    Criar conta
                  </button>
                </p>
                {onForgotPassword && (
                  <p className="text-purple-200 text-sm">
                    Esqueceu a senha?{' '}
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-cyan-300 hover:text-cyan-200 underline"
                    >
                      Recuperar senha
                    </button>
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-purple-300 text-xs">
            Conectando jovens com sustentabilidade através da tecnologia
          </p>
        </div>
      </div>
    </div>
  );
};