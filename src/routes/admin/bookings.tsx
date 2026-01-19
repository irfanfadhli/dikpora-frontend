import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/lib/services'
import { Booking } from '@/lib/types'
import { AdminSidebar } from '@/components/admin-sidebar'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  User as UserIcon, 
  Mail, 
  Phone,
  CheckCircle2,
  Clock4,
  XCircle,
  MoreVertical,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/bookings')({
  component: AdminBookings,
})

function AdminBookings() {
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState('')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => bookingService.getBookings()
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => bookingService.updateBooking(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      toast.success('Booking status updated')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookingService.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      toast.success('Booking removed')
    }
  })

  const filteredBookings = bookings?.filter(b => 
    b.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    b.room_id.includes(search)
  ) || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-none">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-none">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-none">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase mb-1">Reservation Ledger</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Global Schedule Tracking & Auditing</p>
          </div>
          <div className="flex items-center gap-4 bg-muted/50 p-1.5 rounded-2xl border border-border shadow-sm">
            <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 h-10">Active</Button>
            <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 h-10 text-muted-foreground">Archived</Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by guest or room hex code..." 
              className="border-none shadow-none focus-visible:ring-0 bg-transparent text-sm h-10 text-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14">Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14">Space Code</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14">Time Signature</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14">Current Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14 text-right">Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={5} className="h-20 px-6"><div className="h-4 bg-muted rounded-full w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBookings.map(booking => (
                <TableRow key={booking.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-black uppercase tracking-tight text-sm text-foreground">{booking.guest_name}</span>
                      <div className="flex items-center gap-2 mt-1 opacity-50 font-bold text-[9px] uppercase tracking-widest">
                        <Mail className="w-2.5 h-2.5" /> {booking.guest_email || 'n/a'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <code className="bg-muted px-2 py-1 rounded-lg text-[10px] font-bold text-muted-foreground">
                      {booking.room_id.substring(0, 8)}
                    </code>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/70">
                        <CalendarIcon className="w-3 h-3" /> {booking.booking_date}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" /> {booking.start_time}-{booking.end_time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <select 
                        value={booking.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: booking.id, status: e.target.value })}
                        className="bg-muted border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-3 py-1.5 focus:ring-2 focus:ring-ring outline-none appearance-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                      <Button variant="ghost" size="icon" onClick={() => { if(confirm('Purge record?')) deleteMutation.mutate(booking.id) }} className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all opacity-0 group-hover:opacity-100">
                        <XCircle className="w-3.5 h-3.5 text-neutral-300" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredBookings.length === 0 && (
            <div className="p-20 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">Zero Log Records</div>
          )}
        </div>
      </div>
    </div>
  )
}
