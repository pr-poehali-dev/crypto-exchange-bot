import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { HomeTab } from '@/components/HomeTab';
import { ExchangeTab } from '@/components/ExchangeTab';
import { WalletsProfileTab } from '@/components/WalletsProfileTab';
import { AdminTab } from '@/components/AdminTab';
import { BottomNavigation } from '@/components/BottomNavigation';

type TabType = 'home' | 'exchange' | 'wallets' | 'profile' | 'history' | 'support' | 'admin';

const mockUser = {
  name: 'Александр',
  balance: 125430.50,
  referralCode: 'ALEX2024',
  referralCount: 12,
  referralEarnings: 2340.00
};

const mockWallets = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', balance: 0.5432, usdValue: 23456.78, change: 2.5, icon: '₿' },
  { id: 2, name: 'Ethereum', symbol: 'ETH', balance: 3.2145, usdValue: 7890.32, change: -1.2, icon: 'Ξ' },
  { id: 3, name: 'Tether', symbol: 'USDT', balance: 5000.00, usdValue: 5000.00, change: 0, icon: '₮' },
  { id: 4, name: 'Рубли', symbol: 'RUB', balance: 89083.00, usdValue: 945.50, change: 0, icon: '₽' }
];

const mockHistory = [
  { id: 1, type: 'exchange', from: 'USDT', to: 'BTC', amount: 1000, status: 'completed', date: '2024-12-09 14:30' },
  { id: 2, type: 'withdraw', from: 'RUB', to: 'Карта', amount: 5000, status: 'pending', date: '2024-12-09 12:15' },
  { id: 3, type: 'deposit', from: 'BTC', to: 'Wallet', amount: 0.1, status: 'completed', date: '2024-12-08 18:45' },
  { id: 4, type: 'transfer', from: 'ETH', to: '@user123', amount: 0.5, status: 'completed', date: '2024-12-08 10:20' }
];

const mockRates = [
  { from: 'BTC', to: 'USDT', rate: 43210.50, change: 2.3 },
  { from: 'ETH', to: 'USDT', rate: 2456.80, change: -0.8 },
  { from: 'USDT', to: 'RUB', rate: 94.20, change: 0.1 }
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [exchangeFrom, setExchangeFrom] = useState('USDT');
  const [exchangeTo, setExchangeTo] = useState('BTC');
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [isAdmin] = useState(true);

  const calculateExchange = () => {
    if (!exchangeAmount) return '0.00';
    const amount = parseFloat(exchangeAmount);
    const rate = mockRates.find(r => r.from === exchangeFrom && r.to === exchangeTo)?.rate || 0;
    return (amount / rate).toFixed(8);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1e1533] to-[#1A1F2C]">
      <div className="max-w-md mx-auto pb-20">
        <header className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Crypto Exchange</h1>
              <p className="text-sm text-gray-400">Быстрый обмен криптовалюты</p>
            </div>
            <Button size="icon" variant="ghost" className="text-white">
              <Icon name="Bell" size={22} />
            </Button>
          </div>
        </header>

        <main className="px-4">
          {activeTab === 'home' && (
            <HomeTab mockUser={mockUser} mockRates={mockRates} onTabChange={setActiveTab} />
          )}

          {activeTab === 'exchange' && (
            <ExchangeTab
              exchangeFrom={exchangeFrom}
              exchangeTo={exchangeTo}
              exchangeAmount={exchangeAmount}
              setExchangeAmount={setExchangeAmount}
              calculateExchange={calculateExchange}
              onExchangeFromChange={setExchangeFrom}
              onExchangeToChange={setExchangeTo}
            />
          )}

          {(activeTab === 'wallets' || activeTab === 'profile' || activeTab === 'history' || activeTab === 'support') && (
            <WalletsProfileTab
              activeTab={activeTab}
              mockUser={mockUser}
              mockWallets={mockWallets}
              mockHistory={mockHistory}
            />
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminTab mockRates={mockRates} />
          )}
        </main>

        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}