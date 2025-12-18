'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type Provider = {
  id: string
  name: string
  isActive: boolean
}

export function CreateCourseForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])

  const [formData, setFormData] = useState({
    trainingType: '',
    programDirection: '',
    trainingName: '',
    duration: '',
    format: '',
    priceWithoutVAT: '',
    priceWithVAT: '',
    providerId: '',
    description: '',
    content: ''
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Загрузка списка провайдеров
  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        if (data.providers) {
          setProviders(data.providers.filter((p: Provider) => p.isActive))
        }
      })
      .catch(err => console.error('Ошибка загрузки провайдеров:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setIsLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          const errors: Record<string, string> = {}
          data.details.forEach((err: any) => {
            errors[err.path[0]] = err.message
          })
          setFieldErrors(errors)
        } else {
          setError(data.error || 'Ошибка создания курса')
        }
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/admin/courses')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError('Произошла ошибка. Попробуйте снова.')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Курс создан!
        </h3>
        <p className="text-gray-600">
          Перенаправление на список курсов...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Вид обучения */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Вид обучения *
        </label>
        <select
          name="trainingType"
          value={formData.trainingType}
          onChange={handleChange}
          disabled={isLoading}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Выберите вид обучения</option>
          <option value="preparation">Подготовка</option>
          <option value="retraining">Переподготовка</option>
          <option value="professional_dev">Повышение квалификации</option>
          <option value="mandatory">Обязательные</option>
        </select>
        {fieldErrors.trainingType && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.trainingType}</p>
        )}
      </div>

      {/* Направление программы */}
      <div>
        <Input
          label="Направление программы *"
          name="programDirection"
          type="text"
          value={formData.programDirection}
          onChange={handleChange}
          error={fieldErrors.programDirection}
          placeholder="Например: HR-менеджмент, Финансы, IT"
          disabled={isLoading}
          required
        />
      </div>

      {/* Наименование обучающего мероприятия */}
      <div>
        <Input
          label="Наименование обучающего мероприятия *"
          name="trainingName"
          type="text"
          value={formData.trainingName}
          onChange={handleChange}
          error={fieldErrors.trainingName}
          placeholder="Полное название курса или мероприятия"
          disabled={isLoading}
          required
        />
      </div>

      {/* Провайдер */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Провайдер курса
        </label>
        <select
          name="providerId"
          value={formData.providerId}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Не указан</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        {fieldErrors.providerId && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.providerId}</p>
        )}
      </div>

      {/* Продолжительность обучения */}
      <div>
        <Input
          label="Продолжительность обучения *"
          name="duration"
          type="text"
          value={formData.duration}
          onChange={handleChange}
          error={fieldErrors.duration}
          placeholder="Например: 40 часов, 2 недели, 3 месяца"
          disabled={isLoading}
          required
        />
      </div>

      {/* Формат */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Формат *
        </label>
        <select
          name="format"
          value={formData.format}
          onChange={handleChange}
          disabled={isLoading}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Выберите формат</option>
          <option value="online">Онлайн</option>
          <option value="offline">Офлайн</option>
          <option value="hybrid">Гибридный</option>
        </select>
        {fieldErrors.format && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.format}</p>
        )}
      </div>

      {/* Стоимость без НДС */}
      <div>
        <Input
          label="Стоимость обучения без НДС"
          name="priceWithoutVAT"
          type="text"
          value={formData.priceWithoutVAT}
          onChange={handleChange}
          error={fieldErrors.priceWithoutVAT}
          placeholder="Например: 50000 ₸ или Бесплатно"
          disabled={isLoading}
        />
      </div>

      {/* Стоимость с НДС */}
      <div>
        <Input
          label="Стоимость обучения с НДС"
          name="priceWithVAT"
          type="text"
          value={formData.priceWithVAT}
          onChange={handleChange}
          error={fieldErrors.priceWithVAT}
          placeholder="Например: 60000 ₸ или Бесплатно"
          disabled={isLoading}
        />
      </div>

      {/* Дополнительная информация */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Дополнительная информация</h3>

        <div className="space-y-4">
          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Краткое описание курса..."
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          {/* Содержание курса */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Содержание курса
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Полное содержание курса, материалы, задания..."
              disabled={isLoading}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
            />
            {fieldErrors.content && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.content}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Вы можете использовать Markdown для форматирования
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 border-t pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Создать курс
        </Button>
      </div>
    </form>
  )
}
