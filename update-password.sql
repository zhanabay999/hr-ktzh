-- Обновление пароля для Super Admin (0000001)
-- Новый пароль: 151192
UPDATE users
SET password = '$2a$12$ipXCPOHz8kdE2ueoo8e6Lez2DkKFk7A16g1cIkMEADh7X6wMq31wu',
    updated_at = NOW()
WHERE employee_id = '0000001';

-- Проверка обновления
SELECT employee_id, first_name, last_name, role
FROM users
WHERE employee_id = '0000001';
