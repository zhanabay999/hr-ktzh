import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function updateCoursesSchema() {
  console.log('🚀 Обновление схемы таблицы курсов...\n')

  try {
    // 1. Создание новых ENUM типов
    console.log('1️⃣ Создание ENUM типов...')

    await sql`
      DO $$ BEGIN
        CREATE TYPE training_type AS ENUM ('preparation', 'retraining', 'professional_dev', 'mandatory');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    await sql`
      DO $$ BEGIN
        CREATE TYPE format AS ENUM ('online', 'offline', 'hybrid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    console.log('✅ ENUM типы созданы\n')

    // 2. Добавление новых полей в таблицу courses
    console.log('2️⃣ Добавление новых полей в courses...')

    await sql`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS training_type training_type,
      ADD COLUMN IF NOT EXISTS program_direction VARCHAR(255),
      ADD COLUMN IF NOT EXISTS training_name VARCHAR(500),
      ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
      ADD COLUMN IF NOT EXISTS format format,
      ADD COLUMN IF NOT EXISTS price_without_vat VARCHAR(50),
      ADD COLUMN IF NOT EXISTS price_with_vat VARCHAR(50)
    `
    console.log('✅ Новые поля добавлены\n')

    // 3. Обновление существующих курсов (если есть)
    console.log('3️⃣ Обновление существующих курсов...')

    await sql`
      UPDATE courses
      SET
        training_name = COALESCE(training_name, title),
        program_direction = COALESCE(program_direction, 'Не указано'),
        duration = COALESCE(duration, 'Не указано'),
        training_type = COALESCE(training_type, 'professional_dev'::training_type),
        format = COALESCE(format, 'online'::format)
      WHERE training_name IS NULL OR program_direction IS NULL OR duration IS NULL OR training_type IS NULL OR format IS NULL
    `
    console.log('✅ Существующие курсы обновлены\n')

    // 4. Проверка
    console.log('4️⃣ Проверка обновленной структуры...')
    const courses = await sql`
      SELECT
        id,
        training_name,
        program_direction,
        training_type,
        duration,
        format,
        price_without_vat,
        price_with_vat
      FROM courses
      LIMIT 5
    `
    console.log('✅ Найдено курсов:', courses.length)

    if (courses.length > 0) {
      console.log('\nПример курса:')
      console.log(courses[0])
    }

    console.log('\n' + '═'.repeat(60))
    console.log('🎉 Схема курсов успешно обновлена!')
    console.log('═'.repeat(60))
    console.log('\n📋 Новые поля:')
    console.log('━'.repeat(60))
    console.log('✅ training_type - Вид обучения')
    console.log('✅ program_direction - Направление программы')
    console.log('✅ training_name - Наименование обучающего мероприятия')
    console.log('✅ duration - Продолжительность обучения')
    console.log('✅ format - Формат')
    console.log('✅ price_without_vat - Стоимость без НДС')
    console.log('✅ price_with_vat - Стоимость с НДС')
    console.log('━'.repeat(60))
    console.log('\n')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

updateCoursesSchema()
