'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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

type SortField = 'employeeId' | 'firstName' | 'role' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function SmartUserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Сортировка
  const [sortField, setSortField] = useState<SortField>('employeeId')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Редактирование
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<User>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Ошибка загрузки пользователей')

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    let filtered = [...users]

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        user.employeeId.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        getRoleDisplayName(user.role).toLowerCase().includes(query)
      )
    }

    // Фильтр по роли
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const startEditing = (user: User) => {
    setEditingId(user.id)
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const saveUser = async (userId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (!response.ok) throw new Error('Ошибка сохранения')

      const updatedUser = await response.json()
      setUsers(users.map(u => u.id === userId ? updatedUser : u))
      setEditingId(null)
      setEditFormData({})
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Вы уверены, что хотите ${currentStatus ? 'деактивировать' : 'активировать'} пользователя?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Ошибка изменения статуса')

      const updatedUser = await response.json()
      setUsers(users.map(u => u.id === userId ? updatedUser : u))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка изменения статуса')
    }
  }

  const resetPassword = async (userId: string, employeeId: string) => {
    const newPassword = prompt(`Введите новый пароль для пользователя ${employeeId}:`)
    if (!newPassword) return

    if (newPassword.length < 4) {
      alert('Пароль должен быть минимум 4 символа')
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      })

      if (!response.ok) throw new Error('Ошибка сброса пароля')

      alert('Пароль успешно изменен!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сброса пароля')
    }
  }

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <div className="space-y-4">
      {/* Панель фильтров */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Поиск */}
          <div>
            <Input
              type="text"
              placeholder="🔍 Поиск по всем полям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Фильтр по роли */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Все роли</option>
              <option value="super_admin">Супер Админ</option>
              <option value="hr_super">HR Супер</option>
              <option value="hr_central">HR Центральный</option>
              <option value="hr_regional">HR Региональный</option>
              <option value="hr_line">HR Линейный</option>
              <option value="employee">Сотрудник</option>
            </select>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Найдено: <span className="font-semibold">{filteredUsers.length}</span> из {users.length} пользователей
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('employeeId')}
            >
              Табельный № {sortField === 'employeeId' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('firstName')}
            >
              ФИО {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('role')}
            >
              Роль {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Статус</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('createdAt')}
            >
              Дата {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Действия</TableHead>
          </TableHeader>
          <TableBody>
            {currentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.employeeId}</TableCell>

                  <TableCell>
                    {editingId === user.id ? (
                      <div className="space-y-1">
                        <Input
                          type="text"
                          value={editFormData.firstName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                          placeholder="Имя"
                          className="text-sm"
                        />
                        <Input
                          type="text"
                          value={editFormData.lastName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                          placeholder="Фамилия"
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      `${user.firstName} ${user.lastName}`
                    )}
                  </TableCell>

                  <TableCell>
                    {editingId === user.id ? (
                      <Input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        placeholder="Email"
                        className="text-sm"
                      />
                    ) : (
                      user.email || '—'
                    )}
                  </TableCell>

                  <TableCell>
                    {editingId === user.id ? (
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        value={editFormData.role || user.role}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Role })}
                      >
                        <option value="employee">Сотрудник</option>
                        <option value="hr_line">HR Линейный</option>
                        <option value="hr_regional">HR Региональный</option>
                        <option value="hr_central">HR Центральный</option>
                        <option value="hr_super">HR Супер</option>
                        <option value="super_admin">Супер Админ</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getRoleDisplayName(user.role)}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </button>
                  </TableCell>

                  <TableCell className="text-gray-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>

                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => saveUser(user.id)}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            {saving ? '...' : '✓ Сохранить'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                          >
                            ✕ Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(user)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            ✏️ Изменить
                          </button>
                          <button
                            onClick={() => resetPassword(user.id, user.employeeId)}
                            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                          >
                            🔑 Пароль
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед →
          </Button>
        </div>
      )}
    </div>
  )
}
