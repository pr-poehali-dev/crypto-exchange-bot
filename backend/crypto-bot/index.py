'''
Интеграция с Crypto Bot API для работы с платежами
Позволяет создавать счета на оплату, проверять статус и получать адреса кошельков
'''

import json
import os
from typing import Dict, Any
from urllib.request import Request, urlopen
from urllib.error import HTTPError

API_TOKEN = os.environ.get('CRYPTO_BOT_API_TOKEN', '')
BASE_URL = 'https://pay.crypt.bot/api'

def make_request(method: str, endpoint: str, data: Dict = None) -> Dict:
    """Выполняет запрос к Crypto Bot API"""
    url = f"{BASE_URL}/{endpoint}"
    headers = {
        'Crypto-Pay-API-Token': API_TOKEN,
        'Content-Type': 'application/json'
    }
    
    req_data = json.dumps(data).encode() if data else None
    request = Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urlopen(request) as response:
            result = json.loads(response.read().decode())
            return result
    except HTTPError as e:
        error_body = e.read().decode()
        raise Exception(f"Crypto Bot API error: {error_body}")

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Работа с Crypto Bot API: создание счетов, проверка платежей, получение кошельков
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с атрибутами request_id, function_name и др.
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # GET /crypto-bot?action=getMe - получить информацию о приложении
    # GET /crypto-bot?action=getCurrencies - получить список валют
    # GET /crypto-bot?action=getBalance - получить баланс
    # GET /crypto-bot?action=getExchangeRates - получить курсы обмена
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        action = params.get('action', 'getMe')
        
        if action == 'getMe':
            result = make_request('GET', 'getMe')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif action == 'getCurrencies':
            result = make_request('GET', 'getCurrencies')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif action == 'getBalance':
            result = make_request('GET', 'getBalance')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif action == 'getExchangeRates':
            result = make_request('GET', 'getExchangeRates')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif action == 'getInvoice':
            invoice_id = params.get('invoice_id')
            if not invoice_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'invoice_id required'})
                }
            
            result = make_request('GET', f'getInvoices?invoice_ids={invoice_id}')
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'})
        }
    
    # POST /crypto-bot - создать счет на оплату
    # Body: {asset, amount, description?, paid_btn_name?, paid_btn_url?, payload?}
    if method == 'POST':
        body_str = event.get('body', '{}')
        if not body_str:
            body_str = '{}'
        body_data = json.loads(body_str)
        
        asset = body_data.get('asset')  # BTC, ETH, USDT и т.д.
        amount = body_data.get('amount')  # Сумма в криптовалюте
        
        if not asset or not amount:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'asset and amount required'})
            }
        
        # Создаем счет на оплату
        invoice_data = {
            'asset': asset,
            'amount': str(amount),
            'description': body_data.get('description', 'Пополнение баланса'),
            'paid_btn_name': body_data.get('paid_btn_name', 'callback'),
            'paid_btn_url': body_data.get('paid_btn_url'),
            'payload': body_data.get('payload', '')  # Можно передать user_id для идентификации
        }
        
        # Убираем None значения
        invoice_data = {k: v for k, v in invoice_data.items() if v is not None}
        
        result = make_request('POST', 'createInvoice', invoice_data)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }