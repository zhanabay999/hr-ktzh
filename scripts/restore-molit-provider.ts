import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function restoreMolITProvider() {
  console.log('🔄 Восстановление провайдера MolIT...\n')

  try {
    // Получаем ID супер админа для created_by
    console.log('1️⃣ Поиск супер админа...')
    const admin = await sql`
      SELECT id FROM users WHERE role = 'super_admin' LIMIT 1
    `

    if (admin.length === 0) {
      throw new Error('Супер админ не найден')
    }

    const adminId = admin[0].id

    // Восстанавливаем только MolIT провайдер
    console.log('2️⃣ Добавление MolIT провайдера...')
    const result = await sql`
      INSERT INTO providers (name, website, description, is_active, created_by, created_at, updated_at)
      VALUES (
        'MolIT',
        'https://molit.kz',
        'Министерство цифрового развития, инноваций и аэрокосмической промышленности РК',
        true,
        ${adminId},
        NOW(),
        NOW()
      )
      RETURNING name
    `

    console.log(`✅ Провайдер восстановлен: ${result[0].name}`)

    console.log('\n' + '═'.repeat(60))
    console.log('🎉 Провайдер MolIT успешно восстановлен!')
    console.log('═'.repeat(60))
    console.log('\n')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

restoreMolITProvider()
