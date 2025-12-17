-- Создание таблицы провайдеров курсов
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Добавление поля provider_id в таблицу courses
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS provider_id UUID;

-- Добавление внешнего ключа
ALTER TABLE courses
ADD CONSTRAINT fk_courses_provider
FOREIGN KEY (provider_id) REFERENCES providers(id)
ON DELETE SET NULL;

-- Добавление нескольких примеров провайдеров
INSERT INTO providers (name, description, website, contact_email, is_active, created_by)
VALUES
    ('Coursera', 'Онлайн-платформа для обучения с курсами от ведущих университетов', 'https://www.coursera.org', 'info@coursera.org', true, (SELECT id FROM users WHERE employee_id = '0000001')),
    ('Udemy', 'Глобальная платформа онлайн-обучения с тысячами курсов', 'https://www.udemy.com', 'support@udemy.com', true, (SELECT id FROM users WHERE employee_id = '0000001')),
    ('LinkedIn Learning', 'Профессиональные курсы для развития карьеры', 'https://www.linkedin.com/learning', 'help@linkedin.com', true, (SELECT id FROM users WHERE employee_id = '0000001')),
    ('edX', 'Некоммерческая платформа онлайн-обучения', 'https://www.edx.org', 'info@edx.org', true, (SELECT id FROM users WHERE employee_id = '0000001')),
    ('Stepik', 'Образовательная платформа и конструктор курсов', 'https://stepik.org', 'hello@stepik.org', true, (SELECT id FROM users WHERE employee_id = '0000001'))
ON CONFLICT (name) DO NOTHING;

-- Проверка
SELECT id, name, is_active FROM providers ORDER BY name;
