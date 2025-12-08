import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

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
            <div className="space-y-6 animate-fade-in">
              <Card className="glass-card border-0 p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Общий баланс</span>
                  <Icon name="Eye" size={18} className="text-gray-400" />
                </div>
                <div className="mb-6">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    ₽{mockUser.balance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-0">
                      <Icon name="TrendingUp" size={12} className="mr-1" />
                      +5.2%
                    </Badge>
                    <span className="text-xs text-gray-400">за сегодня</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button className="gradient-primary border-0 text-white flex flex-col h-auto py-3 hover:opacity-90 transition-opacity">
                    <Icon name="ArrowDownUp" size={20} className="mb-1" />
                    <span className="text-xs">Обмен</span>
                  </Button>
                  <Button variant="outline" className="glass-card border-white/10 text-white flex flex-col h-auto py-3 hover:bg-white/10 transition-colors">
                    <Icon name="ArrowDownToLine" size={20} className="mb-1" />
                    <span className="text-xs">Пополнить</span>
                  </Button>
                  <Button variant="outline" className="glass-card border-white/10 text-white flex flex-col h-auto py-3 hover:bg-white/10 transition-colors">
                    <Icon name="ArrowUpFromLine" size={20} className="mb-1" />
                    <span className="text-xs">Вывести</span>
                  </Button>
                </div>
              </Card>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Актуальные курсы</h3>
                  <Button variant="ghost" size="sm" className="text-primary text-xs h-auto p-0">
                    Все курсы
                  </Button>
                </div>
                <div className="space-y-2">
                  {mockRates.map((rate, idx) => (
                    <Card key={idx} className="glass-card border-0 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-bold">
                            {rate.from[0]}
                          </div>
                          <div>
                            <div className="text-white font-medium">{rate.from}/{rate.to}</div>
                            <div className="text-xs text-gray-400">Обменный курс</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{rate.rate.toFixed(2)}</div>
                          <Badge className={`border-0 ${rate.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Icon name={rate.change >= 0 ? "TrendingUp" : "TrendingDown"} size={10} className="mr-1" />
                            {Math.abs(rate.change)}%
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">Быстрые действия</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="glass-card border-0 p-4 cursor-pointer hover:bg-white/10 transition-colors">
                    <Icon name="Users" size={24} className="text-primary mb-2" />
                    <div className="text-white font-medium text-sm">Реферальная программа</div>
                    <div className="text-xs text-gray-400 mt-1">Приглашай и зарабатывай</div>
                  </Card>
                  <Card className="glass-card border-0 p-4 cursor-pointer hover:bg-white/10 transition-colors">
                    <Icon name="Headphones" size={24} className="text-accent mb-2" />
                    <div className="text-white font-medium text-sm">Поддержка</div>
                    <div className="text-xs text-gray-400 mt-1">Помощь 24/7</div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exchange' && (
            <div className="space-y-6 animate-fade-in">
              <Card className="glass-card border-0 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Обмен криптовалюты</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Отдаете</label>
                    <div className="glass-card border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Input 
                          type="number" 
                          placeholder="0.00"
                          value={exchangeAmount}
                          onChange={(e) => setExchangeAmount(e.target.value)}
                          className="bg-transparent border-0 text-2xl font-bold text-white p-0 h-auto focus-visible:ring-0"
                        />
                        <Button className="gradient-primary border-0 text-white">
                          {exchangeFrom}
                          <Icon name="ChevronDown" size={16} className="ml-1" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400">Доступно: 5000.00 USDT</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button size="icon" className="rounded-full gradient-accent border-0 text-white">
                      <Icon name="ArrowDownUp" size={20} />
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Получаете</label>
                    <div className="glass-card border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-white">{calculateExchange()}</div>
                        <Button className="gradient-primary border-0 text-white">
                          {exchangeTo}
                          <Icon name="ChevronDown" size={16} className="ml-1" />
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400">≈ ${(parseFloat(calculateExchange()) * 43210).toFixed(2)}</div>
                    </div>
                  </div>

                  <Card className="bg-primary/10 border-primary/20 p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Курс обмена</span>
                      <span className="text-white">1 {exchangeFrom} = 0.00002314 {exchangeTo}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Комиссия сети</span>
                      <span className="text-white">0.0001 BTC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Время обработки</span>
                      <span className="text-white">≈ 5-10 мин</span>
                    </div>
                  </Card>

                  <Button className="w-full gradient-primary border-0 text-white h-12 text-lg font-semibold hover:opacity-90 transition-opacity">
                    Обменять
                  </Button>
                </div>
              </Card>

              <Card className="glass-card border-0 p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-accent mt-0.5" />
                  <div className="text-sm text-gray-400">
                    Обмен происходит по актуальному рыночному курсу. Итоговая сумма может незначительно отличаться из-за колебаний рынка.
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="glass-card border-0 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Мои кошельки</h2>
                <div className="space-y-3">
                  {mockWallets.map((wallet) => (
                    <Card key={wallet.id} className="bg-white/5 border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-bold">
                            {wallet.icon}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{wallet.name}</div>
                            <div className="text-sm text-gray-400">{wallet.balance.toFixed(4)} {wallet.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">${wallet.usdValue.toFixed(2)}</div>
                          {wallet.change !== 0 && (
                            <Badge className={`border-0 ${wallet.change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {wallet.change > 0 ? '+' : ''}{wallet.change}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Button className="gradient-primary border-0 text-white h-12">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить кошелек
                </Button>
                <Button variant="outline" className="glass-card border-white/10 text-white h-12 hover:bg-white/10">
                  <Icon name="History" size={20} className="mr-2" />
                  История
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="glass-card border-0 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="gradient-primary text-white text-2xl font-bold">
                      {mockUser.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-white">{mockUser.name}</h2>
                    <p className="text-sm text-gray-400">ID: #A2024</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="glass-card border-white/10 rounded-xl p-4">
                    <div className="text-sm text-gray-400 mb-1">Реферальный код</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-mono font-semibold">{mockUser.referralCode}</span>
                      <Button size="icon" variant="ghost" className="text-primary">
                        <Icon name="Copy" size={18} />
                      </Button>
                    </div>
                  </div>

                  <Card className="gradient-primary border-0 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Users" size={20} className="text-white" />
                        <span className="text-white font-semibold">Реферальная программа</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-white">{mockUser.referralCount}</div>
                        <div className="text-xs text-white/70">Приглашено друзей</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">₽{mockUser.referralEarnings.toFixed(2)}</div>
                        <div className="text-xs text-white/70">Заработано</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>

              <Card className="glass-card border-0 p-4">
                <h3 className="text-white font-semibold mb-4">Настройки</h3>
                <div className="space-y-4">
                  {[
                    { icon: 'Shield', label: 'Безопасность', hasSwitch: false },
                    { icon: 'Bell', label: 'Уведомления', hasSwitch: true },
                    { icon: 'Globe', label: 'Язык', value: 'Русский', hasSwitch: false },
                    { icon: 'HelpCircle', label: 'Помощь', hasSwitch: false }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Icon name={item.icon as any} size={20} className="text-gray-400" />
                          <span className="text-white">{item.label}</span>
                        </div>
                        {item.hasSwitch ? (
                          <Switch />
                        ) : item.value ? (
                          <span className="text-gray-400 text-sm">{item.value}</span>
                        ) : (
                          <Icon name="ChevronRight" size={20} className="text-gray-400" />
                        )}
                      </div>
                      {idx < 3 && <Separator className="bg-white/10" />}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="glass-card border-0 p-6">
                <h2 className="text-xl font-bold text-white mb-4">История операций</h2>
                <div className="space-y-3">
                  {mockHistory.map((item) => (
                    <Card key={item.id} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'exchange' ? 'gradient-primary' :
                            item.type === 'withdraw' ? 'gradient-accent' :
                            item.type === 'deposit' ? 'bg-green-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            <Icon 
                              name={
                                item.type === 'exchange' ? 'ArrowDownUp' :
                                item.type === 'withdraw' ? 'ArrowUpFromLine' :
                                item.type === 'deposit' ? 'ArrowDownToLine' :
                                'Send'
                              } 
                              size={18} 
                              className="text-white" 
                            />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {item.type === 'exchange' ? 'Обмен' :
                               item.type === 'withdraw' ? 'Вывод' :
                               item.type === 'deposit' ? 'Пополнение' :
                               'Перевод'}
                            </div>
                            <div className="text-xs text-gray-400">{item.from} → {item.to}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{item.amount}</div>
                          <Badge className={`border-0 ${
                            item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.status === 'completed' ? 'Завершено' : 'В процессе'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">{item.date}</div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4 animate-fade-in">
              <Card className="glass-card border-0 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Поддержка</h2>
                
                <div className="space-y-3 mb-6">
                  {[
                    { icon: 'MessageCircle', label: 'Онлайн-чат', desc: 'Ответ в течение 1 минуты' },
                    { icon: 'Send', label: 'Telegram', desc: '@cryptoexchange_support' },
                    { icon: 'Mail', label: 'Email', desc: 'support@crypto.exchange' }
                  ].map((item, idx) => (
                    <Card key={idx} className="bg-white/5 border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                          <Icon name={item.icon as any} size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.label}</div>
                          <div className="text-sm text-gray-400">{item.desc}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="bg-primary/10 border-primary/20 p-4">
                  <h3 className="text-white font-semibold mb-3">Часто задаваемые вопросы</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      'Как пополнить баланс?',
                      'Сколько времени занимает обмен?',
                      'Какая комиссия за вывод?',
                      'Как работает реферальная программа?'
                    ].map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 cursor-pointer hover:text-white text-gray-300 transition-colors">
                        <span>{q}</span>
                        <Icon name="ChevronRight" size={16} />
                      </div>
                    ))}
                  </div>
                </Card>
              </Card>
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-4 animate-fade-in">
              <Card className="glass-card border-0 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Админ-панель</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Всего заявок', value: '247', icon: 'FileText', color: 'text-blue-400' },
                    { label: 'Активных', value: '12', icon: 'Clock', color: 'text-yellow-400' },
                    { label: 'Пользователей', value: '1,234', icon: 'Users', color: 'text-green-400' },
                    { label: 'Оборот', value: '₽2.4M', icon: 'TrendingUp', color: 'text-purple-400' }
                  ].map((stat, idx) => (
                    <Card key={idx} className="bg-white/5 border-white/10 p-4">
                      <Icon name={stat.icon as any} size={20} className={`${stat.color} mb-2`} />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Управление курсами</h3>
                  {mockRates.map((rate, idx) => (
                    <Card key={idx} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">{rate.from}/{rate.to}</span>
                        <Badge className="gradient-primary border-0 text-white">
                          Активно
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue={rate.rate}
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Button size="sm" className="gradient-accent border-0 text-white">
                          Обновить
                        </Button>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">Наценка: +2%</div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-card border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-around">
            {[
              { id: 'home' as TabType, icon: 'Home', label: 'Главная' },
              { id: 'exchange' as TabType, icon: 'ArrowDownUp', label: 'Обмен' },
              { id: 'wallets' as TabType, icon: 'Wallet', label: 'Кошельки' },
              { id: 'history' as TabType, icon: 'History', label: 'История' },
              { id: 'profile' as TabType, icon: 'User', label: 'Профиль' }
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
      </div>
    </div>
  );
}
