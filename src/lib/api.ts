import funcUrls from '../../backend/func2url.json';

const API_URLS = {
  auth: funcUrls.auth,
  wallets: funcUrls.wallets,
  notifications: funcUrls.notifications,
  exchange: funcUrls.exchange,
  rates: funcUrls.rates,
  cryptoBot: funcUrls['crypto-bot']
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

export interface CryptoInvoice {
  invoice_id: string;
  status: string;
  hash?: string;
  asset: string;
  amount: string;
  pay_url: string;
  description?: string;
  created_at: string;
  paid_at?: string;
}

export interface CryptoCurrency {
  is_blockchain: boolean;
  is_stablecoin: boolean;
  is_fiat: boolean;
  name: string;
  code: string;
  decimals: number;
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

  cryptoBot: {
    getMe: async (): Promise<any> => {
      const response = await fetch(`${API_URLS.cryptoBot}?action=getMe`);
      return response.json();
    },

    getCurrencies: async (): Promise<CryptoCurrency[]> => {
      const response = await fetch(`${API_URLS.cryptoBot}?action=getCurrencies`);
      const data = await response.json();
      return data.result || [];
    },

    getBalance: async (): Promise<any> => {
      const response = await fetch(`${API_URLS.cryptoBot}?action=getBalance`);
      return response.json();
    },

    getExchangeRates: async (): Promise<any> => {
      const response = await fetch(`${API_URLS.cryptoBot}?action=getExchangeRates`);
      return response.json();
    },

    createInvoice: async (data: {
      asset: string;
      amount: number;
      description?: string;
      payload?: string;
    }): Promise<CryptoInvoice> => {
      const response = await fetch(API_URLS.cryptoBot, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result.result || result;
    },

    getInvoice: async (invoiceId: string): Promise<CryptoInvoice> => {
      const response = await fetch(`${API_URLS.cryptoBot}?action=getInvoice&invoice_id=${invoiceId}`);
      const result = await response.json();
      return result.result?.items?.[0] || result;
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