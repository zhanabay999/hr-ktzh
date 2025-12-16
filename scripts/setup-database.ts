import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function setupDatabase() {
  console.log('🚀 Начинаем настройку базы данных...\n')

  try {
    // Создание ENUM типов
    console.log('1️⃣ Создание ENUM типов...')
    await sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('super_admin', 'hr_super', 'hr_central', 'hr_regional', 'hr_line', 'employee');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    await sql`
      DO $$ BEGIN
        CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    console.log('✅ ENUM типы созданы\n')

    // Создание таблицы users
    console.log('2️⃣ Создание таблицы users...')
    await sql`
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
    `
    console.log('✅ Таблица users создана\n')

    // Создание таблицы courses
    console.log('3️⃣ Создание таблицы courses...')
    await sql`
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
    `
    console.log('✅ Таблица courses создана\n')

    // Создание таблицы enrollments
    console.log('4️⃣ Создание таблицы enrollments...')
    await sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        course_id UUID NOT NULL,
        status enrollment_status NOT NULL DEFAULT 'enrolled',
        enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP
      );
    `
    console.log('✅ Таблица enrollments создана\n')

    // Добавление Super Admin
    console.log('5️⃣ Добавление Super Admin...')
    await sql`
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
    `
    console.log('✅ Super Admin добавлен (0000001)\n')

    // Добавление 5 HR Super Admins
    console.log('6️⃣ Добавление 5 HR Super Admins...')
    await sql`
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
    `
    console.log('✅ HR Super Admins добавлены (0000002-0000006)\n')

    // Обновление пароля для Super Admin на 151192
    console.log('7️⃣ Обновление пароля Super Admin на 151192...')
    await sql`
      UPDATE users
      SET password = '$2a$12$ipXCPOHz8kdE2ueoo8e6Lez2DkKFk7A16g1cIkMEADh7X6wMq31wu',
          updated_at = NOW()
      WHERE employee_id = '0000001';
    `
    console.log('✅ Пароль обновлен\n')

    // Проверка созданных пользователей
    console.log('8️⃣ Проверка созданных пользователей...')
    const users = await sql`
      SELECT employee_id, first_name, last_name, role
      FROM users
      ORDER BY employee_id;
    `
    console.log('✅ Найдено пользователей:', users.length)
    users.forEach((user: any) => {
      console.log(`   - ${user.employee_id}: ${user.first_name} ${user.last_name} (${user.role})`)
    })

    console.log('\n' + '═'.repeat(60))
    console.log('🎉 База данных успешно настроена!')
    console.log('═'.repeat(60))
    console.log('\n📋 Данные для входа:')
    console.log('━'.repeat(60))
    console.log('Super Admin:')
    console.log('  Табельный номер: 0000001')
    console.log('  Пароль: 151192')
    console.log('\nHR Super Admins:')
    console.log('  Табельные номера: 0000002 - 0000006')
    console.log('  Пароль: 1111')
    console.log('━'.repeat(60))
    console.log('\n🌐 Откройте: http://localhost:3000/login')
    console.log('\n')

  } catch (error) {
    console.error('❌ Ошибка при настройке базы данных:', error)
    process.exit(1)
  }
}

setupDatabase()
