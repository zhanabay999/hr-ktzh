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
        trainingType: courses.trainingType,
        programDirection: courses.programDirection,
        trainingName: courses.trainingName,
        duration: courses.duration,
        format: courses.format,
        priceWithoutVAT: courses.priceWithoutVAT,
        priceWithVAT: courses.priceWithVAT,
        providerId: courses.providerId,
        title: courses.title,
        description: courses.description,
        content: courses.content,
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

    // Validate required fields
    const { trainingType, programDirection, trainingName, duration, format } = body

    if (!trainingType || !programDirection || !trainingName || !duration || !format) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Create course
    const [newCourse] = await db
      .insert(courses)
      .values({
        trainingType,
        programDirection,
        trainingName,
        duration,
        format,
        priceWithoutVAT: body.priceWithoutVAT || null,
        priceWithVAT: body.priceWithVAT || null,
        providerId: body.providerId || null,
        title: trainingName, // Для обратной совместимости
        description: body.description || null,
        content: body.content || null,
        createdBy: session.user.id,
        isActive: true
      })
      .returning()

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
