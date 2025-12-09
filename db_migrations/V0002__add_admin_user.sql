-- Добавление администратора с Telegram ID 7766254588
INSERT INTO users (telegram_id, username, first_name, referral_code, is_admin)
VALUES (7766254588, 'admin', 'Admin', 'ADMIN001', true)
ON CONFLICT (telegram_id) 
DO UPDATE SET is_admin = true;