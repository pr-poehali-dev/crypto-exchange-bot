"""
Функция управления курсами валют и интеграции с внешними API
"""
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        cur.execute(
            """
            SELECT * FROM exchange_rates
            WHERE is_active = TRUE
            ORDER BY from_currency, to_currency
            """
        )
        rates = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(r) for r in rates], default=str),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        from_currency = body_data.get('from_currency')
        to_currency = body_data.get('to_currency')
        rate = body_data.get('rate')
        markup_percent = body_data.get('markup_percent')
        
        if not all([from_currency, to_currency, rate]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'from_currency, to_currency, and rate are required'}),
                'isBase64Encoded': False
            }
        
        if markup_percent is not None:
            cur.execute(
                """
                UPDATE exchange_rates
                SET rate = %s, markup_percent = %s, updated_at = CURRENT_TIMESTAMP
                WHERE from_currency = %s AND to_currency = %s
                RETURNING *
                """,
                (rate, markup_percent, from_currency, to_currency)
            )
        else:
            cur.execute(
                """
                UPDATE exchange_rates
                SET rate = %s, updated_at = CURRENT_TIMESTAMP
                WHERE from_currency = %s AND to_currency = %s
                RETURNING *
                """,
                (rate, from_currency, to_currency)
            )
        
        updated_rate = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        if not updated_rate:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Exchange rate not found'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(updated_rate), default=str),
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
