import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { Gift, Lock, QrCode, Coffee, Book, Film, Utensils, Gamepad2, Dumbbell, Award } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  partner: string;
  category: 'comida' | 'lazer' | 'cultura' | 'fitness' | 'outros';
  requiredLevel: string;
  levelNumber: number;
  description: string;
  isUnlocked: boolean;
  icon: React.ReactNode;
}

export function RewardsMap() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const rewards: Reward[] = [
    {
      id: '1',
      title: 'Compre 1, Leve 2 na Cantina',
      partner: 'UNINASSAU Graças',
      category: 'comida',
      requiredLevel: 'Guardião Ambiental',
      levelNumber: 3,
      description: 'Válido para lanches e bebidas selecionados',
      isUnlocked: true,
      icon: <Coffee className="w-5 h-5" />
    },
    {
      id: '2',
      title: 'Impressões ou Cópias Gratuitas',
      partner: 'Setor Acadêmico UNINASSAU',
      category: 'cultura',
      requiredLevel: 'Protetor da Natureza',
      levelNumber: 2,
      description: 'Válido para trabalhos acadêmicos e atividades do curso',
      isUnlocked: true,
      icon: <Book className="w-5 h-5" />
    },
    {
      id: '3',
      title: 'Vale Alimentação R$ 50,00',
      partner: 'Supermercado São José',
      category: 'comida',
      requiredLevel: 'Guardião Ambiental',
      levelNumber: 3,
      description: 'Crédito para compras no supermercado',
      isUnlocked: true,
      icon: <Utensils className="w-5 h-5" />
    },
    {
      id: '4',
      title: 'Combo Almoço Completo',
      partner: 'Restaurante Universitário',
      category: 'comida',
      requiredLevel: 'Eco Herói',
      levelNumber: 4,
      description: 'Refeição completa com sobremesa incluída',
      isUnlocked: false,
      icon: <Utensils className="w-5 h-5" />
    },
    {
      id: '5',
      title: 'Ingresso Cinema RioMar',
      partner: 'Cinépolis RioMar Recife',
      category: 'lazer',
      requiredLevel: 'Eco Herói',
      levelNumber: 4,
      description: 'Ingresso para qualquer sessão + combo pipoca',
      isUnlocked: false,
      icon: <Film className="w-5 h-5" />
    },
    {
      id: '6',
      title: 'Mensalidade Grátis Academia',
      partner: 'Academia UNINASSAU Graças',
      category: 'fitness',
      requiredLevel: 'Eco Mestre',
      levelNumber: 5,
      description: '1 mês de acesso total à academia da universidade',
      isUnlocked: false,
      icon: <Dumbbell className="w-5 h-5" />
    },
    {
      id: '7',
      title: 'Vale Lanche R$ 15,00',
      partner: 'Lanchonete Campus',
      category: 'comida',
      requiredLevel: 'Protetor da Natureza',
      levelNumber: 2,
      description: 'Crédito para usar em qualquer item da lanchonete',
      isUnlocked: true,
      icon: <Coffee className="w-5 h-5" />
    },
    {
      id: '8',
      title: 'Desconto Material Didático',
      partner: 'Livraria Universitária',
      category: 'cultura',
      requiredLevel: 'Eco Herói',
      levelNumber: 4,
      description: '15% de desconto em livros e materiais',
      isUnlocked: false,
      icon: <Book className="w-5 h-5" />
    }
  ];

  const categories = [
    { id: 'todos', label: 'Todos', count: rewards.length },
    { id: 'comida', label: 'Comida', count: rewards.filter(r => r.category === 'comida').length },
    { id: 'lazer', label: 'Lazer', count: rewards.filter(r => r.category === 'lazer').length },
    { id: 'cultura', label: 'Cultura', count: rewards.filter(r => r.category === 'cultura').length },
    { id: 'fitness', label: 'Fitness', count: rewards.filter(r => r.category === 'fitness').length }
  ];

  const filteredRewards = selectedCategory === 'todos' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  const handleRedeemReward = (rewardId: string) => {
    // Here would be the logic to generate QR code for validation
    alert('QR Code gerado! Apresente no estabelecimento parceiro.');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-900/20 backdrop-blur rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-xl text-gray-900">Benefícios</h1>
              <p className="text-gray-800 text-sm">Resgate suas vantagens</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Category Filters - Simplified */}
        <div className="bg-gray-800/50 border-b border-purple-300/20">
          <div className="px-6 py-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap ${
                    selectedCategory === category.id 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'border-purple-300/30 text-purple-200 hover:bg-purple-600/20'
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="p-6">
          <div className="grid gap-4">
            {filteredRewards.map((reward) => (
              <Card 
                key={reward.id} 
                className={`border transition-all duration-200 hover:shadow-lg ${
                  reward.isUnlocked 
                    ? 'border-cyan-400/30 bg-white/5 backdrop-blur hover:bg-white/10' 
                    : 'border-purple-300/20 bg-white/5 backdrop-blur opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Reward Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      reward.isUnlocked 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' 
                        : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                    }`}>
                      {reward.isUnlocked ? reward.icon : <Lock className="w-5 h-5" />}
                    </div>
                    
                    {/* Reward Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-sm ${
                          reward.isUnlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {reward.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${
                            reward.isUnlocked 
                              ? 'border-cyan-400/30 text-cyan-300 bg-cyan-500/10'
                              : 'border-gray-600/30 text-gray-500 bg-gray-700/30'
                          }`}
                        >
                          {reward.requiredLevel}
                        </Badge>
                      </div>
                      
                      <p className={`text-xs mb-2 ${reward.isUnlocked ? 'text-purple-200' : 'text-gray-500'}`}>{reward.partner}</p>
                      <p className={`text-xs mb-3 ${reward.isUnlocked ? 'text-purple-300' : 'text-gray-600'}`}>{reward.description}</p>
                      
                      {reward.isUnlocked ? (
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                          onClick={() => handleRedeemReward(reward.id)}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Resgatar Vantagem
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Lock className="w-3 h-3" />
                          <span>Desbloqueie no nível {reward.levelNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-purple-300">Nenhuma vantagem encontrada nesta categoria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-purple-600 to-cyan-600 border-t border-purple-300/20 mt-6">
          <div className="max-w-md mx-auto px-6 py-6">
            <div className="text-center">
              <p className="text-sm text-gray-900">
                {rewards.filter(r => r.isUnlocked).length} benefícios disponíveis 🎁
              </p>
              <p className="text-xs text-gray-800 mt-1">
                Continue reciclando para desbloquear mais
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}