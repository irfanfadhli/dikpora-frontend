import * as React from 'react'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { authService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toogle'
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";


export function Navbar() {
  const navigate = useNavigate()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(authService.isAuthenticated())
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");


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
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60 text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo-kabupaten-bantul.png" 
              alt="DikporaRoom Logo" 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <span className="font-bold text-lg tracking-tight text-foreground">RuangKita</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground hover:text-foreground transition-colors" 
              activeProps={{ className: 'text-foreground font-semibold' }} 
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
                      className="text-sm font-medium text-foreground hover:text-foreground transition-colors" 
                      activeProps={{ className: 'text-foreground font-semibold' }}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to="/dashboard" 
                      className="text-sm font-medium text-foreground hover:text-foreground transition-colors" 
                      activeProps={{ className: 'text-foreground font-semibold' }}
                    >
                      My Bookings
                    </Link>
                  )
                })()}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 md:gap-4">
              <ModeToggle />
              <div className="hidden md:flex items-center gap-4">
                {isAuthenticated ? (
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="rounded-full gap-2 px-6 hover:bg-muted text-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button variant="default" className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-accent/50"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-4 animate-in slide-in-from-top-2">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-foreground">Explore</Link>
          {isAuthenticated && (
            <>
              {(() => {
                const user = authService.getCurrentUser()
                const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
                
                return isAdmin ? (
                  <>
                    <Link to="/admin/rooms" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-foreground py-2 border-b border-border/50">Manage Rooms</Link>
                    <Link to="/admin/bookings" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-foreground py-2 border-b border-border/50">Manage Bookings</Link>
                    <Link to="/admin/users" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-foreground py-2 border-b border-border/50">Manage Users</Link>
                  </>
                ) : (
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-foreground">My Bookings</Link>
                )
              })()}
            </>
          )}
          <hr className="border-border" />
          {isAuthenticated ? (
            <Button variant="ghost" className="w-full justify-start gap-2 text-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full rounded-full">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
