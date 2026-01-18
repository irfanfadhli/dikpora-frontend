import * as React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { authService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowRight } from 'lucide-react'
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
      toast.success('Access Granted', { description: 'Login Success' })
      
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
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-neutral-50 dark:bg-neutral-950">
      <Card className="w-full max-w-sm border-none shadow-2xl rounded-[32px] overflow-hidden bg-white dark:bg-neutral-900">
        <CardHeader className="pt-12 pb-8 text-center">
          <div className="w-12 h-12 bg-neutral-900 dark:bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center text-white dark:text-neutral-900 font-black text-xl">P</div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Identity Check</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mt-2">
            Secure Access Gateway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="operator@system.io" 
                required 
                className="rounded-xl h-12 bg-neutral-50 dark:bg-neutral-800 border-none px-4 focus-visible:ring-neutral-900 dark:focus-visible:ring-white transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2 pb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Password</label>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="rounded-xl h-12 bg-neutral-50 dark:bg-neutral-800 border-none px-4 focus-visible:ring-neutral-900 dark:focus-visible:ring-white transition-all shadow-sm"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs gap-2 transition-all active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute Login'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
