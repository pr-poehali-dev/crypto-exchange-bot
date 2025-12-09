import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

class TelegramAuth {
  private static instance: TelegramAuth;
  private webApp: typeof WebApp | null = null;
  private user: TelegramUser | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.webApp = WebApp;
        this.webApp.ready();
        this.webApp.expand();
        
        if (this.webApp.initDataUnsafe?.user) {
          this.user = this.webApp.initDataUnsafe.user as TelegramUser;
        }
      } catch (error) {
        console.error('Telegram WebApp initialization error:', error);
      }
    }
  }

  static getInstance(): TelegramAuth {
    if (!TelegramAuth.instance) {
      TelegramAuth.instance = new TelegramAuth();
    }
    return TelegramAuth.instance;
  }

  isAvailable(): boolean {
    return this.webApp !== null && this.user !== null;
  }

  getUser(): TelegramUser | null {
    return this.user;
  }

  getUserId(): number | null {
    return this.user?.id || null;
  }

  showAlert(message: string): void {
    if (this.webApp) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  showConfirm(message: string, callback: (confirmed: boolean) => void): void {
    if (this.webApp) {
      this.webApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
  }

  close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  getInitData(): string {
    return this.webApp?.initData || '';
  }

  setHeaderColor(color: 'bg_color' | 'secondary_bg_color'): void {
    if (this.webApp) {
      this.webApp.setHeaderColor(color);
    }
  }

  setBackgroundColor(color: string): void {
    if (this.webApp) {
      this.webApp.setBackgroundColor(color);
    }
  }
}

export const telegramAuth = TelegramAuth.getInstance();
