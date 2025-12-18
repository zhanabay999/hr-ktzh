'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getRolesUserCanAssign, getRoleDisplayName } from '@/lib/permissions'
import { Role } from '@/db/schema'

interface CreateUserFormProps {
  userRole: Role
}

export function CreateUserForm({ userRole }: CreateUserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee' as Role
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const allowedRoles = getRolesUserCanAssign(userRole)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setIsLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/users', {
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
          setError(data.error || 'Ошибка создания пользователя')
        }
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/admin/users')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError('Произошла ошибка. Попробуйте снова.')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          Пользователь создан!
        </h3>
        <p className="text-gray-600">
          Перенаправление на список пользователей...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Табельный номер *"
            name="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={handleChange}
            error={fieldErrors.employeeId}
            placeholder="0000007"
            maxLength={7}
            disabled={isLoading}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            7-значный числовой код
          </p>
        </div>

        <div>
          <Input
            label="Пароль *"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="••••••••"
            disabled={isLoading}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Минимум 8 символов, включая заглавную букву и цифру
          </p>
        </div>

        <div>
          <Input
            label="Имя *"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            error={fieldErrors.firstName}
            placeholder="Иван"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Input
            label="Фамилия *"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            error={fieldErrors.lastName}
            placeholder="Иванов"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="ivanov@example.com"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Необязательное поле
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Роль *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {allowedRoles.map((role) => (
              <option key={role} value={role}>
                {getRoleDisplayName(role)}
              </option>
            ))}
          </select>
          {fieldErrors.role && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>
          )}
        </div>
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
        <Button type="submit" isLoading={isLoading}>
          Создать пользователя
        </Button>
      </div>
    </form>
  )
}
