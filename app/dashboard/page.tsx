import { auth } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { getRoleDisplayName, isSuperAdmin, isHRSuper, canCreateCourses } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { db } from '@/db'
import { users, courses } from '@/db/schema'
import { count, eq } from 'drizzle-orm'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    return null
  }

  const userRole = session.user.role as Role

  // Get statistics
  const [usersCount] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true))
  const [coursesCount] = await db.select({ count: count() }).from(courses).where(eq(courses.isActive, true))

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Добро пожаловать, {session.user.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Ваша роль: {getRoleDisplayName(userRole)}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-gray-500">Всего пользователей</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{usersCount.count}</p>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500">Всего курсов</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{coursesCount.count}</p>
        </Card>
      </div>

      {/* Role-based information */}
      <Card title="Ваши возможности">
        <div className="space-y-3">
          {isSuperAdmin(userRole) && (
            <>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Назначение HR Супер админов
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Управление всеми пользователями
                </p>
              </div>
            </>
          )}

          {isHRSuper(userRole) && (
            <>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Создание и управление курсами
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">
                  Назначение HR Центральных админов
                </p>
              </div>
            </>
          )}

          {!isSuperAdmin(userRole) && !isHRSuper(userRole) && (
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                Управление сотрудниками
              </p>
            </div>
          )}

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-700">
              Импорт сотрудников из Excel
            </p>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <Card title="Быстрые действия">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users/new"
            className="block p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h4 className="font-medium text-gray-900">Добавить пользователя</h4>
            <p className="mt-1 text-sm text-gray-500">
              Создать нового пользователя в системе
            </p>
          </a>

          <a
            href="/admin/users/import"
            className="block p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h4 className="font-medium text-gray-900">Импорт из Excel</h4>
            <p className="mt-1 text-sm text-gray-500">
              Массовая загрузка пользователей
            </p>
          </a>

          {canCreateCourses(userRole) && (
            <a
              href="/admin/courses/new"
              className="block p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900">Создать курс</h4>
              <p className="mt-1 text-sm text-gray-500">
                Добавить новый обучающий курс
              </p>
            </a>
          )}
        </div>
      </Card>
    </div>
  )
}
