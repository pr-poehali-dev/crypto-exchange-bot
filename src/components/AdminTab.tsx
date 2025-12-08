import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AdminTabProps {
  mockRates: Array<{
    from: string;
    to: string;
    rate: number;
    change: number;
  }>;
}

export function AdminTab({ mockRates }: AdminTabProps) {
  return (
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
  );
}
