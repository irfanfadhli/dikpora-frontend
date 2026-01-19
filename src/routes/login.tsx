import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { authService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await authService.login({ email, password })
      toast.success('Access Granted', { description: 'Welcome back to the system.' })
      
      // Trigger auth-change event for navbar to re-render
      window.dispatchEvent(new Event('auth-change'))
      
      // Decode JWT to get user level
      const currentUser = authService.getCurrentUser()
      if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin' ) {
        navigate({ to: '/admin/rooms' })
      } else {
        navigate({ to: '/' })
      }
    } catch (err) {
      toast.error('Authentication Failed', { description: 'Please verify your credentials.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-muted/30">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
        <Card className="border-none shadow-2xl shadow-primary/5 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
            <CardHeader className="pt-10 pb-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-2 ring-1 ring-primary/20">
                <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
                <CardDescription className="text-muted-foreground text-sm tracking-wide">
                Sign in to your account
                </CardDescription>
            </div>
            </CardHeader>
            <CardContent className="pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">Email</label>
                <Input 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="h-11 bg-background/50 border-input/60 focus:bg-background transition-all duration-200"
                />
                </div>
                <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">Password</label>
                <Input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="h-11 bg-background/50 border-input/60 focus:bg-background transition-all duration-200"
                />
                </div>
                <Button 
                type="submit" 
                className="w-full h-11 rounded-full font-medium text-sm gap-2 mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" 
                disabled={loading}
                >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
            </form>
            </CardContent>
            <CardFooter className="pb-8 pt-0 text-center justify-center">
            <p className="text-xs text-muted-foreground">
                Don't have an account? <span className="text-primary font-medium hover:underline cursor-pointer">Contact Admin</span>
            </p>
            </CardFooter>
        </Card>
        </div>
    </div>
  )
}
