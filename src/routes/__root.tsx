import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Navbar } from '@/components/navbar'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <Navbar />

      <main>
        <Outlet />
      </main>
      
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  )
}
