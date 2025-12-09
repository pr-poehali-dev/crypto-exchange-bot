import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { api, CryptoInvoice } from '@/lib/api';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<CryptoInvoice | null>(null);

  const currencies = [
    { code: 'BTC', name: 'Bitcoin', icon: '₿' },
    { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
    { code: 'USDT', name: 'Tether', icon: '₮' },
    { code: 'TON', name: 'TON', icon: '💎' },
  ];

  const handleCreateInvoice = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    setLoading(true);
    try {
      const result = await api.cryptoBot.createInvoice({
        asset: selectedCurrency,
        amount: parseFloat(amount),
        description: `Пополнение баланса ${amount} ${selectedCurrency}`,
        payload: 'user_123'
      });
      
      setInvoice(result);
    } catch (error) {
      console.error('Ошибка создания счета:', error);
      alert('Не удалось создать счет. Проверьте, что CRYPTO_BOT_API_TOKEN настроен.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (invoice?.pay_url) {
      window.open(invoice.pay_url, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <Card className="glass-card border-0 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Пополнить баланс</h2>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {!invoice ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Выберите валюту</label>
              <div className="grid grid-cols-4 gap-2">
                {currencies.map((currency) => (
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
                  Минимум: {selectedCurrency === 'BTC' ? '0.0001' : selectedCurrency === 'ETH' ? '0.001' : '1'} {selectedCurrency}
                </div>
              </div>
            </div>

            <Card className="bg-primary/10 border-primary/20 p-4">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-accent mt-0.5" />
                <div className="text-sm text-gray-400">
                  После создания счета вы получите ссылку для оплаты через Crypto Bot. 
                  Средства поступят на баланс автоматически после подтверждения транзакции.
                </div>
              </div>
            </Card>

            <Button
              className="w-full gradient-primary border-0 text-white h-12 text-lg font-semibold"
              onClick={handleCreateInvoice}
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать счет на оплату'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-3xl mx-auto mb-4">
                {currencies.find(c => c.code === selectedCurrency)?.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{amount} {selectedCurrency}</h3>
              <p className="text-sm text-gray-400">Счет создан успешно</p>
            </div>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID счета:</span>
                  <span className="text-white font-mono">{invoice.invoice_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Статус:</span>
                  <span className="text-white">{invoice.status}</span>
                </div>
              </div>
            </Card>

            <Button
              className="w-full gradient-primary border-0 text-white h-12 text-lg font-semibold"
              onClick={handlePayment}
            >
              <Icon name="ExternalLink" size={20} className="mr-2" />
              Перейти к оплате
            </Button>

            <Button
              variant="outline"
              className="w-full glass-card border-white/10 text-white h-12 hover:bg-white/10"
              onClick={() => {
                setInvoice(null);
                setAmount('');
              }}
            >
              Создать новый счет
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
