import React from 'react';
import { Home, MapPin, Gift, User, QrCode, Trophy, Recycle } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAmbassador?: boolean;
}

export function BottomNavigation({ activeTab, onTabChange, isAmbassador = false }: BottomNavigationProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'stations', icon: MapPin, label: 'Estações' },
    { id: 'rewards', icon: Gift, label: 'Vantagens' },
    { id: 'leaderboard', icon: Trophy, label: 'Ranking' },
    { id: 'profile', icon: User, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-cyan-600 backdrop-blur-lg border-t border-purple-300/20 shadow-lg">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-gray-900' 
                    : 'text-gray-800 hover:text-gray-900 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-current'}`} />
                <span className={`text-xs ${isActive ? 'text-gray-900' : 'text-current'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}