"""
Telegram бот для получения уведомлений о платежах и управления кошельками
"""
import json
import os
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
BASE_URL = f'https://api.telegram.org/bot{BOT_TOKEN}'

def send_message(chat_id: int, text: str, parse_mode: str = 'HTML') -> bool:
    """Отправка сообщения через Telegram Bot API"""
    url = f'{BASE_URL}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('ok', False)
    except Exception as e:
        print(f"Error sending message: {e}")
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Обработка webhook от Telegram и управление ботом
    """
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Webhook от Telegram
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        # Обработка команды /start
        if 'message' in body_data:
            message = body_data['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            telegram_user = message['from']
            
            if text.startswith('/start'):
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                # Проверяем или создаем пользователя
                cur.execute(
                    """
                    INSERT INTO users (telegram_id, username, first_name, last_name)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (telegram_id) DO UPDATE
                    SET username = EXCLUDED.username,
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name
                    RETURNING id
                    """,
                    (
                        str(telegram_user['id']),
                        telegram_user.get('username'),
                        telegram_user.get('first_name'),
                        telegram_user.get('last_name')
                    )
                )
                conn.commit()
                
                cur.close()
                conn.close()
                
                welcome_text = f"""
🚀 <b>Добро пожаловать в Crypto Exchange!</b>

Я буду присылать вам уведомления о:
• 💰 Новых платежах
• 💱 Успешных обменах
• 📊 Изменениях курсов валют

Ваш Telegram ID: <code>{telegram_user['id']}</code>

Используйте этот ID для входа в приложение.
"""
                
                send_message(chat_id, welcome_text)
            
            elif text == '/wallets':
                conn = psycopg2.connect(os.environ['DATABASE_URL'])
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                cur.execute(
                    """
                    SELECT w.*, c.symbol, c.name
                    FROM wallets w
                    JOIN currencies c ON w.currency_id = c.id
                    JOIN users u ON w.user_id = u.id
                    WHERE u.telegram_id = %s
                    ORDER BY w.balance DESC
                    """,
                    (str(telegram_user['id']),)
                )
                wallets = cur.fetchall()
                
                cur.close()
                conn.close()
                
                if not wallets:
                    send_message(chat_id, "У вас пока нет кошельков. Пополните баланс через приложение!")
                else:
                    wallet_text = "💼 <b>Ваши кошельки:</b>\n\n"
                    for w in wallets:
                        wallet_text += f"• {w['symbol']}: <code>{w['balance']:.8f}</code>\n"
                    
                    send_message(chat_id, wallet_text)
            
            elif text == '/help':
                help_text = """
📖 <b>Доступные команды:</b>

/start - Начать работу с ботом
/wallets - Показать баланс кошельков
/help - Показать эту справку

Для работы с обменником используйте веб-приложение.
"""
                send_message(chat_id, help_text)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
