"""
API для админ-панели: управление пользователями, транзакциями и статистикой
"""
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Админ-панель для управления платформой
    Args: event - dict с httpMethod, queryStringParameters
          context - object с атрибутами request_id и др.
    Returns: HTTP response dict
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Простая проверка админского ключа
    headers = event.get('headers', {})
    admin_key = headers.get('X-Admin-Key') or headers.get('x-admin-key')
    
    if admin_key != os.environ.get('ADMIN_SECRET_KEY', 'admin123'):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'stats')
    
    try:
        # Общая статистика
        if action == 'stats':
            cur.execute("SELECT COUNT(*) as total_users FROM users")
            users_count = cur.fetchone()['total_users']
            
            cur.execute("""
                SELECT COUNT(*) as total_transactions, 
                       SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
                       SUM(CASE WHEN type = 'exchange' THEN amount ELSE 0 END) as total_exchanges
                FROM transactions
            """)
            tx_stats = cur.fetchone()
            
            cur.execute("""
                SELECT currency, SUM(balance) as total_balance
                FROM wallets
                GROUP BY currency
                ORDER BY total_balance DESC
            """)
            balances = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'users': users_count,
                    'transactions': dict(tx_stats),
                    'balances': [dict(b) for b in balances]
                }, default=str),
                'isBase64Encoded': False
            }
        
        # Список пользователей
        elif action == 'users':
            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))
            
            cur.execute("""
                SELECT u.*, 
                       COUNT(DISTINCT w.id) as wallets_count,
                       COUNT(DISTINCT t.id) as transactions_count
                FROM users u
                LEFT JOIN wallets w ON u.id = w.user_id
                LEFT JOIN transactions t ON u.id = t.user_id
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT %s OFFSET %s
            """, (limit, offset))
            users = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(u) for u in users], default=str),
                'isBase64Encoded': False
            }
        
        # Список транзакций
        elif action == 'transactions':
            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))
            
            cur.execute("""
                SELECT t.*, u.telegram_id, u.username
                FROM transactions t
                JOIN users u ON t.user_id = u.id
                ORDER BY t.created_at DESC
                LIMIT %s OFFSET %s
            """, (limit, offset))
            transactions = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(tx) for tx in transactions], default=str),
                'isBase64Encoded': False
            }
        
        # Детали пользователя
        elif action == 'user_details':
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT w.*, c.name as currency_name
                FROM wallets w
                JOIN currencies c ON w.currency_id = c.id
                WHERE w.user_id = %s
            """, (user_id,))
            wallets = cur.fetchall()
            
            cur.execute("""
                SELECT * FROM transactions 
                WHERE user_id = %s 
                ORDER BY created_at DESC 
                LIMIT 20
            """, (user_id,))
            transactions = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'wallets': [dict(w) for w in wallets],
                    'transactions': [dict(tx) for tx in transactions]
                }, default=str),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()
