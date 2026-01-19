import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/lib/services'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  CheckCircle2,
  Clock4,
  XCircle,
  LayoutDashboard
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
          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-200 shadow-none">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-200 shadow-none">
            <Clock4 className="w-3.5 h-3.5 mr-1.5" />
            Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="secondary" className="text-muted-foreground shadow-none">
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-muted/10 animate-appear">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">My Dashboard</h1>
                <p className="text-muted-foreground">Manage your reservations and activity.</p>
            </div>
        </div>

        {/* My Bookings */}
        <Card className="border-border/60 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/40">
            <CardTitle className="text-xl font-bold">Recent Bookings</CardTitle>
            <Badge variant="secondary" className="px-3">
              {myBookings?.length || 0} Total
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            {bookingsLoading ? (
                <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/20 animate-pulse">
                        <div className="w-12 h-12 rounded-lg bg-muted-foreground/10" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-muted-foreground/10 rounded" />
                            <div className="h-3 w-1/4 bg-muted-foreground/10 rounded" />
                        </div>
                    </div>
                ))}
                </div>
            ) : myBookings && myBookings.length > 0 ? (
                <div className="space-y-4">
                {myBookings.map(booking => (
                    <div 
                    key={booking.id}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 bg-card hover:bg-muted/30 hover:border-border transition-all duration-200"
                    >
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between md:justify-start md:gap-4">
                            <h3 className="font-semibold text-lg text-foreground">{booking.guest_name}</h3>
                            {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs bg-background/50">
                                    {booking.room_id.substring(0, 8)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CalendarIcon className="w-4 h-4 text-primary/70" />
                                <span className="font-medium">{booking.booking_date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-primary/70" />
                                <span>{booking.start_time} - {booking.end_time}</span>
                            </div>
                        </div>
                        
                        {booking.purpose && (
                        <p className="text-sm text-foreground/80 pl-1 border-l-2 border-primary/20">
                            {booking.purpose}
                        </p>
                        )}
                    </div>

                    {booking.status === 'pending' && (
                        <div className="flex items-center pt-2 md:pt-0">
                            <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                if (confirm('Cancel this booking?')) {
                                cancelBookingMutation.mutate(booking.id)
                                }
                            }}
                            className="w-full md:w-auto shadow-sm"
                            >
                            Cancel
                            </Button>
                        </div>
                    )}
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <CalendarIcon className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-foreground">No bookings found</p>
                    <p className="text-sm max-w-sm mt-1 mb-6">You haven't made any room reservations yet.</p>
                    <Button onClick={() => window.location.href = '/'}>
                        Browse Rooms
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
