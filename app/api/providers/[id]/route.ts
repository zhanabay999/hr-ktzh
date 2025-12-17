import { auth } from '@/lib/auth'
import { db } from '@/db'
import { providers } from '@/db/schema'
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

    const [deletedProvider] = await db
      .delete(providers)
      .where(eq(providers.id, id))
      .returning()

    if (!deletedProvider) {
      return NextResponse.json({ error: 'Провайдер не найден' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Провайдер успешно удален'
    })
  } catch (error) {
    console.error('Error deleting provider:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления провайдера' },
      { status: 500 }
    )
  }
}
