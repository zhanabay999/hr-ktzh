import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canCreateCourses } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CoursesList } from '@/components/admin/CoursesList'

export default async function CoursesPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const userRole = session.user.role as Role

  if (!canCreateCourses(userRole)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Доступ запрещен
        </h2>
        <p className="text-gray-600 mb-4">
          Только HR Супер Админы могут управлять курсами
        </p>
        <Link href="/dashboard">
          <Button>Вернуться на главную</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Управление курсами</h1>
        <Link href="/admin/courses/new">
          <Button>Создать курс</Button>
        </Link>
      </div>

      <Card>
        <div className="text-sm text-gray-500 mb-4">
          Список всех курсов в системе
        </div>

        <CoursesList />
      </Card>
    </div>
  )
}
