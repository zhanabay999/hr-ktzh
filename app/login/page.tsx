import { LoginForm } from '@/components/auth/LoginForm'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HR-KTZH</h1>
          <p className="mt-2 text-sm text-gray-600">
            Система управления персоналом
          </p>
        </div>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Вход в систему
          </h2>
          <LoginForm />
        </Card>

        <p className="mt-4 text-center text-xs text-gray-500">
          Введите ваш табельный номер и пароль для входа
        </p>
      </div>
    </div>
  )
}
