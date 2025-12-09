import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [withdrawType, setWithdrawType] = useState<'card' | 'crypto'>('card');
  const [selectedCurrency, setSelectedCurrency] = useState('RUB');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'RUB', name: 'Рубли', icon: '₽', type: 'card' },
    { code: 'BTC', name: 'Bitcoin', icon: '₿', type: 'crypto' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ', type: 'crypto' },
    { code: 'USDT', name: 'Tether', icon: '₮', type: 'crypto' },
  ];

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    if (withdrawType === 'card' && !cardNumber) {
      alert('Введите номер карты');
      return;
    }

    if (withdrawType === 'crypto' && !cryptoAddress) {
      alert('Введите адрес кошелька');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Заявка на вывод создана!\nСумма: ${amount} ${selectedCurrency}\n${withdrawType === 'card' ? 'Карта: ' + cardNumber : 'Адрес: ' + cryptoAddress}`);
      onClose();
      setAmount('');
      setCardNumber('');
      setCryptoAddress('');
    } catch (error) {
      console.error('Ошибка создания заявки:', error);
      alert('Не удалось создать заявку на вывод');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <Card className="glass-card border-0 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Вывести средства</h2>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Способ вывода</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={withdrawType === 'card' ? 'default' : 'outline'}
                className={`h-auto py-3 ${
                  withdrawType === 'card'
                    ? 'gradient-primary border-0 text-white' 
                    : 'glass-card border-white/10 text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  setWithdrawType('card');
                  setSelectedCurrency('RUB');
                }}
              >
                <Icon name="CreditCard" size={20} className="mr-2" />
                На карту
              </Button>
              <Button
                variant={withdrawType === 'crypto' ? 'default' : 'outline'}
                className={`h-auto py-3 ${
                  withdrawType === 'crypto'
                    ? 'gradient-primary border-0 text-white' 
                    : 'glass-card border-white/10 text-white hover:bg-white/10'
                }`}
                onClick={() => {
                  setWithdrawType('crypto');
                  setSelectedCurrency('BTC');
                }}
              >
                <Icon name="Bitcoin" size={20} className="mr-2" />
                Криптовалюта
              </Button>
            </div>
          </div>

          {withdrawType === 'crypto' && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Валюта</label>
              <div className="grid grid-cols-3 gap-2">
                {currencies.filter(c => c.type === 'crypto').map((currency) => (
                  <Button
                    key={currency.code}
                    variant={selectedCurrency === currency.code ? 'default' : 'outline'}
                    className={`flex flex-col h-auto py-3 ${
                      selectedCurrency === currency.code 
                        ? 'gradient-primary border-0 text-white' 
                        : 'glass-card border-white/10 text-white hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedCurrency(currency.code)}
                  >
                    <span className="text-2xl mb-1">{currency.icon}</span>
                    <span className="text-xs">{currency.code}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Сумма</label>
            <div className="glass-card border-white/10 rounded-xl p-4">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-0 text-2xl font-bold text-white p-0 h-auto focus-visible:ring-0"
              />
              <div className="text-xs text-gray-400 mt-2">
                Доступно: {withdrawType === 'card' ? '89,083' : '0.5432'} {selectedCurrency}
              </div>
            </div>
          </div>

          {withdrawType === 'card' ? (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Номер карты</label>
              <Input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                className="glass-card border-white/10 text-white h-12"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Адрес кошелька</label>
              <Input
                type="text"
                placeholder="Введите адрес..."
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="glass-card border-white/10 text-white h-12"
              />
            </div>
          )}

          <Card className="bg-primary/10 border-primary/20 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Комиссия:</span>
                <span className="text-white">{withdrawType === 'card' ? '0 ₽' : '0.0001 ' + selectedCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">К получению:</span>
                <span className="text-white font-semibold">
                  {amount || '0.00'} {selectedCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Время:</span>
                <span className="text-white">{withdrawType === 'card' ? '≈ 5-30 мин' : '≈ 10-30 мин'}</span>
              </div>
            </div>
          </Card>

          <Button
            className="w-full gradient-primary border-0 text-white h-12 text-lg font-semibold"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? 'Обработка...' : 'Вывести средства'}
          </Button>

          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="text-accent mt-0.5" />
            <p className="text-xs text-gray-400">
              {withdrawType === 'card' 
                ? 'Вывод на карту производится в течение 5-30 минут. Комиссия отсутствует.'
                : 'Вывод криптовалюты производится после подтверждения в сети. Минимальная комиссия сети.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
