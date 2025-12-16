import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function updatePasswords() {
  console.log('🔄 Обновление паролей HR Super Admins...\n')

  try {
    // Обновляем пароли
    await sql`
      UPDATE users
      SET password = '$2a$12$3UZHimHnDB4rSLWkar2kdOAU503Wll9UG4ys3HCdRTniVZNhYRQRW',
          updated_at = NOW()
      WHERE employee_id IN ('0000002', '0000003', '0000004', '0000005', '0000006')
    `

    console.log('✅ Пароли обновлены\n')

    // Проверяем обновленных пользователей
    const users = await sql`
      SELECT employee_id, first_name, last_name, role
      FROM users
      WHERE employee_id IN ('0000002', '0000003', '0000004', '0000005', '0000006')
      ORDER BY employee_id
    `

    console.log('📋 Обновленные пользователи:')
    users.forEach((u: any) => {
      console.log(`  - ${u.employee_id}: ${u.first_name} ${u.last_name} (${u.role})`)
    })

    console.log('\n' + '═'.repeat(60))
    console.log('✅ Готово! Новый пароль для HR Super Admins: 1111')
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
    console.log('\n')

  } catch (error) {
    console.error('❌ Ошибка при обновлении паролей:', error)
    process.exit(1)
  }
}

updatePasswords()
