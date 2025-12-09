"""
Тестовая функция для проверки наличия CRYPTO_BOT_API_TOKEN
"""
import os
import json
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Проверяет наличие и валидность API токена"""
    
    token = os.environ.get('CRYPTO_BOT_API_TOKEN', '')
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'token_present': bool(token),
            'token_length': len(token) if token else 0,
            'token_preview': token[:10] + '...' if len(token) > 10 else 'EMPTY',
            'all_env_keys': list(os.environ.keys())
        }),
        'isBase64Encoded': False
    }
