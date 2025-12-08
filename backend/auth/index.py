"""
Функция авторизации и регистрации пользователей через Telegram
"""
import json
import os
import random
import string
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def generate_referral_code(length: int = 8) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        telegram_id = body_data.get('telegram_id')
        username = body_data.get('username', '')
        first_name = body_data.get('first_name', '')
        referral_code_used = body_data.get('referral_code')
        
        if not telegram_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'telegram_id is required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT * FROM users WHERE telegram_id = %s",
            (telegram_id,)
        )
        user = cur.fetchone()
        
        if user:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(user), default=str),
                'isBase64Encoded': False
            }
        
        referral_code = generate_referral_code()
        referred_by_id = None
        
        if referral_code_used:
            cur.execute(
                "SELECT id FROM users WHERE referral_code = %s",
                (referral_code_used,)
            )
            referrer = cur.fetchone()
            if referrer:
                referred_by_id = referrer['id']
        
        cur.execute(
            """
            INSERT INTO users (telegram_id, username, first_name, referral_code, referred_by_id)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """,
            (telegram_id, username, first_name, referral_code, referred_by_id)
        )
        new_user = cur.fetchone()
        
        for currency in ['BTC', 'ETH', 'USDT', 'RUB']:
            cur.execute(
                "INSERT INTO wallets (user_id, currency) VALUES (%s, %s)",
                (new_user['id'], currency)
            )
        
        if referred_by_id:
            cur.execute(
                """
                INSERT INTO notifications (user_id, type, title, message)
                VALUES (%s, 'referral', 'Новый реферал!', 'По вашей ссылке зарегистрировался новый пользователь')
                """,
                (referred_by_id,)
            )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(new_user), default=str),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
