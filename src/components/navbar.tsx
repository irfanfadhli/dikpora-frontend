import * as React from 'react'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { authService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'

export function Navbar() {
  const navigate = useNavigate()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(authService.isAuthenticated())

  // Listen for route changes to update auth state
  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated())
    }
    
    // Check auth on mount and when route changes
    checkAuth()
    
    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth)
    
    // Custom event for same-tab auth changes
    window.addEventListener('auth-change', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-change', checkAuth)
    }
  }, [router.state.location.pathname])

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    navigate({ to: '/login' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-neutral-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-lg group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-bold text-lg tracking-tight">DikporaRoom</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link 
              to="/" 
              className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors" 
              activeProps={{ className: 'text-neutral-900 dark:text-neutral-50 font-semibold' }} 
              activeOptions={{ exact: true }}
            >
              Explore
            </Link>
            {isAuthenticated && (
              <>
                {/* Check if user is admin or regular user */}
                {(() => {
                  const user = authService.getCurrentUser()
                  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
                  
                  return isAdmin ? (
                    <Link 
                      to="/admin/rooms" 
                      className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors" 
                      activeProps={{ className: 'text-neutral-900 dark:text-neutral-50 font-semibold' }}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to="/dashboard" 
                      className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors" 
                      activeProps={{ className: 'text-neutral-900 dark:text-neutral-50 font-semibold' }}
                    >
                      My Bookings
                    </Link>
                  )
                })()}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="rounded-full gap-2 px-6"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="rounded-full px-6">Login</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 space-y-4">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium">Explore</Link>
          {isAuthenticated && (
            <>
              {(() => {
                const user = authService.getCurrentUser()
                const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
                
                return isAdmin ? (
                  <Link to="/admin/rooms" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium">Dashboard</Link>
                ) : (
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium">My Bookings</Link>
                )
              })()}
            </>
          )}
          <hr className="border-neutral-100 dark:border-neutral-800" />
          {isAuthenticated ? (
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl">Login</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
