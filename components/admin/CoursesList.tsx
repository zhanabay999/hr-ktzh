'use client'

import { useEffect, useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string | null
  isActive: boolean
  createdAt: string
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')

      if (!response.ok) {
        throw new Error('Ошибка загрузки курсов')
      }

      const data = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Загрузка курсов...
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

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Курсы не найдены</p>
        <Link
          href="/admin/courses/new"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Создать первый курс
        </Link>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableHead>Название</TableHead>
        <TableHead>Описание</TableHead>
        <TableHead>Статус</TableHead>
        <TableHead>Дата создания</TableHead>
        <TableHead>Действия</TableHead>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell className="font-medium">{course.title}</TableCell>
            <TableCell className="text-gray-500 max-w-md truncate">
              {course.description || '—'}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  course.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {course.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </TableCell>
            <TableCell className="text-gray-500">
              {new Date(course.createdAt).toLocaleDateString('ru-RU')}
            </TableCell>
            <TableCell>
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Редактировать
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
