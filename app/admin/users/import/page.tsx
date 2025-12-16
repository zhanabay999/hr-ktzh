import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { canImportExcel } from '@/lib/permissions'
import { Role } from '@/db/schema'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { ExcelImportForm } from '@/components/admin/ExcelImportForm'

export default async function ImportUsersPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const userRole = session.user.role as Role

  if (!canImportExcel(userRole)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/users"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Назад
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Импорт пользователей из Excel</h1>
      </div>

      <Card>
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Формат файла</h3>
          <p className="text-sm text-gray-600 mb-4">
            Excel файл должен содержать следующие колонки:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm">
            <ul className="space-y-2">
              <li><strong>employeeId</strong> — 7-значный табельный номер</li>
              <li><strong>firstName</strong> — Имя</li>
              <li><strong>lastName</strong> — Фамилия</li>
              <li><strong>email</strong> — Email (необязательно)</li>
              <li><strong>password</strong> — Пароль (минимум 8 символов)</li>
              <li><strong>role</strong> — Роль (hr_super, hr_central, hr_regional, hr_line, employee)</li>
            </ul>
          </div>
        </div>

        <ExcelImportForm userRole={userRole} />
      </Card>
    </div>
  )
}
