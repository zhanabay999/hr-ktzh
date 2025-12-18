import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canCreateCourses } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { CreateCourseForm } from '@/components/admin/CreateCourseForm'

export default async function NewCoursePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const userRole = session.user.role as Role

  if (!canCreateCourses(userRole)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/admin/courses"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Назад
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Создать курс</h1>
      </div>

      <Card>
        <CreateCourseForm />
      </Card>
    </div>
  )
}
