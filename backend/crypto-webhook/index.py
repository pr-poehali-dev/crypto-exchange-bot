'''
Webhook для обработки платежей от Crypto Bot
Автоматически зачисляет средства на баланс пользователя после оплаты
'''

import json
import os
import psycopg2
from typing import Dict, Any

DSN = os.environ.get('DATABASE_URL', '')

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(DSN)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Webhook для обработки уведомлений от Crypto Bot о платежах
    Args: event - dict с httpMethod, body (JSON с данными о платеже)
          context - object с атрибутами request_id, function_name и др.
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # POST - обработка webhook от Crypto Bot
    if method == 'POST':
        body_str = event.get('body', '{}')
        if not body_str:
            body_str = '{}'
        
        webhook_data = json.loads(body_str)
        
        # Структура webhook от Crypto Bot:
        # {
        #   "update_id": 123,
        #   "update_type": "invoice_paid",
        #   "request_date": "2024-12-09T12:00:00Z",
        #   "payload": {
        #     "invoice_id": "123456",
        #     "status": "paid",
        #     "asset": "USDT",
        #     "amount": "100.00",
        #     "paid_at": "2024-12-09T12:05:00Z",
        #     "payload": "user_123"
        #   }
        # }
        
        update_type = webhook_data.get('update_type')
        
        if update_type == 'invoice_paid':
            payload = webhook_data.get('payload', {})
            invoice_id = payload.get('invoice_id')
            asset = payload.get('asset')
            amount = payload.get('amount')
            user_payload = payload.get('payload', '')
            
            # Извлекаем telegram_id из payload (формат: "user_123")
            telegram_id = None
            if user_payload.startswith('user_'):
                try:
                    telegram_id = int(user_payload.replace('user_', ''))
                except ValueError:
                    pass
            
            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid user payload'})
                }
            
            conn = get_db_connection()
            cur = conn.cursor()
            
            try:
                # Получаем user_id по telegram_id
                cur.execute(
                    "SELECT id FROM users WHERE telegram_id = %s",
                    (telegram_id,)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'})
                    }
                
                user_id = user[0]
                
                # Зачисляем средства на кошелек пользователя
                cur.execute(
                    "UPDATE wallets SET balance = balance + %s, updated_at = NOW() WHERE user_id = %s AND currency = %s",
                    (float(amount), user_id, asset)
                )
                
                # Создаем запись о транзакции
                cur.execute(
                    """INSERT INTO transactions 
                       (user_id, type, currency, amount, status, crypto_bot_invoice_id, created_at)
                       VALUES (%s, 'deposit', %s, %s, 'completed', %s, NOW())
                       RETURNING id""",
                    (user_id, asset, float(amount), invoice_id)
                )
                transaction_id = cur.fetchone()[0]
                
                # Создаем уведомление
                cur.execute(
                    """INSERT INTO notifications 
                       (user_id, type, title, message, is_read, created_at)
                       VALUES (%s, 'info', 'Пополнение успешно', %s, false, NOW())""",
                    (user_id, f'На ваш счет зачислено {amount} {asset}')
                )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'transaction_id': transaction_id,
                        'message': 'Payment processed successfully'
                    })
                }
                
            except Exception as e:
                conn.rollback()
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)})
                }
            finally:
                cur.close()
                conn.close()
        
        # Для других типов webhook просто возвращаем OK
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'Webhook received'})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
