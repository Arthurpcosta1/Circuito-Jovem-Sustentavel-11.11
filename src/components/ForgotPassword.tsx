import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { auth } from '../utils/api';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await auth.resetPassword(email);
      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email de recuperação';
      setError(errorMessage);
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
          <p className="text-purple-200">Recuperação de Senha</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-purple-300/20">
          <CardHeader>
            <button
              onClick={onBackToLogin}
              className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </button>
            <CardTitle className="text-white text-center">Esqueci minha senha</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white font-semibold">Email enviado!</h3>
                <p className="text-purple-200 text-sm">
                  Se o email <span className="text-cyan-300">{email || 'informado'}</span> estiver cadastrado,
                  você receberá um link para redefinir sua senha.
                </p>
                <p className="text-purple-300 text-xs">
                  Não esqueça de verificar sua pasta de spam ou lixo eletrônico.
                </p>
                <Button
                  onClick={onBackToLogin}
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                >
                  Voltar para login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-3 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <p className="text-purple-200 text-sm">
                    Digite seu email cadastrado. Enviaremos um link para você criar uma nova senha.
                  </p>
                </div>

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
                      Enviando...
                    </>
                  ) : (
                    'Enviar link de recuperação'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-purple-300 text-xs">
            Lembrou da senha?{' '}
            <button
              onClick={onBackToLogin}
              className="text-cyan-300 hover:text-cyan-200 underline"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
