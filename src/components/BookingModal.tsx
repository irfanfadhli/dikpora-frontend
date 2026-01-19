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

// CONFIGURABLE: Time slots configuration
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00'
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

  // Check if a time slot is available
  const isTimeSlotAvailable = (time: string) => {
    if (!bookings || !selectedDate) return true
    
    const now = new Date()
    const slotDateTime = new Date(selectedDate)
    const [hours, minutes] = time.split(':')
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    // Check if slot is in the past
    if (isBefore(slotDateTime, now)) return false
    
    // Check if slot is already booked
    const endHour = (parseInt(hours) + 1).toString().padStart(2, '0')
    const endTime = `${endHour}:00`
    
    return !bookings.some(booking => 
      booking.start_time === time || 
      (booking.start_time < time && booking.end_time > time)
    )
  }

  const getStepStatus = (
    time: string
  ): 'available' | 'past' | 'booked' | 'selected' | 'in-range' => {
    if (!selectedDate) return 'available'

    const now = new Date()
    const slotDateTime = new Date(selectedDate)
    const [hours, minutes] = time.split(':')
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    if (isBefore(slotDateTime, now)) return 'past'
    if (!isTimeSlotAvailable(time)) return 'booked'

    if (startTime === time || endTime === time) return 'selected'
    
    if (startTime && endTime) {
      if (time > startTime && time < endTime) {
         // Verify all intermediate slots are available
         return isTimeSlotAvailable(time) ? 'in-range' : 'booked'
      }
    }

    return 'available'
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setStartTime(null)
    setEndTime(null)
    setStep('time')
  }

  const handleTimeSelect = (time: string) => {
    if (!startTime || (startTime && endTime)) {
      setStartTime(time)
      setEndTime(null)
    } else {
      // selecting end time
      if (time > startTime) {
        // Check if all slots in between are available
        const slotsInRange = TIME_SLOTS.filter(t => t >= startTime && t <= time)
        const allAvailable = slotsInRange.every(t => isTimeSlotAvailable(t))
        
        if (allAvailable) {
           setEndTime(time)
        } else {
           toast.error('Some slots in this range are already booked')
           setStartTime(time) // Reset to new start
           setEndTime(null)
        }
      } else {
        // clicked earlier than start time, make it new start time
        setStartTime(time)
        setEndTime(null)
      }
    }
  }

  // Calculate duration and price if needed
  const duration = React.useMemo(() => {
    if (!startTime || !endTime) return 0
    const startIdx = TIME_SLOTS.indexOf(startTime)
    const endIdx = TIME_SLOTS.indexOf(endTime)
    return endIdx - startIdx + 1 // Assuming 1 hour slots
  }, [startTime, endTime])

  const handleContinueToForm = () => {
      if (startTime && endTime) {
          setStep('form')
      } else if (startTime && !endTime) {
          // Allow single slot booking (1 hour)
          setEndTime(startTime) // Set end same as start (meaning 1h block)
          // Wait, logic above implies endTime is inclusive for display range?
          // Usually end time for a booking is exclusive (e.g. 8-9).
          // If the user selects 08:00 and 09:00, does that mean 08:00-10:00 or 08:00-09:00?
          // "bookings can select start clock and end clock"
          // Let's assume the user selects 08:00 as start. 
          // If they select 09:00 as end, usually that means until 09:00? 
          // But existing logic was: `endHour = parseInt(selectedTime) + 1`.
          // So selecting 08:00 meant 08:00 - 09:00.
          // If I pick 08:00 and 10:00. That should probably mean 08:00 -> 11:00 (3 slots: 8, 9, 10)?
          // OR 08:00 -> 10:00 (2 slots: 8, 9).
          // Let's assume inclusive of the slot. 08:00 Start, 10:00 End -> includes 10:00 slot.
          // So 08:00 to 11:00 actual time.
          setStep('form')
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!room || !selectedDate || !startTime) return
    
    // If endTime is not set (shouldn't happen with updated logic), default to start+1h
    const effectiveEndTime = endTime || startTime

    // Calculate actual end time string for DB (exclusive)
    const endSlotInt = parseInt(effectiveEndTime.split(':')[0])
    const dbEndHour = (endSlotInt + 1).toString().padStart(2, '0')
    const dbEndTime = `${dbEndHour}:00`

    createBookingMutation.mutate({
      room_id: room.id,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: dbEndTime,
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
            <div className={`flex items-center gap-2 ${step === 'date' ? 'text-primary' : ['time', 'form', 'success'].includes(step) ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                step === 'date' ? 'bg-primary text-primary-foreground' : 
                ['time', 'form', 'success'].includes(step) ? 'bg-emerald-500 text-white' : 'bg-muted'
              }`}>
                {['time', 'form', 'success'].includes(step) ? '✓' : '1'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Date</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'time' ? 'text-primary' : ['form', 'success'].includes(step) ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                step === 'time' ? 'bg-primary text-primary-foreground' : 
                ['form', 'success'].includes(step) ? 'bg-emerald-500 text-white' : 'bg-muted'
              }`}>
                {['form', 'success'].includes(step) ? '✓' : '2'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Time</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'form' ? 'text-primary' : step === 'success' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
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
                {availableDates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-black text-foreground">{format(date, 'd')}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        {format(date, 'EEE')}
                      </div>
                      {index === 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] px-2 py-0.5">
                          Today
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
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

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {TIME_SLOTS.map((time) => {
                  const status = getStepStatus(time)
                  // const status = getTimeSlotStatus(time) // Replaced
                  return (
                    <button
                      key={time}
                      onClick={() => ['available', 'selected', 'in-range'].includes(status) && handleTimeSelect(time)}
                      disabled={status === 'booked' || status === 'past'}
                      className={`relative p-4 rounded-2xl border-2 transition-all ${
                        status === 'available' 
                          ? 'border-border hover:border-primary hover:scale-105' 
                          : status === 'selected'
                          ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md'
                          : status === 'in-range'
                          ? 'border-primary/20 bg-primary/5'
                          : 'opacity-40 cursor-not-allowed border-border/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className={`w-4 h-4 text-foreground ${status === 'selected' ? 'text-white' : ''}`} />
                        <span className={`text-sm font-black text-foreground ${status === 'selected' ? 'text-white' : ''}`}>{time}</span>
                      </div>
                      {status === 'past' && (
                        <Badge className="absolute -top-2 -right-2 bg-muted-foreground text-background text-[8px] px-2 py-0.5">
                          Past
                        </Badge>
                      )}
                      {status === 'booked' && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-2 py-0.5">
                          Full
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-8 flex justify-end">
                  <Button 
                    onClick={handleContinueToForm} 
                    disabled={!startTime}
                    className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-xs"
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
                  {format(selectedDate!, 'EEE, MMM d')} • {startTime} - {(parseInt(endTime || startTime || "0") + 1).toString().padStart(2, '0')}:00
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground mb-2 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="pl-12 h-14 rounded-2xl border-2 font-bold text-foreground"
                        placeholder="+62 812 3456 7890"
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
              <p className="text-sm text-foreground/70 mb-8">
                Your reservation has been successfully created
              </p>
              
              <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-bold">Room:</span>
                    <span className="font-black">{room.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-bold">Date:</span>
                    <span className="font-black">{format(selectedDate!, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-bold">Time:</span>
                    <span className="font-black">{startTime} - {(parseInt(endTime || startTime || "0") + 1).toString().padStart(2, '0')}:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-bold">Guest:</span>
                    <span className="font-black">{guestName}</span>
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
