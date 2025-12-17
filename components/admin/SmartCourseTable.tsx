'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Course {
  id: string
  title: string
  description: string | null
  content: string | null
  isActive: boolean
  createdAt: string
  createdBy: string
}

type SortField = 'title' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function SmartCourseTable() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Сортировка
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Редактирование
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Course>>({})
  const [saving, setSaving] = useState(false)

  // Модальное окно для просмотра контента
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterAndSortCourses()
  }, [courses, searchQuery, statusFilter, sortField, sortDirection])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Ошибка загрузки курсов')

      const data = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCourses = () => {
    let filtered = [...courses]

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      )
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course =>
        statusFilter === 'active' ? course.isActive : !course.isActive
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

    setFilteredCourses(filtered)
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

  const startEditing = (course: Course) => {
    setEditingId(course.id)
    setEditFormData({
      title: course.title,
      description: course.description,
      content: course.content
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditFormData({})
  }

  const saveCourse = async (courseId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/courses`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: courseId,
          ...editFormData
        })
      })

      if (!response.ok) throw new Error('Ошибка сохранения')

      const updatedCourse = await response.json()
      setCourses(courses.map(c => c.id === courseId ? updatedCourse : c))
      setEditingId(null)
      setEditFormData({})
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const toggleCourseStatus = async (courseId: string, currentStatus: boolean) => {
    if (!confirm(`Вы уверены, что хотите ${currentStatus ? 'деактивировать' : 'активировать'} курс?`)) {
      return
    }

    try {
      const response = await fetch(`/api/courses`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: courseId,
          isActive: !currentStatus
        })
      })

      if (!response.ok) throw new Error('Ошибка изменения статуса')

      const updatedCourse = await response.json()
      setCourses(courses.map(c => c.id === courseId ? updatedCourse : c))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка изменения статуса')
    }
  }

  const deleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить курс "${title}"? Это действие нельзя отменить.`)) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Ошибка удаления курса')

      setCourses(courses.filter(c => c.id !== courseId))
      alert('Курс успешно удален')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления курса')
    }
  }

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Загрузка...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <>
      <div className="space-y-4">
        {/* Панель фильтров */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Поиск */}
            <div>
              <Input
                type="text"
                placeholder="🔍 Поиск по названию и описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            Найдено: <span className="font-semibold">{filteredCourses.length}</span> из {courses.length} курсов
          </div>
        </div>

        {/* Таблица */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('title')}
              >
                Название {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                Дата создания {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Действия</TableHead>
            </TableHeader>
            <TableBody>
              {currentCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Курсы не найдены
                  </TableCell>
                </TableRow>
              ) : (
                currentCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {editingId === course.id ? (
                        <Input
                          type="text"
                          value={editFormData.title || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          placeholder="Название курса"
                          className="text-sm"
                        />
                      ) : (
                        course.title
                      )}
                    </TableCell>

                    <TableCell className="max-w-md">
                      {editingId === course.id ? (
                        <textarea
                          value={editFormData.description || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          placeholder="Описание курса"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows={2}
                        />
                      ) : (
                        <div className="text-gray-500 truncate">
                          {course.description || '—'}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => toggleCourseStatus(course.id, course.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${
                          course.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {course.isActive ? 'Активен' : 'Неактивен'}
                      </button>
                    </TableCell>

                    <TableCell className="text-gray-500 text-sm">
                      {new Date(course.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {editingId === course.id ? (
                          <>
                            <button
                              onClick={() => saveCourse(course.id)}
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
                              onClick={() => setViewingCourse(course)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                              👁️ Просмотр
                            </button>
                            <button
                              onClick={() => startEditing(course)}
                              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                              ✏️ Изменить
                            </button>
                            <button
                              onClick={() => deleteCourse(course.id, course.title)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              🗑️ Удалить
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

      {/* Модальное окно просмотра курса */}
      {viewingCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingCourse(null)}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{viewingCourse.title}</h2>
              <button
                onClick={() => setViewingCourse(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {viewingCourse.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Описание:</h3>
                <p className="text-gray-600">{viewingCourse.description}</p>
              </div>
            )}

            {viewingCourse.content && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Контент:</h3>
                <div className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded">
                  {viewingCourse.content}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  viewingCourse.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {viewingCourse.isActive ? 'Активен' : 'Неактивен'}
              </span>
              <span className="text-sm text-gray-500">
                Создан: {new Date(viewingCourse.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
