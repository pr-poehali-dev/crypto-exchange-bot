import funcUrls from '../../backend/func2url.json';

const API_URLS = {
  auth: funcUrls.auth,
  wallets: funcUrls.wallets,
  notifications: funcUrls.notifications,
  exchange: funcUrls.exchange,
  rates: funcUrls.rates
};

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  referral_code: string;
  referred_by_id?: number;
  balance_rub: number;
  referral_earnings: number;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  currency: string;
  balance: number;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_order_id?: number;
  created_at: string;
}

export interface ExchangeOrder {
  id: number;
  user_id: number;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  fee: number;
  status: string;
  crypto_bot_invoice_id?: string;
  completed_at?: string;
  created_at: string;
}

export interface ExchangeRate {
  id: number;
  from_currency: string;
  to_currency: string;
  rate: number;
  markup_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const api = {
  auth: {
    register: async (data: {
      telegram_id: number;
      username?: string;
      first_name?: string;
      referral_code?: string;
    }): Promise<User> => {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }
  },

  wallets: {
    getAll: async (telegramId: number): Promise<Wallet[]> => {
      const response = await fetch(`${API_URLS.wallets}?telegram_id=${telegramId}`);
      return response.json();
    }
  },

  notifications: {
    getAll: async (telegramId: number): Promise<Notification[]> => {
      const response = await fetch(`${API_URLS.notifications}?telegram_id=${telegramId}`);
      return response.json();
    },

    markAsRead: async (notificationId: number): Promise<Notification> => {
      const response = await fetch(API_URLS.notifications, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId })
      });
      return response.json();
    },

    create: async (data: {
      telegram_id: number;
      type: string;
      title: string;
      message: string;
    }): Promise<Notification> => {
      const response = await fetch(API_URLS.notifications, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }
  },

  exchange: {
    getOrders: async (telegramId: number): Promise<ExchangeOrder[]> => {
      const response = await fetch(`${API_URLS.exchange}?telegram_id=${telegramId}`);
      return response.json();
    },

    createOrder: async (data: {
      telegram_id: number;
      from_currency: string;
      to_currency: string;
      from_amount: number;
    }): Promise<ExchangeOrder> => {
      const response = await fetch(API_URLS.exchange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },

    updateStatus: async (orderId: number, status: string): Promise<ExchangeOrder> => {
      const response = await fetch(API_URLS.exchange, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status })
      });
      return response.json();
    }
  },

  rates: {
    getAll: async (): Promise<ExchangeRate[]> => {
      const response = await fetch(API_URLS.rates);
      return response.json();
    },

    update: async (data: {
      from_currency: string;
      to_currency: string;
      rate: number;
      markup_percent?: number;
    }): Promise<ExchangeRate> => {
      const response = await fetch(API_URLS.rates, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    }
  }
};
