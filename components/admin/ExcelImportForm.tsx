'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Role } from '@/db/schema'

interface ExcelImportFormProps {
  userRole: Role
}

interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; employeeId: string; error: string }>
}

export function ExcelImportForm({ userRole }: ExcelImportFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError('Выберите файл для загрузки')
      return
    }

    setError('')
    setIsLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/users/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка импорта')
        setIsLoading(false)
        return
      }

      setResult(data)
      setIsLoading(false)

      // Если есть успешные импорты, через 3 секунды перенаправляем
      if (data.success > 0) {
        setTimeout(() => {
          router.push('/dashboard/admin/users')
          router.refresh()
        }, 3000)
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте снова.')
      setIsLoading(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
            result.failed === 0 ? 'bg-green-100' : 'bg-yellow-100'
          } mb-4`}>
            <svg className={`w-8 h-8 ${result.failed === 0 ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {result.failed === 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Импорт завершен
          </h3>

          <div className="space-y-2 mb-4">
            <p className="text-green-600 font-medium">
              Успешно создано: {result.success}
            </p>
            {result.failed > 0 && (
              <p className="text-red-600 font-medium">
                Ошибок: {result.failed}
              </p>
            )}
          </div>

          {result.success > 0 && (
            <p className="text-gray-600 text-sm">
              Перенаправление на список пользователей...
            </p>
          )}
        </div>

        {result.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="font-medium text-red-900 mb-2">
              Ошибки при импорте:
            </h4>
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-red-200">
                    <th className="text-left py-2 px-2 text-red-900">Строка</th>
                    <th className="text-left py-2 px-2 text-red-900">Табельный №</th>
                    <th className="text-left py-2 px-2 text-red-900">Ошибка</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((err, idx) => (
                    <tr key={idx} className="border-b border-red-100">
                      <td className="py-2 px-2 text-red-700">{err.row}</td>
                      <td className="py-2 px-2 text-red-700">{err.employeeId}</td>
                      <td className="py-2 px-2 text-red-700">{err.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={() => router.push('/dashboard/admin/users')}>
            Вернуться к списку пользователей
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Выберите Excel файл *
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Выбран файл: {file.name}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={!file}>
          Загрузить и импортировать
        </Button>
      </div>
    </form>
  )
}
