import { auth } from '@/lib/auth'
import { db } from '@/db'
import { courses } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { canCreateCourses } from '@/lib/permissions'
import { Role } from '@/db/schema'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userRole = session.user.role as Role

    if (!canCreateCourses(userRole)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    const { id } = params

    const [deletedCourse] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning()

    if (!deletedCourse) {
      return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Курс успешно удален'
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления курса' },
      { status: 500 }
    )
  }
}
