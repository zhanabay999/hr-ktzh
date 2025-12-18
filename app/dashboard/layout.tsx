import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        user={{
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          role: session.user.role as Role,
          employeeId: session.user.employeeId
        }}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with logout */}
        <TopBar
          user={{
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            role: session.user.role as Role,
            employeeId: session.user.employeeId
          }}
        />

        {/* Page content */}
        <main className="flex-1 px-8 py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
