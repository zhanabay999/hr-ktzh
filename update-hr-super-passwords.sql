-- Обновление паролей для HR Super Admins (0000002-0000006)
-- Новый пароль: 1111

UPDATE users
SET password = '$2a$12$3UZHimHnDB4rSLWkar2kdOAU503Wll9UG4ys3HCdRTniVZNhYRQRW',
    updated_at = NOW()
WHERE employee_id IN ('0000002', '0000003', '0000004', '0000005', '0000006');

-- Проверка обновления
SELECT employee_id, first_name, last_name, role
FROM users
WHERE employee_id IN ('0000002', '0000003', '0000004', '0000005', '0000006')
ORDER BY employee_id;
