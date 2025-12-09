import { useState, useEffect } from 'react';
import { api, User, Wallet, ExchangeOrder, ExchangeRate } from '@/lib/api';

interface UserData {
  user: User | null;
  wallets: Wallet[];
  orders: ExchangeOrder[];
  rates: ExchangeRate[];
  loading: boolean;
  error: string | null;
}

export function useUser(telegramId: number = 123) {
  const [data, setData] = useState<UserData>({
    user: null,
    wallets: [],
    orders: [],
    rates: [],
    loading: true,
    error: null
  });

  const loadUserData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const [wallets, orders, rates] = await Promise.all([
        api.wallets.getAll(telegramId).catch(() => []),
        api.exchange.getOrders(telegramId).catch(() => []),
        api.rates.getAll().catch(() => [])
      ]);

      setData({
        user: null,
        wallets,
        orders,
        rates,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Не удалось загрузить данные'
      }));
    }
  };

  useEffect(() => {
    loadUserData();
  }, [telegramId]);

  return {
    ...data,
    reload: loadUserData
  };
}
