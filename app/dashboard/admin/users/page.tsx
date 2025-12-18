import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canManageEmployees } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SmartUserTable } from '@/components/admin/SmartUserTable'

export default async function UsersPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const userRole = session.user.role as Role

  if (!canManageEmployees(userRole)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
        <div className="flex space-x-3">
          <Link href="/dashboard/admin/users/import">
            <Button variant="secondary">Импорт из Excel</Button>
          </Link>
          <Link href="/dashboard/admin/users/new">
            <Button>Добавить пользователя</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="text-sm text-gray-600 mb-4 flex items-center justify-between">
          <span>✨ Умная таблица пользователей с поиском, фильтрами и редактированием</span>
        </div>

        <SmartUserTable />
      </Card>
    </div>
  )
}
