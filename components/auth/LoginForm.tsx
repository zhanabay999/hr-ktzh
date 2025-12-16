'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { loginSchema } from '@/lib/validations'

export function LoginForm() {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ employeeId?: string; password?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setIsLoading(true)

    try {
      // Validate input
      const result = loginSchema.safeParse({ employeeId, password })

      if (!result.success) {
        const errors: { employeeId?: string; password?: string } = {}
        result.error.issues.forEach((issue) => {
          if (issue.path[0] === 'employeeId' || issue.path[0] === 'password') {
            errors[issue.path[0]] = issue.message
          }
        })
        setFieldErrors(errors)
        setIsLoading(false)
        return
      }

      // Attempt sign in
      const response = await signIn('credentials', {
        employeeId,
        password,
        redirect: false
      })

      if (response?.error) {
        setError('Неверный табельный номер или пароль')
        setIsLoading(false)
        return
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      setError('Произошла ошибка. Попробуйте снова.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Табельный номер"
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          error={fieldErrors.employeeId}
          placeholder="0000001"
          maxLength={7}
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <Input
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          placeholder="••••••••"
          disabled={isLoading}
          required
        />
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Войти
      </Button>
    </form>
  )
}
