import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

type TabType = 'wallets' | 'profile' | 'history' | 'support';

interface WalletsProfileTabProps {
  activeTab: TabType;
  mockUser: {
    name: string;
    balance: number;
    referralCode: string;
    referralCount: number;
    referralEarnings: number;
  };
  mockWallets: Array<{
    id: number;
    name: string;
    symbol: string;
    balance: number;
    usdValue: number;
    change: number;
    icon: string;
  }>;
  mockHistory: Array<{
    id: number;
    type: string;
    from: string;
    to: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

export function WalletsProfileTab({ activeTab, mockUser, mockWallets, mockHistory }: WalletsProfileTabProps) {
  if (activeTab === 'wallets') {
    return (
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
    );
  }

  if (activeTab === 'profile') {
    return (
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
    );
  }

  if (activeTab === 'history') {
    return (
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
    );
  }

  if (activeTab === 'support') {
    return (
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
    );
  }

  return null;
}
