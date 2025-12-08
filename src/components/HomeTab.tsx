import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface HomeTabProps {
  mockUser: {
    name: string;
    balance: number;
    referralCode: string;
    referralCount: number;
    referralEarnings: number;
  };
  mockRates: Array<{
    from: string;
    to: string;
    rate: number;
    change: number;
  }>;
}

export function HomeTab({ mockUser, mockRates }: HomeTabProps) {
  return (
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
  );
}
