import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const ADMIN_API = 'https://functions.poehali.dev/60c8963a-9a88-4a80-a81c-609271c7f30f';

interface Stats {
  users: number;
  transactions: {
    total_transactions: number;
    total_deposits: number;
    total_exchanges: number;
  };
  balances: Array<{
    currency: string;
    total_balance: number;
  }>;
}

interface User {
  id: string;
  telegram_id: string;
  username: string;
  first_name: string;
  last_name: string;
  created_at: string;
  wallets_count: number;
  transactions_count: number;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  currency: string;
  amount: number;
  status: string;
  created_at: string;
  telegram_id: string;
  username: string;
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('adminKey') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  const fetchData = async (action: string) => {
    try {
      const response = await fetch(`${ADMIN_API}?action=${action}`, {
        headers: {
          'X-Admin-Key': adminKey
        }
      });

      if (response.status === 403) {
        setIsAuthorized(false);
        toast({
          title: 'Ошибка доступа',
          description: 'Неверный админский ключ',
          variant: 'destructive'
        });
        return null;
      }

      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleLogin = async () => {
    if (!adminKey) {
      toast({
        title: 'Ошибка',
        description: 'Введите админский ключ',
        variant: 'destructive'
      });
      return;
    }

    const data = await fetchData('stats');
    if (data) {
      setIsAuthorized(true);
      setStats(data);
      localStorage.setItem('adminKey', adminKey);
      toast({
        title: 'Успешно',
        description: 'Добро пожаловать в админ-панель'
      });
    }
  };

  const loadUsers = async () => {
    const data = await fetchData('users');
    if (data) setUsers(data);
  };

  const loadTransactions = async () => {
    const data = await fetchData('transactions');
    if (data) setTransactions(data);
  };

  useEffect(() => {
    if (adminKey) {
      handleLogin();
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" className="text-purple-600" />
              Админ-панель
            </CardTitle>
            <CardDescription>Введите секретный ключ для доступа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Админский ключ"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Icon name="LayoutDashboard" className="text-purple-600" />
            Админ-панель
          </h1>
          <Button
            variant="outline"
            onClick={() => {
              setIsAuthorized(false);
              localStorage.removeItem('adminKey');
            }}
          >
            <Icon name="LogOut" className="mr-2" size={16} />
            Выйти
          </Button>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Пользователи
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.users}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Транзакции
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.transactions.total_transactions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Депозиты
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.transactions.total_deposits?.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Балансы по валютам */}
        {stats && stats.balances.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Общие балансы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.balances.map((balance) => (
                  <div key={balance.currency} className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">{balance.currency}</div>
                    <div className="text-xl font-bold mt-1">
                      {parseFloat(balance.total_balance).toFixed(8)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Таблицы */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users" onClick={loadUsers}>
              <Icon name="Users" className="mr-2" size={16} />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="transactions" onClick={loadTransactions}>
              <Icon name="Receipt" className="mr-2" size={16} />
              Транзакции
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Пользователи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Telegram ID</th>
                        <th className="text-left p-2">Username</th>
                        <th className="text-left p-2">Имя</th>
                        <th className="text-left p-2">Кошельки</th>
                        <th className="text-left p-2">Транзакции</th>
                        <th className="text-left p-2">Дата регистрации</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{user.telegram_id}</td>
                          <td className="p-2">@{user.username || 'N/A'}</td>
                          <td className="p-2">{user.first_name} {user.last_name}</td>
                          <td className="p-2 text-center">{user.wallets_count}</td>
                          <td className="p-2 text-center">{user.transactions_count}</td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Транзакции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Пользователь</th>
                        <th className="text-left p-2">Тип</th>
                        <th className="text-left p-2">Валюта</th>
                        <th className="text-left p-2">Сумма</th>
                        <th className="text-left p-2">Статус</th>
                        <th className="text-left p-2">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-xs">{tx.id.slice(0, 8)}...</td>
                          <td className="p-2">@{tx.username || tx.telegram_id}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-2 font-semibold">{tx.currency}</td>
                          <td className="p-2">{parseFloat(tx.amount.toString()).toFixed(8)}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
