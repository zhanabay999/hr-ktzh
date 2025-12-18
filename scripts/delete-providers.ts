import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function deleteProviders() {
  console.log('🗑️ Удаление провайдеров...\n')

  try {
    // Удаляем всех провайдеров
    console.log('1️⃣ Удаление всех провайдеров...')
    const result = await sql`
      DELETE FROM providers
      RETURNING name
    `

    console.log(`✅ Удалено провайдеров: ${result.length}`)

    if (result.length > 0) {
      console.log('\nУдаленные провайдеры:')
      result.forEach((provider: any) => {
        console.log(`   - ${provider.name}`)
      })
    }

    console.log('\n' + '═'.repeat(60))
    console.log('🎉 Все провайдеры успешно удалены!')
    console.log('═'.repeat(60))
    console.log('\n')

  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  }
}

deleteProviders()
