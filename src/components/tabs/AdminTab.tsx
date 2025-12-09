import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Rate {
  id: number;
  from_currency: string;
  to_currency: string;
  base_rate: string;
  markup_percent: string;
  is_active: boolean;
}

interface Order {
  id: number;
  user_id: number;
  type: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  to_amount: string;
  status: string;
  created_at: string;
  user_details?: string;
}

interface AdminTabProps {
  mockRates: any[];
}

const RATES_API = 'https://functions.poehali.dev/68afa9d4-8dbf-4c81-960b-4a45c9e2cf92';
const EXCHANGE_API = 'https://functions.poehali.dev/3c872717-fdf0-4fb6-9d0c-2a3ab44b22bf';

export default function AdminTab({ mockRates }: AdminTabProps) {
  const [view, setView] = useState<'rates' | 'orders'>('rates');
  const [rates, setRates] = useState<Rate[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRates();
    loadOrders();
  }, []);

  const loadRates = async () => {
    try {
      const response = await fetch(`${RATES_API}?action=list`);
      const data = await response.json();
      if (data.rates) {
        setRates(data.rates);
      }
    } catch (error) {
      console.error('Failed to load rates:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(`${EXCHANGE_API}?action=admin_orders`);
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const updateRate = async (rateId: number, updates: Partial<Rate>) => {
    setLoading(true);
    try {
      const response = await fetch(RATES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          rate_id: rateId,
          ...updates
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadRates();
        setEditingRate(null);
      }
    } catch (error) {
      console.error('Failed to update rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(EXCHANGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          order_id: orderId,
          status
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadOrders();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      cancelled: 'destructive'
    };
    
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      processing: 'В обработке',
      completed: 'Выполнен',
      cancelled: 'Отменен'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
        <Button
          variant={view === 'rates' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setView('rates')}
        >
          <Icon name="TrendingUp" size={18} className="mr-2" />
          Курсы
        </Button>
        <Button
          variant={view === 'orders' ? 'default' : 'ghost'}
          className="flex-1"
          onClick={() => setView('orders')}
        >
          <Icon name="FileText" size={18} className="mr-2" />
          Заявки
        </Button>
      </div>

      {view === 'rates' && (
        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Управление курсами</CardTitle>
              <CardDescription>Настройка базовых курсов и наценок</CardDescription>
            </CardHeader>
          </Card>

          {rates.map((rate) => (
            <Card key={rate.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6">
                {editingRate?.id === rate.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">
                        {rate.from_currency} → {rate.to_currency}
                      </Label>
                    </div>
                    
                    <div>
                      <Label className="text-white">Базовый курс</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={editingRate.base_rate}
                        onChange={(e) =>
                          setEditingRate({ ...editingRate, base_rate: e.target.value })
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Наценка (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editingRate.markup_percent}
                        onChange={(e) =>
                          setEditingRate({ ...editingRate, markup_percent: e.target.value })
                        }
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          updateRate(rate.id, {
                            base_rate: editingRate.base_rate,
                            markup_percent: editingRate.markup_percent
                          })
                        }
                        disabled={loading}
                        className="flex-1"
                      >
                        Сохранить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingRate(null)}
                        disabled={loading}
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {rate.from_currency} → {rate.to_currency}
                        </div>
                        <div className="text-sm text-gray-400">
                          Курс: {parseFloat(rate.base_rate).toFixed(6)} | Наценка: {rate.markup_percent}%
                        </div>
                      </div>
                      <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                        {rate.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingRate(rate)}
                        className="flex-1"
                      >
                        <Icon name="Edit" size={16} className="mr-2" />
                        Изменить
                      </Button>
                      <Button
                        variant={rate.is_active ? 'destructive' : 'default'}
                        onClick={() => updateRate(rate.id, { is_active: !rate.is_active })}
                        disabled={loading}
                      >
                        {rate.is_active ? 'Отключить' : 'Включить'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === 'orders' && (
        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Заявки на обмен</CardTitle>
              <CardDescription>Управление заявками пользователей</CardDescription>
            </CardHeader>
          </Card>

          {orders.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6 text-center text-gray-400">
                Заявок пока нет
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">Заявка #{order.id}</div>
                      <div className="text-lg font-semibold text-white">
                        {order.from_amount} {order.from_currency} → {order.to_amount} {order.to_currency}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="text-sm text-gray-400">
                    <div>Тип: {order.type === 'exchange' ? 'Обмен' : order.type === 'deposit' ? 'Пополнение' : 'Вывод'}</div>
                    <div>User ID: {order.user_id}</div>
                    <div>Дата: {new Date(order.created_at).toLocaleString('ru-RU')}</div>
                    {order.user_details && (
                      <div className="mt-2 p-2 bg-gray-700 rounded text-xs">
                        Реквизиты: {order.user_details}
                      </div>
                    )}
                  </div>

                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Icon name="Clock" size={16} className="mr-2" />
                        В обработку
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Icon name="Check" size={16} className="mr-2" />
                        Выполнить
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={loading}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  )}

                  {order.status === 'processing' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Icon name="Check" size={16} className="mr-2" />
                        Выполнить
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={loading}
                      >
                        Отменить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
