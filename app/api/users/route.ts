import { auth } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'
import { createUserSchema } from '@/lib/validations'
import { canManageEmployees, getRolesUserCanAssign } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

// GET - List users
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canManageEmployees(userRole)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const allUsers = await db
      .select({
        id: users.id,
        employeeId: users.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(users.createdAt)

    return NextResponse.json(allUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Ошибка получения пользователей' }, { status: 500 })
  }
}

// POST - Create user
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canManageEmployees(userRole)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = createUserSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: validatedData.error.errors },
        { status: 400 }
      )
    }

    const { employeeId, password, firstName, lastName, email, role } = validatedData.data

    // Check if user can assign this role
    const allowedRoles = getRolesUserCanAssign(userRole)
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Вы не можете назначать эту роль' },
        { status: 403 }
      )
    }

    // Check if employee ID already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.employeeId, employeeId))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким табельным номером уже существует' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        employeeId,
        password: hashedPassword,
        firstName,
        lastName,
        email: email || null,
        role,
        createdBy: session.user.id,
        isActive: true
      })
      .returning({
        id: users.id,
        employeeId: users.employeeId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Ошибка создания пользователя' }, { status: 500 })
  }
}
