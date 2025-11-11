import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Recycle, Key, Gift } from 'lucide-react';

interface QuickTutorialProps {
  onClose: () => void;
}

export function QuickTutorial({ onClose }: QuickTutorialProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-purple-400/30 max-w-md w-full backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl text-white mb-1">Como funciona? 🚀</h2>
              <p className="text-sm text-purple-200">É simples e rápido</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-purple-200 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">1. Recicle</h3>
                <p className="text-sm text-purple-200">
                  Encontre uma estação de coleta próxima e recicle seus materiais
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">2. Ganhe Chaves</h3>
                <p className="text-sm text-purple-200">
                  Cada reciclagem rende Chaves de Impacto que desbloqueiam níveis
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">3. Resgate Benefícios</h3>
                <p className="text-sm text-purple-200">
                  Use suas chaves para desbloquear benefícios exclusivos em Recife
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-purple-400/20">
            <Button
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
              onClick={onClose}
            >
              Começar a Reciclar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
