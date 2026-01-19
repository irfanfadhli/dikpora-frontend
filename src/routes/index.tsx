import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { roomService } from '@/lib/services'
import { Room } from '@/lib/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Users, MapPin, Calendar as CalendarIcon, ArrowRight, Star, Sparkles, Building2 } from 'lucide-react'
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
      <section className="relative pt-24 pb-20 px-4 md:px-8 w-full border-b bg-muted/20">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4" />
            <span>Professional Workspace Solutions</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700">
            Elevate Your <br />
            <span className="text-muted-foreground">Meeting Experience.</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
            Discover and book premium rooms tailored for your teams. 
            From intimate huddles to executive board meetings.
            </p>
            
            <div className="relative w-full max-w-lg mx-auto group animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="absolute inset-0 bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all duration-500 rounded-full opacity-50"></div>
            <div className="relative flex items-center bg-background border rounded-full p-2 shadow-xl shadow-primary/5 ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-ring transition-all">
                <Search className="w-5 h-5 ml-4 text-muted-foreground" />
                <Input 
                type="text" 
                placeholder="Find your perfect space..." 
                className="border-none shadow-none focus-visible:ring-0 text-base px-4 h-12 bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
                <Button size="lg" className="rounded-full px-8 font-semibold shadow-md">
                    Search
                </Button>
            </div>
            </div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="py-12 px-4 md:px-8 w-full border-b bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
            { label: 'Available Rooms', value: '4', icon: Building2 },
            { label: 'Locations', value: '4', icon: MapPin },
            { label: 'Registered Users', value: '1.2k', icon: Users },
            { label: 'Satisfaction', value: '99%', icon: Star },
            ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
            ))}
        </div>
      </section>

      {/* Room Listing */}
      <section id="rooms" className="py-24 px-4 md:px-8 w-full bg-muted/10">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Featured Spaces</h2>
                <p className="text-muted-foreground text-lg">Curated environments for productivity.</p>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant="outline" className="h-9 px-4 text-sm font-medium rounded-full bg-background">
                    {filteredRooms.length} Spaces Available
                </Badge>
            </div>
            </div>

            {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/3] rounded-3xl w-full" />
                    <Skeleton className="h-6 w-2/3 rounded-full" />
                    <Skeleton className="h-4 w-1/3 rounded-full" />
                </div>
                ))}
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRooms.map(room => (
                <Card key={room.id} className="group border-none shadow-lg shadow-black/5 bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl ring-1 ring-border/50">
                    <div className="relative aspect-[4/3] overflow-hidden">
                    {room.image ? (
                        <img 
                        src={room.image} 
                        alt={room.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                        }}
                        />
                    ) : null}
                    <div className="w-full h-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors" style={{ display: room.image ? 'none' : 'flex' }}>
                        <CalendarIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                    
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Badge className="bg-background/95 backdrop-blur-sm text-foreground hover:bg-background/100 border-none px-3 py-1.5 rounded-full font-medium shadow-sm">
                        <Users className="w-3 h-3 mr-1.5" />
                        {room.capacity}
                        </Badge>
                        {room.active ? (
                        <Badge className="bg-emerald-500/90 hover:bg-emerald-500 backdrop-blur-sm text-white border-none px-3 py-1.5 rounded-full font-bold shadow-sm">
                            Available
                        </Badge>
                        ) : (
                        <Badge variant="destructive" className="backdrop-blur-sm px-3 py-1.5 rounded-full font-bold shadow-sm">
                            Booked
                        </Badge>
                        )}
                    </div>
                    
                    {/* Gradient Overlay for Text Readability if needed, but styling text below instead */}
                    </div>
                    
                    <CardHeader className="pt-6 pb-2 px-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {room.location || 'Main Building'}
                        </div>
                        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {room.name}
                        </h3>
                    </CardHeader>
                    
                    <CardFooter className="px-6 pb-6 pt-2">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                        setSelectedRoom(room)
                        setBookingModalOpen(true)
                        }}
                        className="w-full rounded-xl h-12 font-semibold text-sm border-2 border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all gap-2 group/btn"
                    >
                        Check Availability
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>
            )}

            {filteredRooms.length === 0 && !isLoading && (
            <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No spaces found</h3>
                <p className="text-muted-foreground text-sm">Adjust your search to find more options</p>
            </div>
            )}
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        room={selectedRoom}
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
      />

      {/* Footer */}
      <footer className="relative pt-20 pb-12 bg-card text-card-foreground border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xl">
                  <img src="/logo-kabupaten-bantul.png" alt="LogoPemda" />
                </div>
                <span className="text-xl font-bold tracking-tight">RuangKita</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">
                Streamlining government workspace allocation with intelligent digital solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Browse</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors text-sm">Dashboard</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Status</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Guidelines</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-4 pl-0 lg:pl-8">
              <h3 className="font-semibold text-foreground mb-4">Stay Connected</h3>
              <div className="flex flex-col gap-3">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-background"
                />
                <Button className="w-full">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-muted-foreground text-xs">
              &copy; 2026 DikporaRoom. Government of Indonesia.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
