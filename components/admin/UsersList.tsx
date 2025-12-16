'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { getRoleDisplayName } from '@/lib/permissions'
import { Role } from '@/db/schema'

interface User {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string | null
  role: Role
  isActive: boolean
  createdAt: string
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')

      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей')
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Загрузка пользователей...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Пользователи не найдены
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableHead>Табельный №</TableHead>
        <TableHead>ФИО</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Роль</TableHead>
        <TableHead>Статус</TableHead>
        <TableHead>Дата создания</TableHead>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.employeeId}</TableCell>
            <TableCell>
              {user.firstName} {user.lastName}
            </TableCell>
            <TableCell className="text-gray-500">
              {user.email || '—'}
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getRoleDisplayName(user.role)}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </TableCell>
            <TableCell className="text-gray-500">
              {new Date(user.createdAt).toLocaleDateString('ru-RU')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
