import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canCreateCourses } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { SmartProviderTable } from '@/components/admin/SmartProviderTable'

export default async function ProvidersPage() {
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
          Только HR Супер Админы могут управлять провайдерами курсов
        </p>
        <Link href="/dashboard">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Вернуться на главную
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Провайдеры курсов</h1>
          <p className="text-sm text-gray-600 mt-1">
            Управление организациями и платформами, предоставляющими обучающие курсы
          </p>
        </div>
      </div>

      <Card>
        <div className="text-sm text-gray-600 mb-4">
          ✨ Умная таблица провайдеров с поиском, фильтрами и быстрым добавлением
        </div>

        <SmartProviderTable />
      </Card>
    </div>
  )
}
