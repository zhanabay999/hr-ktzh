import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function addProviders() {
  console.log('🚀 Добавление таблицы провайдеров...\n')

  try {
    // Создание таблицы providers
    console.log('1️⃣ Создание таблицы providers...')
    await sql`
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
      )
    `
    console.log('✅ Таблица providers создана\n')

    // Добавление поля provider_id в таблицу courses
    console.log('2️⃣ Добавление поля provider_id в courses...')
    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS provider_id UUID
    `
    console.log('✅ Поле provider_id добавлено\n')

    // Добавление примеров провайдеров
    console.log('3️⃣ Добавление примеров провайдеров...')

    const superAdmin = await sql`SELECT id FROM users WHERE employee_id = '0000001' LIMIT 1`
    const creatorId = superAdmin[0]?.id

    if (!creatorId) {
      console.log('⚠️ Super Admin не найден, пропускаем добавление примеров')
    } else {
      await sql`
        INSERT INTO providers (name, description, website, contact_email, is_active, created_by)
        VALUES
          ('Coursera', 'Онлайн-платформа для обучения с курсами от ведущих университетов', 'https://www.coursera.org', 'info@coursera.org', true, ${creatorId}),
          ('Udemy', 'Глобальная платформа онлайн-обучения с тысячами курсов', 'https://www.udemy.com', 'support@udemy.com', true, ${creatorId}),
          ('LinkedIn Learning', 'Профессиональные курсы для развития карьеры', 'https://www.linkedin.com/learning', 'help@linkedin.com', true, ${creatorId}),
          ('edX', 'Некоммерческая платформа онлайн-обучения', 'https://www.edx.org', 'info@edx.org', true, ${creatorId}),
          ('Stepik', 'Образовательная платформа и конструктор курсов', 'https://stepik.org', 'hello@stepik.org', true, ${creatorId})
        ON CONFLICT (name) DO NOTHING
      `
      console.log('✅ Примеры провайдеров добавлены\n')
    }

    // Проверка
    console.log('4️⃣ Проверка созданных провайдеров...')
    const providers = await sql`
      SELECT id, name, is_active
      FROM providers
      ORDER BY name
    `
    console.log('✅ Найдено провайдеров:', providers.length)
    providers.forEach((provider: any) => {
      console.log(`   - ${provider.name} (${provider.is_active ? 'Активен' : 'Неактивен'})`)
    })

    console.log('\n' + '═'.repeat(60))
    console.log('🎉 Таблица провайдеров успешно добавлена!')
    console.log('═'.repeat(60))
    console.log('\n📋 Теперь доступно:')
    console.log('━'.repeat(60))
    console.log('✅ Таблица providers создана')
    console.log('✅ Поле provider_id добавлено в courses')
    console.log('✅ Добавлены примеры провайдеров')
    console.log('━'.repeat(60))
    console.log('\n🌐 Откройте: http://localhost:3000/admin/providers')
    console.log('\n')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

addProviders()
