'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Role } from '@/db/schema'
import { canAccessAdminPanel, canCreateCourses, getRoleDisplayName } from '@/lib/permissions'

interface NavigationProps {
  user: {
    firstName: string
    lastName: string
    role: Role
    employeeId: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        href={href}
        className={`px-4 py-2 rounded-md transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {children}
      </Link>
    )
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              HR-KTZH
            </Link>

            {canAccessAdminPanel(user.role) && (
              <div className="flex space-x-2">
                <NavLink href="/dashboard">Главная</NavLink>
                <NavLink href="/dashboard/admin/users">Пользователи</NavLink>
                {canCreateCourses(user.role) && (
                  <>
                    <NavLink href="/dashboard/admin/providers">Провайдеры</NavLink>
                    <NavLink href="/dashboard/admin/courses">Курсы</NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-gray-500">
                {getRoleDisplayName(user.role)} • {user.employeeId}
              </p>
            </div>
            <Button variant="secondary" onClick={handleSignOut}>
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
