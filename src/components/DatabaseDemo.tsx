import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Database, 
  Users, 
  MapPin, 
  Recycle, 
  Gift, 
  Store, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Trophy
} from 'lucide-react';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function DatabaseDemo() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    stations: 0,
    collections: 0,
    benefits: 0,
    stores: 0
  });

  const [stations, setStations] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  // Carregar dados do banco
  const loadData = async () => {
    setLoading(true);
    try {
      const [stationsData, benefitsData, rankingData] = await Promise.all([
        api.getStations(),
        api.getBenefits(),
        api.getRanking()
      ]);

      setStations(stationsData || []);
      setBenefits(benefitsData || []);
      setRanking(rankingData || []);

      // Tentar carregar coletas se autenticado
      if (api.isAuthenticated()) {
        try {
          const collectionsData = await api.getMyCollections();
          setCollections(collectionsData || []);
        } catch (error) {
          // Usuário não autenticado, ignorar
        }
      }

      // Atualizar estatísticas
      setStats({
        users: rankingData?.length || 0,
        stations: stationsData?.length || 0,
        collections: 0, // Seria calculado com query agregada
        benefits: benefitsData?.length || 0,
        stores: 0 // Seria calculado com query de comércios
      });

      toast.success('Dados carregados do banco de dados!');
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Popular banco com dados de exemplo
  const seedDB = async () => {
    setLoading(true);
    try {
      await api.seedDatabase();
      toast.success('Banco de dados populado com dados de exemplo!');
      await loadData();
    } catch (error: any) {
      console.error('Erro ao popular banco:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full h-screen overflow-auto bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Database className="w-8 h-8 text-cyan-400" />
            <h1 className="text-white text-2xl md:text-3xl">Demonstração do Banco de Dados</h1>
          </div>
          <p className="text-purple-300">
            Circuito Jovem Sustentável - Estrutura PostgreSQL + Supabase
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={loadData} 
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Database className="w-4 h-4 mr-2" />
            Recarregar Dados
          </Button>
          <Button 
            onClick={seedDB} 
            disabled={loading}
            variant="outline"
            className="border-purple-500 text-purple-300 hover:bg-purple-900/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Popular Banco (Seed)
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-900/50 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{stats.users}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-cyan-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Estações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{stats.stations}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                <Recycle className="w-4 h-4" />
                Coletas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{collections.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-pink-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-pink-300 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Vantagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{stats.benefits}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-yellow-300 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Comércios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white">{stats.stores}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com dados detalhados */}
        <Tabs defaultValue="mer" className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 bg-slate-900/50">
            <TabsTrigger value="mer">MER</TabsTrigger>
            <TabsTrigger value="stations">Estações</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="benefits">Vantagens</TabsTrigger>
            <TabsTrigger value="collections">Coletas</TabsTrigger>
          </TabsList>

          {/* MER */}
          <TabsContent value="mer" className="space-y-4">
            <Card className="bg-slate-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300">Estrutura do Banco de Dados</CardTitle>
                <CardDescription className="text-purple-200/70">
                  9 Tabelas Relacionais com PostgreSQL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Entidades Principais */}
                  <div className="space-y-2">
                    <h4 className="text-cyan-400 text-sm">Entidades Principais</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <Users className="w-3 h-3 text-purple-400" />
                        <span className="text-white">USUARIOS</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <MapPin className="w-3 h-3 text-cyan-400" />
                        <span className="text-white">ESTACOES</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <Recycle className="w-3 h-3 text-green-400" />
                        <span className="text-white">COLETAS</span>
                      </div>
                    </div>
                  </div>

                  {/* Entidades de Gamificação */}
                  <div className="space-y-2">
                    <h4 className="text-cyan-400 text-sm">Gamificação & Recompensas</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <Store className="w-3 h-3 text-yellow-400" />
                        <span className="text-white">COMERCIOS</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <Gift className="w-3 h-3 text-pink-400" />
                        <span className="text-white">VANTAGENS</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span className="text-white">RESGATES (N:N)</span>
                      </div>
                    </div>
                  </div>

                  {/* Entidades de Gestão */}
                  <div className="space-y-2">
                    <h4 className="text-cyan-400 text-sm">Gestão & Administração</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <TrendingUp className="w-3 h-3 text-orange-400" />
                        <span className="text-white">EMBAIXADORES</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <Database className="w-3 h-3 text-blue-400" />
                        <span className="text-white">INSTITUICOES</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span className="text-white">EMBAIXADORES_ESTACOES (N:N)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Relacionamentos */}
                <div className="border-t border-purple-500/30 pt-4 space-y-2">
                  <h4 className="text-cyan-400 text-sm">Relacionamentos Principais</h4>
                  <div className="grid md:grid-cols-2 gap-2 text-xs text-purple-200">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-300 border-purple-500/50">1:1</Badge>
                      <span>USUARIO ↔ EMBAIXADOR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-cyan-300 border-cyan-500/50">1:N</Badge>
                      <span>INSTITUICAO → ESTACOES</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-300 border-green-500/50">N:N</Badge>
                      <span>EMBAIXADORES ↔ ESTACOES</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-pink-300 border-pink-500/50">N:N</Badge>
                      <span>USUARIOS ↔ VANTAGENS</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estações */}
          <TabsContent value="stations" className="space-y-4">
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-300 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Estações de Coleta (Tabela: estacoes)
                </CardTitle>
                <CardDescription className="text-cyan-200/70">
                  Pontos de reciclagem em Recife
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stations.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">Nenhuma estação cadastrada</p>
                    <p className="text-purple-200/70 text-sm mt-2">Clique em "Popular Banco" para adicionar dados de exemplo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stations.map((station) => (
                      <div key={station.id} className="p-3 bg-slate-800/50 rounded border border-cyan-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white">{station.nome}</h4>
                            <p className="text-purple-200/70 text-sm">{station.endereco}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {station.materiais_aceitos?.map((material: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs text-cyan-300 border-cyan-500/50">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge className={station.ativa ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                            {station.ativa ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking" className="space-y-4">
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Ranking de Usuários (Tabela: usuarios)
                </CardTitle>
                <CardDescription className="text-yellow-200/70">
                  Top usuários por Chaves de Impacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ranking.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">Nenhum usuário cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ranking.slice(0, 10).map((user, idx) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                          idx === 2 ? 'bg-orange-500/20 text-orange-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{user.nome}</p>
                          <p className="text-purple-200/70 text-xs">Nível {user.nivel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400">{user.chaves_impacto}</p>
                          <p className="text-purple-200/70 text-xs">chaves</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vantagens */}
          <TabsContent value="benefits" className="space-y-4">
            <Card className="bg-slate-900/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Vantagens Disponíveis (Tabela: vantagens_7af4432d)
                </CardTitle>
                <CardDescription className="text-pink-200/70">
                  Benefícios oferecidos por parceiros de Recife
                </CardDescription>
              </CardHeader>
              <CardContent>
                {benefits.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">Nenhuma vantagem cadastrada</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {benefits.map((benefit) => (
                      <div key={benefit.id} className="p-3 bg-slate-800/50 rounded border border-pink-500/20">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white text-sm">{benefit.titulo}</h4>
                          <Badge className="bg-pink-500/20 text-pink-300">
                            {benefit.custo_chaves} 🔑
                          </Badge>
                        </div>
                        <p className="text-purple-200/70 text-xs mb-2">{benefit.descricao}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Store className="w-3 h-3 text-yellow-400" />
                          <span className="text-yellow-300">{benefit.comercios_7af4432d?.nome}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coletas */}
          <TabsContent value="collections" className="space-y-4">
            <Card className="bg-slate-900/50 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center gap-2">
                  <Recycle className="w-5 h-5" />
                  Minhas Coletas (Tabela: coletas_7af4432d)
                </CardTitle>
                <CardDescription className="text-green-200/70">
                  Histórico de reciclagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!api.isAuthenticated() ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">Faça login para ver suas coletas</p>
                  </div>
                ) : collections.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-300">Nenhuma coleta registrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collections.map((collection) => (
                      <div key={collection.id} className="p-3 bg-slate-800/50 rounded border border-green-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-white">{collection.material_tipo}</p>
                            <p className="text-purple-200/70 text-sm">{collection.estacoes_7af4432d?.nome}</p>
                            <p className="text-purple-200/70 text-xs">
                              {new Date(collection.data_coleta).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400">{collection.peso_kg} kg</p>
                            <p className="text-cyan-400 text-sm">+{collection.chaves_ganhas} 🔑</p>
                            <Badge className={
                              collection.status === 'validada' ? 'bg-green-500/20 text-green-300' :
                              collection.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }>
                              {collection.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documentação */}
        <Card className="bg-slate-900/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-300">📚 Documentação para Apresentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-slate-800/50 rounded">
              <p className="text-cyan-400 mb-1">📄 DOCUMENTACAO_MER.md</p>
              <p className="text-purple-200/70">
                Modelo Entidade-Relacionamento completo com descrição de todas as 9 tabelas,
                atributos, tipos de dados, relacionamentos e regras de negócio.
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded">
              <p className="text-cyan-400 mb-1">📊 MER_VISUAL.md</p>
              <p className="text-purple-200/70">
                Diagrama visual ASCII do banco de dados com cardinalidades, exemplos de queries SQL
                e fluxo de dados da gamificação.
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded">
              <p className="text-cyan-400 mb-1">💻 /supabase/functions/server/database.tsx</p>
              <p className="text-purple-200/70">
                Código de criação das tabelas com todos os DDL statements, constraints,
                índices e integridade referencial.
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded">
              <p className="text-cyan-400 mb-1">🚀 /supabase/functions/server/index.tsx</p>
              <p className="text-purple-200/70">
                API REST completa com rotas de autenticação, CRUD de todas as entidades,
                sistema de gamificação e resgates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}