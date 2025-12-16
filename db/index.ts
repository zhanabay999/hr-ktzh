import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

console.log('🔌 Подключение к базе данных...')
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL не установлен!')
  throw new Error('DATABASE_URL environment variable is not set')
}

// Показываем часть строки подключения (без пароля)
const dbUrl = process.env.DATABASE_URL
const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@')
console.log('📡 Подключение к:', maskedUrl)

const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })

console.log('✅ База данных подключена успешно!')
