import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/lib/services'
import { Room, Booking } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react'
import { format, addDays, isBefore, isAfter, startOfDay, parseISO } from 'date-fns'
import { toast } from 'sonner'

// CONFIGURABLE: Maximum days in advance for booking (change this value to adjust booking window)
const MAX_BOOKING_DAYS = 7

// CONFIGURABLE: Session configuration
const SESSIONS = [
  { id: '1', label: 'Sesi 1 (07:30 - 12:15)', startTime: '07:30', endTime: '12:15' },
  { id: '2', label: 'Sesi 2 (13:00 - 15:00)', startTime: '13:00', endTime: '15:00' },
  { id: '3', label: 'Full Day (07:30 - 15:00)', startTime: '07:30', endTime: '15:00' },
]

interface BookingModalProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingModal({ room, open, onOpenChange }: BookingModalProps) {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [startTime, setStartTime] = React.useState<string | null>(null)
  const [endTime, setEndTime] = React.useState<string | null>(null)
  const [step, setStep] = React.useState<'date' | 'time' | 'form' | 'success'>('date')
  
  // Form state
  const [guestName, setGuestName] = React.useState('')
  const [guestEmail, setGuestEmail] = React.useState('')
  const [guestPhone, setGuestPhone] = React.useState('')
  const [purpose, setPurpose] = React.useState('')

  // Generate available dates
  const availableDates = React.useMemo(() => {
    const dates = []
    const today = startOfDay(new Date())
    for (let i = 0; i < MAX_BOOKING_DAYS; i++) {
      dates.push(addDays(today, i))
    }
    return dates
  }, [])

  // Fetch bookings for selected date
  const { data: bookings } = useQuery({
    queryKey: ['bookings', room?.id, selectedDate?.toISOString()],
    queryFn: () => bookingService.getBookings({
      room_id: room?.id,
      booking_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
    }),
    enabled: !!room && !!selectedDate
  })

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: any) => bookingService.createBooking(data),
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setStep('success')
      toast.success('Booking confirmed!')
    },
    onError: () => {
      toast.error('Failed to create booking')
    }
  })

  // Check if a session is available
  const isSessionAvailable = (session: typeof SESSIONS[0]) => {
    if (!bookings || !selectedDate) return true
    
    const now = new Date()
    const sessionStartDateTime = new Date(selectedDate)
    const [startHours, startMinutes] = session.startTime.split(':')
    sessionStartDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)
    
    // Check if session is in the past
    if (isBefore(sessionStartDateTime, now)) return false
    
    // Check for overlap with existing bookings
    return !bookings.some(booking => 
      booking.status !== 'cancelled' && (
        (booking.start_time < session.endTime && booking.end_time > session.startTime)
      )
    )
  }

  const isRoomMondayBlocked = (date: Date) => {
    if (!room) return false
    const day = date.getDay()
    const name = room.name.toLowerCase()
    return (name.includes('pengawas sd') || name.includes('elementary school supervisory')) && day === 1
  }

  const handleDateSelect = (date: Date) => {
    if (isRoomMondayBlocked(date)) {
      toast.error('This room cannot be booked on Mondays')
      return
    }
    setSelectedDate(date)
    setStartTime(null)
    setEndTime(null)
    setStep('time')
  }

  const handleSessionSelect = (session: typeof SESSIONS[0]) => {
    setStartTime(session.startTime)
    setEndTime(session.endTime)
  }

  // Calculate duration and price if needed
  const duration = React.useMemo(() => {
    if (!startTime || !endTime) return 0
    return 1 // Session based booking is treated as 1 unit or we can calculate hours
  }, [startTime, endTime])

  const handleContinueToForm = () => {
    if (startTime && endTime) {
      setStep('form')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!room || !selectedDate || !startTime || !endTime) return
    
    createBookingMutation.mutate({
      room_id: room.id,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: endTime,
      purpose: purpose,
      status: 'pending'
    })
  }

  const handleReset = () => {
    setSelectedDate(null)
    setStartTime(null)
    setEndTime(null)
    setStep('date')
    setGuestName('')
    setGuestEmail('')
    setGuestPhone('')
    setPurpose('')
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-[32px] p-0 border-none shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-8 z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
              Book {room.name}
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground mt-2">
              {room.location || 'Central Facility'} • {room.capacity} Persons
            </p>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 ${step === 'date' ? 'text-primary' : ['time', 'form', 'success'].includes(step) ? 'text-foreground' : 'text-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                step === 'date' ? 'bg-primary text-primary-foreground' : 
                ['time', 'form', 'success'].includes(step) ? 'bg-emerald-500 text-white' : 'bg-muted'
              }`}>
                {['time', 'form', 'success'].includes(step) ? '✓' : '1'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Date</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'time' ? 'text-primary' : ['form', 'success'].includes(step) ? 'text-foreground' : 'text-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                step === 'time' ? 'bg-primary text-primary-foreground' : 
                ['form', 'success'].includes(step) ? 'bg-emerald-500 text-white' : 'bg-muted'
              }`}>
                {['form', 'success'].includes(step) ? '✓' : '2'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Time</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'form' ? 'text-primary' : step === 'success' ? 'text-foreground' : 'text-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                step === 'form' ? 'bg-blue-600 text-white' : 
                step === 'success' ? 'bg-emerald-500 text-white' : 'bg-muted'
              }`}>
                {step === 'success' ? '✓' : '3'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Details</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Date Selection */}
          {step === 'date' && (
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-foreground">Select Your Date</h3>
              <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-6">
                Choose your preferred booking date
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {availableDates.map((date, index) => {
                  const isBlocked = isRoomMondayBlocked(date)
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      disabled={isBlocked}
                      className={`relative p-4 rounded-2xl border-2 transition-all ${
                        isBlocked ? 'opacity-40 cursor-not-allowed border-border/50' :
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'border-primary bg-primary/5 hover:scale-105'
                          : 'border-border hover:border-primary/50 hover:scale-105'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-black text-foreground">{format(date, 'd')}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-foreground mt-1">
                          {format(date, 'EEE')}
                        </div>
                        {isBlocked && (
                          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-2 py-0.5">
                            Blocked
                          </Badge>
                        )}
                        {index === 0 && !isBlocked && (
                          <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] px-2 py-0.5">
                            Today
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 'time' && selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-foreground">Choose Your Time</h3>
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setStep('date')} className="text-xs font-bold">
                  Change Date
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SESSIONS.map((session) => {
                  const isAvailable = isSessionAvailable(session)
                  const isSelected = startTime === session.startTime && endTime === session.endTime
                  
                  return (
                    <button
                      key={session.id}
                      onClick={() => isAvailable && handleSessionSelect(session)}
                      disabled={!isAvailable}
                      className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md'
                          : isAvailable
                          ? 'border-border hover:border-primary hover:scale-105 bg-card'
                          : 'opacity-40 cursor-not-allowed border-border/50 bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                          <span className={`text-sm font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-foreground'}`}>
                            {session.label.split('(')[0]}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                           {session.startTime} - {session.endTime}
                        </span>
                      </div>
                      {!isAvailable && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-2 py-0.5">
                          Unavailable
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setStep('date')}
                    className="flex-1 max-w-[120px] h-12 rounded-2xl font-black uppercase tracking-widest text-xs border-border text-foreground hover:bg-muted"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleContinueToForm} 
                    disabled={!startTime}
                    className="flex-1 max-w-[200px] h-12 rounded-2xl px-8 font-black uppercase tracking-widest text-xs"
                  >
                    Continue
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
              </div>

              <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Booked</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Guest Details Form */}
          {step === 'form' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-foreground">Your Details</h3>
                <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  {selectedDate && format(selectedDate, 'EEE, MMM d')} • {startTime} - {endTime}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground mb-2 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                      <Input
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-2 font-bold text-foreground"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground mb-2 block">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                      <Input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-2 font-bold text-foreground"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground mb-2 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                      <Input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-2 font-bold text-foreground"
                        placeholder="+62 812 3456 7890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground mb-2 block">
                      Meeting Needs / Purpose *
                    </label>
                    <div className="relative">
                      <Input
                        required
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="h-14 rounded-2xl border-2 font-bold text-foreground"
                        placeholder="What is this meeting for?"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('time')}
                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-border text-foreground hover:bg-muted"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    {createBookingMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-foreground">Booking Confirmed!</h3>
              <p className="text-sm text-foreground mb-8">
                Your reservation has been successfully created
              </p>
              
              <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                <div className="space-y-3 text-sm text-foreground">
                  <div className="flex justify-between">
                    <span className="text-foreground font-bold">Room:</span>
                    <span className="font-black text-foreground">{room.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground font-bold">Date:</span>
                    <span className="font-black text-foreground">{format(selectedDate!, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground font-bold">Time:</span>
                    <span className="font-black text-foreground">{startTime} - {endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground font-bold">Guest:</span>
                    <span className="font-black text-foreground">{guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground font-bold">Purpose:</span>
                    <span className="font-black text-foreground">{purpose}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
