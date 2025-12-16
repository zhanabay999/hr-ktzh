-- Создание ENUM типов
DO $$ BEGIN
    CREATE TYPE role AS ENUM ('super_admin', 'hr_super', 'hr_central', 'hr_regional', 'hr_line', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(7) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    role role NOT NULL DEFAULT 'employee',
    created_by UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Создание таблицы courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    created_by UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Создание таблицы enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    status enrollment_status NOT NULL DEFAULT 'enrolled',
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Добавление Super Admin
-- Пароль: SuperAdmin123!
INSERT INTO users (employee_id, password, first_name, last_name, email, role, is_active)
VALUES (
    '0000001',
    '$2a$12$xAoh61bFV7FiTDiv34Bp2eeTjQoCjdLgfAbXCYoEVf/I0AQ.O27ei',
    'Super',
    'Admin',
    'superadmin@hr-ktzh.kz',
    'super_admin',
    true
)
ON CONFLICT (employee_id) DO NOTHING;

-- Добавление 5 HR Super Admins
-- Пароль: 1111
INSERT INTO users (employee_id, password, first_name, last_name, email, role, created_by, is_active)
SELECT
    LPAD(i::TEXT, 7, '0'),
    '$2a$12$3UZHimHnDB4rSLWkar2kdOAU503Wll9UG4ys3HCdRTniVZNhYRQRW',
    'HR Super',
    'Admin ' || (i - 1)::TEXT,
    'hrsuper' || (i - 1)::TEXT || '@hr-ktzh.kz',
    'hr_super',
    (SELECT id FROM users WHERE employee_id = '0000001'),
    true
FROM generate_series(2, 6) AS i
ON CONFLICT (employee_id) DO NOTHING;
