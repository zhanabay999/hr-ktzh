'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Role } from '@/db/schema'
import { canAccessAdminPanel, canCreateCourses, getRoleDisplayName } from '@/lib/permissions'
import { useState } from 'react'

interface SidebarProps {
  user: {
    firstName: string
    lastName: string
    role: Role
    employeeId: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [isCourseCatalogOpen, setIsCourseCatalogOpen] = useState(true)

  const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon?: string }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link
        href={href}
        className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {icon && <span className="mr-3">{icon}</span>}
        {children}
      </Link>
    )
  }

  const SectionHeader = ({ children, onClick, isOpen }: { children: React.ReactNode; onClick?: () => void; isOpen?: boolean }) => {
    return (
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-md"
      >
        <span>{children}</span>
        {onClick && (
          <span className="text-gray-500">
            {isOpen ? '▼' : '▶'}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {getRoleDisplayName(user.role)}
            </p>
            <p className="text-xs text-gray-400">
              ID: {user.employeeId}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Главная */}
        <NavLink href="/dashboard" icon="🏠">
          Главная
        </NavLink>

        {/* Управление пользователями */}
        {canAccessAdminPanel(user.role) && (
          <NavLink href="/dashboard/admin/users" icon="👥">
            Пользователи
          </NavLink>
        )}

        {/* Каталог курсов (только для HR Super) */}
        {canCreateCourses(user.role) && (
          <div className="space-y-1">
            <SectionHeader
              onClick={() => setIsCourseCatalogOpen(!isCourseCatalogOpen)}
              isOpen={isCourseCatalogOpen}
            >
              📚 Каталог курсов
            </SectionHeader>

            {isCourseCatalogOpen && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                <NavLink href="/dashboard/admin/courses" icon="📖">
                  Посмотреть все курсы
                </NavLink>
                <NavLink href="/dashboard/admin/providers" icon="🏢">
                  Добавить провайдера
                </NavLink>
                <NavLink href="/dashboard/admin/courses/new" icon="➕">
                  Добавить курс
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          HR-KTZH System
          <br />
          v1.0.0
        </div>
      </div>
    </aside>
  )
}
