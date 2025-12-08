"""
Функция создания и управления заявками на обмен криптовалюты
"""
import json
import os
from typing import Dict, Any
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        telegram_id = params.get('telegram_id')
        
        if not telegram_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'telegram_id is required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """
            SELECT eo.*
            FROM exchange_orders eo
            JOIN users u ON eo.user_id = u.id
            WHERE u.telegram_id = %s
            ORDER BY eo.created_at DESC
            LIMIT 100
            """,
            (telegram_id,)
        )
        orders = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(o) for o in orders], default=str),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        telegram_id = body_data.get('telegram_id')
        from_currency = body_data.get('from_currency')
        to_currency = body_data.get('to_currency')
        from_amount = body_data.get('from_amount')
        
        if not all([telegram_id, from_currency, to_currency, from_amount]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'All fields are required'}),
                'isBase64Encoded': False
            }
        
        cur.execute("SELECT id FROM users WHERE telegram_id = %s", (telegram_id,))
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """
            SELECT rate, markup_percent FROM exchange_rates
            WHERE from_currency = %s AND to_currency = %s AND is_active = TRUE
            """,
            (from_currency, to_currency)
        )
        rate_data = cur.fetchone()
        
        if not rate_data:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Exchange rate not found'}),
                'isBase64Encoded': False
            }
        
        rate = float(rate_data['rate'])
        markup = float(rate_data['markup_percent'])
        final_rate = rate * (1 + markup / 100)
        to_amount = float(from_amount) / final_rate
        fee = to_amount * 0.01
        
        cur.execute(
            """
            INSERT INTO exchange_orders 
            (user_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, fee, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING *
            """,
            (user['id'], from_currency, to_currency, from_amount, to_amount, final_rate, fee)
        )
        new_order = cur.fetchone()
        
        cur.execute(
            """
            INSERT INTO notifications (user_id, type, title, message, related_order_id)
            VALUES (%s, 'order_created', 'Заявка создана', 'Ваша заявка на обмен создана и ожидает обработки', %s)
            """,
            (user['id'], new_order['id'])
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(new_order), default=str),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        order_id = body_data.get('order_id')
        status = body_data.get('status')
        
        if not all([order_id, status]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'order_id and status are required'}),
                'isBase64Encoded': False
            }
        
        if status == 'completed':
            cur.execute(
                "UPDATE exchange_orders SET status = %s, completed_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
                (status, order_id)
            )
        else:
            cur.execute(
                "UPDATE exchange_orders SET status = %s WHERE id = %s RETURNING *",
                (status, order_id)
            )
        
        updated_order = cur.fetchone()
        
        if not updated_order:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Order not found'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            """
            INSERT INTO notifications (user_id, type, title, message, related_order_id)
            VALUES (%s, 'order_status', 'Статус заявки изменен', %s, %s)
            """,
            (updated_order['user_id'], f"Заявка #{order_id} - {status}", order_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(updated_order), default=str),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
