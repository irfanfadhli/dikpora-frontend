import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  CheckCircle2,
  Clock4,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/')({
  component: UserDashboard,
})

function UserDashboard() {
  const queryClient = useQueryClient()

  const { data: myBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMyBookings()
  })

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => bookingService.updateBooking(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      toast.success('Booking cancelled')
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
            <Clock4 className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-neutral-100 text-neutral-400 border-neutral-200 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight uppercase mb-2">My Bookings</h1>
          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Your Reservation History</p>
        </div>

        {/* My Bookings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black tracking-tight uppercase">Reservations</h2>
            <Badge variant="outline" className="rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {myBookings?.length || 0} Total
            </Badge>
          </div>

          {bookingsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-neutral-900 rounded-[32px] h-32 animate-pulse" />
              ))}
            </div>
          ) : myBookings && myBookings.length > 0 ? (
            <div className="space-y-4">
              {myBookings.map(booking => (
                <div 
                  key={booking.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-black uppercase tracking-tight mb-1">{booking.guest_name}</h3>
                          <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg text-[10px] font-bold text-neutral-400">
                            Room: {booking.room_id.substring(0, 8)}
                          </code>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {booking.booking_date}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.start_time} - {booking.end_time}
                        </div>
                      </div>
                      
                      {booking.purpose && (
                        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                          <span className="font-bold">Purpose:</span> {booking.purpose}
                        </p>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (confirm('Cancel this booking?')) {
                            cancelBookingMutation.mutate(booking.id)
                          }
                        }}
                        className="rounded-2xl h-10 px-6 font-bold uppercase tracking-widest text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-20 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">No Bookings Yet</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Visit the home page to browse and book rooms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
