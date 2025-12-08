import Icon from '@/components/ui/icon';

type TabType = 'home' | 'exchange' | 'wallets' | 'history' | 'profile';

interface BottomNavigationProps {
  activeTab: TabType | 'admin' | 'support';
  setActiveTab: (tab: TabType | 'admin' | 'support') => void;
}

export function BottomNavigation({ activeTab, setActiveTab }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-card border-t border-white/10 px-4 py-3">
      <div className="flex items-center justify-around">
        {[
          { id: 'home' as const, icon: 'Home', label: 'Главная' },
          { id: 'exchange' as const, icon: 'ArrowDownUp', label: 'Обмен' },
          { id: 'wallets' as const, icon: 'Wallet', label: 'Кошельки' },
          { id: 'history' as const, icon: 'History', label: 'История' },
          { id: 'profile' as const, icon: 'User', label: 'Профиль' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon name={tab.icon as any} size={22} />
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
