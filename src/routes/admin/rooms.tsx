import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomService } from '@/lib/services'
import { Room } from '@/lib/types'
import { AdminSidebar } from '@/components/admin-sidebar'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Search, 
  LayoutGrid, 
  List, 
  FileImage,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/rooms')({
  component: AdminRooms,
})

function AdminRooms() {
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null)
  const [deletingRoomId, setDeletingRoomId] = React.useState<string | null>(null)

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: () => roomService.getRooms()
  })

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => roomService.createRoom(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
      setIsModalOpen(false)
      toast.success('Room created successfully')
    },
    onError: () => toast.error('Failed to create room')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string, fd: FormData }) => roomService.updateRoom(id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
      setIsModalOpen(false)
      setEditingRoom(null)
      toast.success('Room updated successfully')
    },
    onError: () => toast.error('Failed to update room')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] })
      toast.success('Room deleted successfully')
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, fd: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const filteredRooms = rooms?.filter(r => r.name.toLowerCase().includes(search.toLowerCase())) || []

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase mb-1">Room Management</h1>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Inventory Control & Facility oversight</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) setEditingRoom(null); }}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-8 font-bold gap-2 shadow-xl shadow-blue-500/10">
                <Plus className="w-4 h-4" />
                Add New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  {editingRoom ? 'Edit Space' : 'Define New Space'}
                </DialogTitle>
                <DialogDescription className="font-bold text-neutral-400 uppercase tracking-widest text-[10px]">
                  Fill in the details for the facility room.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Name</label>
                    <Input name="name" defaultValue={editingRoom?.name} required className="rounded-xl h-12 bg-muted border-none px-4" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Location</label>
                    <Input name="location" defaultValue={editingRoom?.location} className="rounded-xl h-12 bg-muted border-none px-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Capacity</label>
                      <Input name="capacity" type="number" defaultValue={editingRoom?.capacity} className="rounded-xl h-12 bg-muted border-none px-4" />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input type="checkbox" name="active" defaultChecked={editingRoom?.active ?? true} className="w-5 h-5 rounded-lg text-primary focus:ring-primary" />
                      <label className="text-xs font-bold uppercase tracking-widest">Active</label>
                    </div>
                  </div>
                  <div className="grid gap-2 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Room Image</label>
                    <div className="relative border-2 border-dashed border-border rounded-2xl p-6 text-center group hover:border-muted-foreground/30 transition-colors">
                      <Input name="image" type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                      <FileImage className="w-8 h-8 mx-auto text-neutral-300 group-hover:text-neutral-500 mb-2" />
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Drag or Click to Upload</p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs">
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {editingRoom ? 'Save Changes' : 'Create Room'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-border rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-4">
            <Search className="w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Filter rooms by name..." 
              className="border-none shadow-none focus-visible:ring-0 bg-transparent text-sm h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-widest text-neutral-400 px-6 h-14">Image</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-6 h-14">Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-6 h-14">Location</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-6 h-14 text-center">People</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-6 h-14">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-6 h-14 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={6} className="h-20 px-6"><div className="h-4 bg-muted rounded-full w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredRooms.map(room => (
                <TableRow key={room.id} className="group border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="w-12 h-10 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                      {room.image && (
                        <img 
                          src={room.image} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-black uppercase tracking-tight text-sm truncate max-w-[200px]">{room.name}</TableCell>
                  <TableCell className="px-6 py-4 font-bold text-neutral-400 uppercase tracking-widest text-[10px]">{room.location || '-'}</TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="rounded-lg px-2 text-[10px] font-black">{room.capacity || 0}</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {room.active ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                        <XCircle className="w-3 h-3" /> Offline
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingRoom(room); setIsModalOpen(true); }} className="rounded-xl hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog open={deletingRoomId === room.id} onOpenChange={(open) => !open && setDeletingRoomId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingRoomId(room.id)} className="rounded-xl hover:bg-red-500 hover:text-white transition-all text-neutral-400 hover:border-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Delete Room</AlertDialogTitle>
                            <AlertDialogDescription className="font-bold text-neutral-400 uppercase tracking-widest text-[10px]">
                              Are you sure you want to erase "{room.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2 sm:gap-2">
                            <AlertDialogCancel className="rounded-2xl h-12 font-bold uppercase tracking-widest text-xs">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                deleteMutation.mutate(room.id)
                                setDeletingRoomId(null)
                              }} 
                              className="rounded-2xl h-12 font-bold uppercase tracking-widest text-xs bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredRooms.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Empty Inventory</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
