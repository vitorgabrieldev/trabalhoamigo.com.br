'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { meApi } from '@/lib/api'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { hydrate, setUser, accessToken } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!accessToken) return
    meApi.getProfile()
      .then((r) => setUser(r.data))
      .catch(() => {})
  }, [accessToken, setUser])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="hidden lg:flex lg:shrink-0">
        <DashboardSidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
