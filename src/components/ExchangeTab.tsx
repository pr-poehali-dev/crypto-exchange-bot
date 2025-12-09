import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

interface ExchangeTabProps {
  exchangeFrom: string;
  exchangeTo: string;
  exchangeAmount: string;
  setExchangeAmount: (value: string) => void;
  calculateExchange: () => string;
  onExchangeFromChange?: (currency: string) => void;
  onExchangeToChange?: (currency: string) => void;
}

const currencies = [
  { code: 'BTC', name: 'Bitcoin', icon: '₿' },
  { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { code: 'USDT', name: 'Tether', icon: '₮' },
  { code: 'RUB', name: 'Рубли', icon: '₽' },
];

export function ExchangeTab({ 
  exchangeFrom, 
  exchangeTo, 
  exchangeAmount, 
  setExchangeAmount, 
  calculateExchange,
  onExchangeFromChange,
  onExchangeToChange
}: ExchangeTabProps) {
  const [loading, setLoading] = useState(false);
  const [showFromSelect, setShowFromSelect] = useState(false);
  const [showToSelect, setShowToSelect] = useState(false);

  const handleExchange = async () => {
    if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    setLoading(true);
    try {
      const result = await api.exchange.createOrder({
        telegram_id: 123,
        from_currency: exchangeFrom,
        to_currency: exchangeTo,
        from_amount: parseFloat(exchangeAmount)
      });
      
      alert(`Заявка на обмен создана! ID: ${result.id}`);
      setExchangeAmount('');
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      alert('Не удалось создать заявку на обмен');
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    if (onExchangeFromChange && onExchangeToChange) {
      onExchangeFromChange(exchangeTo);
      onExchangeToChange(exchangeFrom);
    }
  };

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
                <div className="relative">
                  <Button 
                    className="gradient-primary border-0 text-white"
                    onClick={() => setShowFromSelect(!showFromSelect)}
                  >
                    {exchangeFrom}
                    <Icon name="ChevronDown" size={16} className="ml-1" />
                  </Button>
                  {showFromSelect && (
                    <Card className="absolute right-0 top-12 glass-card border-white/10 p-2 z-10 min-w-[120px]">
                      {currencies.filter(c => c.code !== exchangeTo).map(currency => (
                        <button
                          key={currency.code}
                          className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded transition-colors flex items-center gap-2"
                          onClick={() => {
                            onExchangeFromChange?.(currency.code);
                            setShowFromSelect(false);
                          }}
                        >
                          <span>{currency.icon}</span>
                          <span>{currency.code}</span>
                        </button>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400">Доступно: 5000.00 USDT</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              size="icon" 
              className="rounded-full gradient-accent border-0 text-white"
              onClick={swapCurrencies}
            >
              <Icon name="ArrowDownUp" size={20} />
            </Button>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Получаете</label>
            <div className="glass-card border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-white">{calculateExchange()}</div>
                <div className="relative">
                  <Button 
                    className="gradient-primary border-0 text-white"
                    onClick={() => setShowToSelect(!showToSelect)}
                  >
                    {exchangeTo}
                    <Icon name="ChevronDown" size={16} className="ml-1" />
                  </Button>
                  {showToSelect && (
                    <Card className="absolute right-0 top-12 glass-card border-white/10 p-2 z-10 min-w-[120px]">
                      {currencies.filter(c => c.code !== exchangeFrom).map(currency => (
                        <button
                          key={currency.code}
                          className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded transition-colors flex items-center gap-2"
                          onClick={() => {
                            onExchangeToChange?.(currency.code);
                            setShowToSelect(false);
                          }}
                        >
                          <span>{currency.icon}</span>
                          <span>{currency.code}</span>
                        </button>
                      ))}
                    </Card>
                  )}
                </div>
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

          <Button 
            className="w-full gradient-primary border-0 text-white h-12 text-lg font-semibold hover:opacity-90 transition-opacity"
            onClick={handleExchange}
            disabled={loading}
          >
            {loading ? 'Создание заявки...' : 'Обменять'}
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