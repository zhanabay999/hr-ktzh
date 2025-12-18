'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Role } from '@/db/schema'

interface TopBarProps {
  user: {
    firstName: string
    lastName: string
    role: Role
    employeeId: string
  }
}

export function TopBar({ user }: TopBarProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex justify-end items-center">
        <Button variant="secondary" onClick={handleSignOut}>
          Выйти
        </Button>
      </div>
    </div>
  )
}
