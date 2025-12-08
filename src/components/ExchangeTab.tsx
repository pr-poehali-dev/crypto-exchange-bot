import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface ExchangeTabProps {
  exchangeFrom: string;
  exchangeTo: string;
  exchangeAmount: string;
  setExchangeAmount: (value: string) => void;
  calculateExchange: () => string;
}

export function ExchangeTab({ 
  exchangeFrom, 
  exchangeTo, 
  exchangeAmount, 
  setExchangeAmount, 
  calculateExchange 
}: ExchangeTabProps) {
  return (
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
  );
}
