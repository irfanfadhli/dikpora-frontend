import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Settings, User, DoorOpen, BookOpen, ChevronRight, LogOut, PlusCircle, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { label: 'Rooms', icon: DoorOpen, href: '/admin/rooms' },
  { label: 'Bookings', icon: Calendar, href: '/admin/bookings' },
  { label: 'Users', icon: Users, href: '/admin/users' },
]

export function AdminSidebar() {
  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border h-[calc(100vh-64px)] p-6 sticky top-16 hidden lg:flex flex-col">
      <div className="space-y-1 mb-10">
        <h2 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Management</h2>
        {sidebarItems.map((item) => (
          <Link 
            key={item.href}
            to={item.href} 
            className="flex items-center justify-between p-3 rounded-2xl text-sm font-bold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all group"
            activeProps={{ className: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' }}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <div className="mt-auto">
        <div className="p-4 bg-sidebar-accent/50 rounded-3xl border border-sidebar-border">
          <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 text-center">Need Help?</div>
          <Button variant="outline" className="w-full rounded-2xl text-[10px] font-bold uppercase tracking-widest h-10 border-2">Documentation</Button>
        </div>
      </div>
    </div>
  )
}
