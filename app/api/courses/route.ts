import { auth } from '@/lib/auth'
import { db } from '@/db'
import { courses } from '@/db/schema'
import { createCourseSchema } from '@/lib/validations'
import { canCreateCourses } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

// GET - List courses
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const allCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        createdBy: courses.createdBy
      })
      .from(courses)
      .orderBy(courses.createdAt)

    return NextResponse.json(allCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Ошибка получения курсов' }, { status: 500 })
  }
}

// POST - Create course
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canCreateCourses(userRole)) {
      return NextResponse.json(
        { error: 'Только HR Супер Админы могут создавать курсы' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = createCourseSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Неверные данные', details: validatedData.error.errors },
        { status: 400 }
      )
    }

    const { title, description, content } = validatedData.data

    // Create course
    const [newCourse] = await db
      .insert(courses)
      .values({
        title,
        description: description || null,
        content: content || null,
        createdBy: session.user.id,
        isActive: true
      })
      .returning({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        createdAt: courses.createdAt
      })

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Ошибка создания курса' }, { status: 500 })
  }
}

// PATCH - Update course
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canCreateCourses(userRole)) {
      return NextResponse.json(
        { error: 'Только HR Супер Админы могут редактировать курсы' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID курса не предоставлен' }, { status: 400 })
    }

    // Update course
    const [updatedCourse] = await db
      .update(courses)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(courses.id, id))
      .returning()

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
    }

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Ошибка обновления курса' }, { status: 500 })
  }
}
