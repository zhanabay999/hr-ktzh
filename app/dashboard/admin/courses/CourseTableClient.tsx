'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Provider {
  id: string
  name: string
  isActive: boolean
}

interface Course {
  id: string
  trainingType: string | null
  programDirection: string | null
  trainingName: string | null
  duration: string | null
  format: string | null
  priceWithoutVAT: string | null
  priceWithVAT: string | null
  providerId: string | null
  title: string | null
  description: string | null
  content: string | null
  isActive: boolean
  createdAt: string
  createdBy: string
}

type SortField = 'trainingName' | 'programDirection' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function CourseTableClient() {
  const [courses, setCourses] = useState<Course[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('')
  const [trainingTypeFilter, setTrainingTypeFilter] = useState<string>('all')

  // Сортировка
  const [sortField, setSortField] = useState<SortField>('programDirection')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAndSortCourses()
  }, [courses, searchQuery, trainingTypeFilter, sortField, sortDirection])

  const fetchData = async () => {
    try {
      // Загрузка курсов и провайдеров параллельно
      const [coursesRes, providersRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/providers')
      ])

      if (!coursesRes.ok || !providersRes.ok) {
        throw new Error('Ошибка загрузки данных')
      }

      const coursesData = await coursesRes.json()
      const providersData = await providersRes.json()

      setCourses(coursesData)
      setProviders(providersData.providers || [])
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
        course.trainingName?.toLowerCase().includes(query) ||
        course.programDirection?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      )
    }

    // Фильтр по виду обучения
    if (trainingTypeFilter !== 'all') {
      filtered = filtered.filter(course => course.trainingType === trainingTypeFilter)
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else {
        aValue = aValue || ''
        bValue = bValue || ''
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

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Панель фильтров */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Поиск */}
          <div>
            <Input
              type="text"
              placeholder="🔍 Поиск по названию, направлению..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Фильтр по виду обучения */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={trainingTypeFilter}
              onChange={(e) => setTrainingTypeFilter(e.target.value)}
            >
              <option value="all">Все виды обучения</option>
              <option value="preparation">Подготовка</option>
              <option value="retraining">Переподготовка</option>
              <option value="professional_dev">Повышение квалификации</option>
              <option value="mandatory">Обязательные</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Найдено: <span className="font-semibold">{filteredCourses.length}</span> из {courses.length} курсов
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16">
                №
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[200px]"
                onClick={() => handleSort('programDirection')}
              >
                Направление программы {sortField === 'programDirection' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[300px]"
                onClick={() => handleSort('trainingName')}
              >
                Наименование обучающего мероприятия {sortField === 'trainingName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              {/* Динамические столбцы для провайдеров */}
              {providers.filter(p => p.isActive).map(provider => (
                <th
                  key={provider.id}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[150px]"
                >
                  {provider.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCourses.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + providers.filter(p => p.isActive).length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Курсы не найдены
                </td>
              </tr>
            ) : (
              currentCourses.map((course, index) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  {/* № */}
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {indexOfFirstItem + index + 1}
                  </td>

                  {/* Направление программы */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {course.programDirection || '-'}
                  </td>

                  {/* Наименование */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        {course.trainingName || course.title || '-'}
                      </div>
                      {course.description && (
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {course.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Столбцы провайдеров */}
                  {providers.filter(p => p.isActive).map(provider => (
                    <td key={provider.id} className="px-4 py-3 text-center">
                      {course.providerId === provider.id ? (
                        <div className="space-y-1">
                          <div className="text-green-600 font-semibold text-lg">✓</div>
                          {course.priceWithVAT && (
                            <div className="text-xs text-gray-900 font-medium">
                              {course.priceWithVAT}
                            </div>
                          )}
                          {course.duration && (
                            <div className="text-xs text-gray-500">
                              {course.duration}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 p-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Назад
          </Button>
          <span className="text-sm text-gray-600">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  )
}
