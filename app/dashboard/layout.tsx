import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/dashboard/Navigation'
import { Role } from '@/db/schema'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role as Role,
          employeeId: session.user.employeeId
        }}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
