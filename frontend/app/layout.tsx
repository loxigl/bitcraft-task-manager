import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'BitCraft Task Manager',
  description: 'Guild task management system for BitCraft',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  )
}
