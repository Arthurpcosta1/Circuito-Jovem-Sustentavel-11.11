import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Share2,
  Shield,
  Medal,
  Award,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface Team {
  rank: number;
  name: string;
  members: number;
  totalKeys: number;
  trend: 'up' | 'down' | 'stable';
  avatar: string;
  color: string;
}

interface Post {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export function Community() {
  const [activeTab, setActiveTab] = useState<'ranking' | 'feed'>('ranking');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'João Embaixador',
      role: 'Embaixador do Bloco A',
      avatar: 'JE',
      content: 'Pessoal, mutirão de coleta neste sábado! A estação está pronta para vocês! 🌱',
      timestamp: 'Há 2 horas',
      likes: 24,
      comments: 8,
      isLiked: false
    },
    {
      id: '2',
      author: 'Maria Silva',
      role: 'Embaixadora da Biblioteca',
      avatar: 'MS',
      content: 'Parabéns à Turma de ADS 4º por atingir 500 chaves esta semana! Vocês são incríveis! 🏆',
      timestamp: 'Há 5 horas',
      likes: 42,
      comments: 15,
      isLiked: true
    },
    {
      id: '3',
      author: 'Pedro Santos',
      role: 'Embaixador do Campus',
      avatar: 'PS',
      content: 'Nova meta comunitária: vamos atingir 1 tonelada de materiais reciclados este mês! Quem topa? 💪',
      timestamp: 'Há 1 dia',
      likes: 67,
      comments: 23,
      isLiked: false
    }
  ]);

  const teams: Team[] = [
    {
      rank: 1,
      name: 'Turma de ADS 4º',
      members: 28,
      totalKeys: 1247,
      trend: 'up',
      avatar: 'ADS',
      color: 'bg-green-600'
    },
    {
      rank: 2,
      name: 'Condomínio Piedade',
      members: 45,
      totalKeys: 1103,
      trend: 'up',
      avatar: 'CPD',
      color: 'bg-blue-600'
    },
    {
      rank: 3,
      name: 'Grupo UNINASSAU Verde',
      members: 52,
      totalKeys: 987,
      trend: 'down',
      avatar: 'UNV',
      color: 'bg-purple-600'
    },
    {
      rank: 4,
      name: 'Família Recicladora',
      members: 19,
      totalKeys: 856,
      trend: 'stable',
      avatar: 'FAM',
      color: 'bg-orange-600'
    },
    {
      rank: 5,
      name: 'Engenharia Sustentável',
      members: 34,
      totalKeys: 742,
      trend: 'up',
      avatar: 'ENG',
      color: 'bg-teal-600'
    }
  ];

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-orange-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="text-blue-900">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-md mx-auto px-6 py-6">
          <h1 className="text-lg text-gray-900 mb-1">Comunidade</h1>
          <p className="text-gray-800 text-sm">Competição e interação entre times</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-6 border border-purple-300/20">
            <TabsTrigger 
              value="ranking"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-purple-200"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Times
            </TabsTrigger>
            <TabsTrigger 
              value="feed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-purple-200"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Feed
            </TabsTrigger>
          </TabsList>

          {/* Aba Ranking */}
          <TabsContent value="ranking" className="space-y-3">
            {teams.map((team) => (
              <Card 
                key={team.rank}
                className={`border-2 ${
                  team.rank <= 3 ? 'border-green-200 bg-green-50' : 'border-green-100 bg-white'
                } shadow-sm`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {getRankBadge(team.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className={`${team.color} w-12 h-12`}>
                      <AvatarFallback className="text-white">
                        {team.avatar}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-blue-900 mb-1">{team.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-blue-700">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{team.members} membros</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-green-600" />
                          <span>{team.totalKeys} chaves</span>
                        </div>
                      </div>
                    </div>

                    {/* Trend */}
                    <div className="flex-shrink-0">
                      {team.trend === 'up' && (
                        <div className="flex items-center gap-1 text-green-600">
                          <ChevronUp className="w-5 h-5" />
                        </div>
                      )}
                      {team.trend === 'down' && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 mt-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 mb-1">Competição Mensal</p>
                    <p className="text-sm text-blue-700">
                      O time em 1º lugar no fim do mês ganha uma experiência exclusiva patrocinada!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Feed */}
          <TabsContent value="feed" className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="bg-white border-2 border-green-100 shadow-sm">
                <CardContent className="p-5">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="bg-green-600 w-10 h-10">
                      <AvatarFallback className="text-white">
                        {post.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-blue-900">{post.author}</p>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Embaixador
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-700">{post.role}</p>
                    </div>
                    <span className="text-xs text-blue-600">{post.timestamp}</span>
                  </div>

                  {/* Post Content */}
                  <p className="text-blue-900 mb-4">{post.content}</p>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t border-green-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`text-blue-700 hover:bg-green-50 ${
                        post.isLiked ? 'text-orange-500' : ''
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-orange-500' : ''}`} 
                      />
                      {post.likes}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-700 hover:bg-green-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-700 hover:bg-green-50"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
