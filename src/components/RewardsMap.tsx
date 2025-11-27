import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Gift, Lock, QrCode, Coffee, Book, Film, Utensils, Gamepad2, Dumbbell, Award } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { auth } from '../utils/api';
import { NIVEIS } from '../utils/levelSystem';
import { toast } from 'sonner@2.0.3';
import { RewardRedeemModal } from './RewardRedeemModal';

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
  keysRequired?: number;
}

interface RedeemData {
  reward: {
    id: string;
    title: string;
    partner: string;
    description: string;
  } | null;
  code: string;
  expiresAt: string;
}

export function RewardsMap() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(1);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [currentRedeem, setCurrentRedeem] = useState<RedeemData>({
    reward: null,
    code: '',
    expiresAt: ''
  });

  useEffect(() => {
    loadRewardsAndUserLevel();
  }, []);

  const loadRewardsAndUserLevel = async () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser?.id) {
      setUserLevel(1);
      setRewards(getDefaultRewards(1));
      setLoading(false);
      return;
    }

    try {
      // Buscar nível do usuário
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('nivel, chaves_impacto')
        .eq('id', currentUser.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        setUserLevel(1);
        setRewards(getDefaultRewards(1));
      } else {
        const nivel = userData?.nivel || 1;
        setUserLevel(nivel);
        setRewards(getDefaultRewards(nivel));
      }

      // LIMPAR RESGATES EXPIRADOS automaticamente
      await cleanupExpiredRedeems();
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setUserLevel(1);
      setRewards(getDefaultRewards(1));
    } finally {
      setLoading(false);
    }
  };

  // Nova função para limpar resgates expirados
  const cleanupExpiredRedeems = async () => {
    try {
      const now = new Date().toISOString();
      
      // Atualizar status de resgates expirados para 'expirado'
      const { data, error } = await supabase
        .from('resgates')
        .update({ status: 'expirado' })
        .eq('status', 'ativo')
        .lt('data_validade', now);

      if (error) {
        console.error('Erro ao limpar resgates expirados:', error);
      } else if (data) {
        console.log(`✅ ${data.length} resgates expirados foram marcados`);
      }
    } catch (error) {
      console.error('Erro na limpeza automática:', error);
    }
  };

  const mapCategory = (categoria: string): 'comida' | 'lazer' | 'cultura' | 'fitness' | 'outros' => {
    // Verificar se categoria existe antes de chamar toLowerCase
    if (!categoria) return 'outros';
    
    const categoryMap: { [key: string]: 'comida' | 'lazer' | 'cultura' | 'fitness' | 'outros' } = {
      'alimentacao': 'comida',
      'comida': 'comida',
      'entretenimento': 'lazer',
      'lazer': 'lazer',
      'educacao': 'cultura',
      'cultura': 'cultura',
      'esporte': 'fitness',
      'fitness': 'fitness',
      'saude': 'fitness'
    };
    return categoryMap[categoria.toLowerCase()] || 'outros';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'comida': return <Utensils className="w-5 h-5" />;
      case 'lazer': return <Film className="w-5 h-5" />;
      case 'cultura': return <Book className="w-5 h-5" />;
      case 'fitness': return <Dumbbell className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getDefaultRewards = (currentLevel: number): Reward[] => {
    return [
      {
        id: '1',
        title: 'Compre 1, Leve 2 na Cantina',
        partner: 'UNINASSAU Graças',
        category: 'comida',
        requiredLevel: 'Bronze',
        levelNumber: 2,
        description: 'Válido para lanches e bebidas selecionados',
        isUnlocked: currentLevel >= 2,
        icon: <Coffee className="w-5 h-5" />,
        keysRequired: 100
      },
      {
        id: '2',
        title: 'Impressões ou Cópias Gratuitas',
        partner: 'Setor Acadêmico UNINASSAU',
        category: 'cultura',
        requiredLevel: 'Iniciante',
        levelNumber: 1,
        description: 'Válido para trabalhos acadêmicos e atividades do curso',
        isUnlocked: currentLevel >= 1,
        icon: <Book className="w-5 h-5" />,
        keysRequired: 0
      },
      {
        id: '3',
        title: 'Vale Alimentação R$ 50,00',
        partner: 'Supermercado São José',
        category: 'comida',
        requiredLevel: 'Prata',
        levelNumber: 3,
        description: 'Crédito para compras no supermercado',
        isUnlocked: currentLevel >= 3,
        icon: <Utensils className="w-5 h-5" />,
        keysRequired: 300
      },
      {
        id: '4',
        title: 'Combo Almoço Completo',
        partner: 'Restaurante Universitário',
        category: 'comida',
        requiredLevel: 'Ouro',
        levelNumber: 4,
        description: 'Refeição completa com sobremesa incluída',
        isUnlocked: currentLevel >= 4,
        icon: <Utensils className="w-5 h-5" />,
        keysRequired: 600
      },
      {
        id: '5',
        title: 'Ingresso Cinema RioMar',
        partner: 'Cinépolis RioMar Recife',
        category: 'lazer',
        requiredLevel: 'Ouro',
        levelNumber: 4,
        description: 'Ingresso para qualquer sessão + combo pipoca',
        isUnlocked: currentLevel >= 4,
        icon: <Film className="w-5 h-5" />,
        keysRequired: 600
      },
      {
        id: '6',
        title: 'Mensalidade Grátis Academia',
        partner: 'Academia UNINASSAU Graças',
        category: 'fitness',
        requiredLevel: 'Diamante',
        levelNumber: 5,
        description: '1 mês de acesso total à academia da universidade',
        isUnlocked: currentLevel >= 5,
        icon: <Dumbbell className="w-5 h-5" />,
        keysRequired: 1000
      },
      {
        id: '7',
        title: 'Vale Lanche R$ 15,00',
        partner: 'Lanchonete Campus',
        category: 'comida',
        requiredLevel: 'Bronze',
        levelNumber: 2,
        description: 'Crédito para usar em qualquer item da lanchonete',
        isUnlocked: currentLevel >= 2,
        icon: <Coffee className="w-5 h-5" />,
        keysRequired: 100
      },
      {
        id: '8',
        title: 'Desconto Material Didático',
        partner: 'Livraria Universitária',
        category: 'cultura',
        requiredLevel: 'Prata',
        levelNumber: 3,
        description: '15% de desconto em livros e materiais',
        isUnlocked: currentLevel >= 3,
        icon: <Book className="w-5 h-5" />,
        keysRequired: 300
      }
    ];
  };

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

  const handleRedeemReward = async (reward: Reward) => {
    if (!reward.isUnlocked) {
      toast.error(`Desbloqueie no nível ${reward.levelNumber} - ${reward.requiredLevel}`);
      return;
    }
    
    try {
      const currentUser = auth.getCurrentUser();
      if (!currentUser?.id) {
        toast.error('Faça login para resgatar vantagens');
        return;
      }

      // Verificar se o usuário tem chaves suficientes
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('chaves_impacto')
        .eq('id', currentUser.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        toast.error('Erro ao verificar suas chaves');
        return;
      }

      const chavesUsuario = userData?.chaves_impacto || 0;
      const chavesNecessarias = reward.keysRequired || 0;

      if (chavesUsuario < chavesNecessarias) {
        toast.error(`Você precisa de ${chavesNecessarias} chaves, mas tem apenas ${chavesUsuario}. Continue reciclando! 🔑`, {
          duration: 4000,
        });
        return;
      }

      // Gerar código único de resgate
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const redeemCode = `CJS-RESGATE-${timestamp}-${randomStr}`;
      
      // Data de expiração (24 horas)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      // Primeiro, buscar ou criar o comércio/parceiro
      let comercioId = null;
      
      const { data: comercioExistente } = await supabase
        .from('comercios')
        .select('id')
        .eq('nome', reward.partner)
        .single();
      
      if (comercioExistente) {
        comercioId = comercioExistente.id;
      } else {
        // Criar comércio se não existir
        const { data: novoComercio, error: comercioError } = await supabase
          .from('comercios')
          .insert({
            nome: reward.partner,
            categoria: reward.category === 'comida' ? 'Alimentação' : 
                       reward.category === 'cultura' ? 'Cultura' : 
                       reward.category === 'fitness' ? 'Saúde' : 
                       reward.category === 'lazer' ? 'Entretenimento' : 'Outros',
            endereco: 'Recife - PE',
            descricao: `Parceiro do Circuito Jovem Sustentável`
          })
          .select('id')
          .single();
        
        if (comercioError) {
          console.error('Erro ao criar comércio:', comercioError);
          toast.error('Erro ao processar parceiro');
          return;
        }
        
        comercioId = novoComercio.id;
      }
      
      // Agora buscar ou criar a vantagem
      let vantagemId = null;
      
      const { data: vantagemExistente } = await supabase
        .from('vantagens')
        .select('id')
        .eq('titulo', reward.title)
        .eq('comercio_id', comercioId)
        .single();
      
      if (vantagemExistente) {
        vantagemId = vantagemExistente.id;
      } else {
        // Se não existir, criar a vantagem no banco
        const { data: novaVantagem, error: vantagemError } = await supabase
          .from('vantagens')
          .insert({
            comercio_id: comercioId,
            titulo: reward.title,
            descricao: reward.description,
            categoria: reward.category,
            nivel_minimo: reward.levelNumber,
            custo_chaves: chavesNecessarias,
            ativa: true
          })
          .select('id')
          .single();
        
        if (vantagemError) {
          console.error('Erro ao criar vantagem:', vantagemError);
          toast.error('Erro ao processar vantagem');
          return;
        }
        
        vantagemId = novaVantagem.id;
      }
      
      // Salvar resgate no banco de dados com o UUID correto
      const { data: resgateData, error } = await supabase
        .from('resgates')
        .insert({
          usuario_id: currentUser.id,
          vantagem_id: vantagemId,
          codigo_resgate: redeemCode,
          status: 'ativo',
          data_validade: expiresAt
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar resgate:', error);
        toast.error('Erro ao gerar código de resgate');
        return;
      }

      // Deduzir chaves do usuário (se houver custo)
      if (chavesNecessarias > 0) {
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ chaves_impacto: chavesUsuario - chavesNecessarias })
          .eq('id', currentUser.id);

        if (updateError) {
          console.error('Erro ao atualizar chaves:', updateError);
          // Não bloquear o resgate por causa disso
        }
      }

      toast.success(`Vantagem resgatada! ${chavesNecessarias > 0 ? `${chavesNecessarias} chaves gastas.` : ''} 🎉`, {
        duration: 3000,
      });
      
      // Abrir modal com o código
      setCurrentRedeem({
        reward: {
          id: reward.id,
          title: reward.title,
          partner: reward.partner,
          description: reward.description
        },
        code: redeemCode,
        expiresAt: expiresAt
      });
      setIsRedeemModalOpen(true);
      
      // Recarregar dados para atualizar as chaves
      loadRewardsAndUserLevel();
      
    } catch (error) {
      console.error('Erro ao resgatar vantagem:', error);
      toast.error('Erro ao resgatar vantagem. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-purple-300">Carregando vantagens...</div>
      </div>
    );
  }

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
                          onClick={() => handleRedeemReward(reward)}
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

      {/* Redeem Modal */}
      <RewardRedeemModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        reward={currentRedeem.reward}
        redeemCode={currentRedeem.code}
        expiresAt={currentRedeem.expiresAt}
      />
    </div>
  );
}