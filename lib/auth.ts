import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'
import { loginSchema } from './validations'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        employeeId: { label: 'Табельный номер', type: 'text' },
        password: { label: 'Пароль', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Попытка входа...')
          console.log('Табельный номер:', credentials?.employeeId)

          // Validate input
          const validatedFields = loginSchema.safeParse(credentials)

          if (!validatedFields.success) {
            console.log('❌ Валидация не прошла:', validatedFields.error.errors)
            return null
          }

          const { employeeId, password } = validatedFields.data
          console.log('✅ Валидация пройдена')

          // Find user
          console.log('🔍 Поиск пользователя в БД...')
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.employeeId, employeeId))
            .limit(1)

          if (!user) {
            console.log('❌ Пользователь не найден:', employeeId)
            return null
          }

          console.log('✅ Пользователь найден:', user.employeeId, user.firstName, user.lastName)

          // Check if user is active
          if (!user.isActive) {
            console.log('❌ Пользователь неактивен')
            return null
          }

          // Verify password
          console.log('🔑 Проверка пароля...')
          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            console.log('❌ Неверный пароль')
            return null
          }

          console.log('✅ Пароль верный! Вход разрешен.')

          // Return user without password
          return {
            id: user.id,
            employeeId: user.employeeId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.employeeId = user.employeeId
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.employeeId = token.employeeId as string
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    }
  }
})

declare module 'next-auth' {
  interface User {
    id: string
    employeeId: string
    firstName: string
    lastName: string
    email: string | null
    role: string
  }

  interface Session {
    user: {
      id: string
      employeeId: string
      firstName: string
      lastName: string
      email?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    employeeId: string
    role: string
    firstName: string
    lastName: string
  }
}
