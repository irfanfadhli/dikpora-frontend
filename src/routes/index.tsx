import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { roomService } from '@/lib/services'
import { Room } from '@/lib/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Users, MapPin, Calendar as CalendarIcon, ArrowRight, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { BookingModal } from '@/components/BookingModal'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [search, setSearch] = React.useState('')
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false)
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null)
  
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomService.getRooms()
  })

  const filteredRooms = rooms?.filter(room => 
    room.name.toLowerCase().includes(search.toLowerCase()) ||
    room.location?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6 animate-fade-in">
          <Star className="w-3 h-3 fill-current" />
          <span>New: Professional Meeting Spaces Available</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
          Modern Spaces for <br />
          <span className="text-neutral-400 dark:text-neutral-600">Great Ideas.</span>
        </h1>
        <p className="text-lg md:text-xl mb-10 text-neutral-500 max-w-2xl mx-auto font-medium">
          Whether it&apos;s a quick huddle or a large-scale conference, find the perfect room curated for your professional needs.
        </p>
        
        <div className="relative max-w-xl mx-auto group">
          <div className="absolute inset-0 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all rounded-full"></div>
          <div className="relative flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-neutral-900 dark:focus-within:ring-white transition-all">
            <Search className="w-5 h-5 ml-3 text-neutral-400" />
            <Input 
              type="text" 
              placeholder="Search by name or location..." 
              className="border-none shadow-none focus-visible:ring-0 text-md px-3 h-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button className="rounded-xl h-12 px-6 ml-2 font-bold">Search</Button>
          </div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-y border-neutral-100 dark:border-neutral-900">
        {[
          { label: 'Available Rooms', value: '4' },
          { label: 'Locations', value: '4' },
          { label: 'Happy Users', value: '1.2k' },
          { label: 'Uptime', value: '99.9%' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">{stat.value}</div>
            <div className="text-xs font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Room Listing */}
      <section id="rooms" className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="h-1 w-12 bg-neutral-900 dark:bg-white rounded-full mb-6"></div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Featured Fields</h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{filteredRooms.length} Spaces Found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 rounded-[32px] animate-pulse"></div>
                <div className="h-6 bg-neutral-100 dark:bg-neutral-900 rounded-full w-2/3 animate-pulse"></div>
                <div className="h-4 bg-neutral-100 dark:bg-neutral-900 rounded-full w-1/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {filteredRooms.map(room => (
              <Card key={room.id} className="group border-none shadow-none bg-transparent overflow-hidden transition-all duration-500">
                <div className="block relative aspect-[4/3] overflow-hidden rounded-[32px] mb-6">
                  {room.image ? (
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800 transition-colors" style={{ display: room.image ? 'none' : 'flex' }}>
                    <CalendarIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-700" />
                  </div>
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <Badge className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-900 dark:text-white border-none px-4 py-1.5 rounded-full font-bold shadow-sm">
                      {room.capacity} Persons
                    </Badge>
                    {room.active ? (
                      <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-none px-4 py-1.5 rounded-full font-bold shadow-sm text-[10px] uppercase tracking-widest">
                        Available
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-500/90 backdrop-blur-md text-white border-none px-4 py-1.5 rounded-full font-bold shadow-sm text-[10px] uppercase tracking-widest">
                        Booked
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-blue-600 transition-colors truncate">
                      {room.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-bold text-xs uppercase tracking-widest mb-6">
                    <MapPin className="w-3.5 h-3.5" />
                    {room.location || 'Central Facility'}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedRoom(room)
                      setBookingModalOpen(true)
                    }}
                    className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs border-2 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all gap-2 group/btn"
                  >
                    View Schedule
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredRooms.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-[40px] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xl font-bold mb-2">No spaces found</h3>
            <p className="text-neutral-400">Try adjusting your search criteria</p>
          </div>
        )}
      </section>

      {/* Booking Modal */}
      <BookingModal
        room={selectedRoom}
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
      />

      {/* Footer */}
      <footer className="relative mt-32 bg-neutral-900 dark:bg-black text-white border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-neutral-900 font-black text-xl">
                  P
                </div>
                <span className="text-xl font-black tracking-tight">DikporaRoom</span>
              </div>
              <p className="text-neutral-400 leading-relaxed mb-6 text-sm max-w-xs">
                Elevating workspace experiences with modern, professional facilities designed for innovation and collaboration.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex gap-2">
                <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-neutral-300 hover:text-white transition-colors text-sm">Explore Rooms</Link></li>
                <li><Link to="/login" className="text-neutral-300 hover:text-white transition-colors text-sm">Dashboard</Link></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">API Docs</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Press Kit</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Cookie Policy</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors text-sm">Licenses</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">Stay Updated</h3>
              <p className="text-neutral-400 text-sm mb-4">Get the latest updates and offers.</p>
              <div className="flex flex-col gap-2">
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg h-10 text-sm"
                />
                <Button className="w-full rounded-lg h-10 bg-white text-neutral-900 hover:bg-neutral-200 font-semibold text-sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-neutral-500 text-xs">
                &copy; 2026 DikporaRoom. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-medium">All Systems Operational</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span>Made with care</span>
              <span>•</span>
              <span>Powered by Innovation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
