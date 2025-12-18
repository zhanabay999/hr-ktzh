import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canManageEmployees } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { CreateUserForm } from '@/components/admin/CreateUserForm'

export default async function NewUserPage() {
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
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/admin/users"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Назад
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Добавить пользователя</h1>
      </div>

      <Card>
        <CreateUserForm userRole={userRole} />
      </Card>
    </div>
  )
}
