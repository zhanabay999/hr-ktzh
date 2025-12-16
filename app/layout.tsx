import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HR-KTZH - Система управления персоналом',
  description: 'HR система для управления сотрудниками и курсами'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  )
}
