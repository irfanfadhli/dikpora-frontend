import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/services'
import { User } from '@/lib/types'
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,  
  Loader2,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Mail,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsers,
})

function AdminUsers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getUsers()
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setIsModalOpen(false)
      toast.success('User created successfully')
    },
    onError: () => toast.error('Failed to create user')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setIsModalOpen(false)
      setEditingUser(null)
      toast.success('User updated successfully')
    },
    onError: () => toast.error('Failed to update user')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted successfully')
      setDeleteUserId(null)
    },
    onError: () => {
      toast.error('Failed to delete user')
      setDeleteUserId(null)
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: any = {
      email: formData.get('email'),
      full_name: formData.get('full_name'),
      level: 'user',
      active: formData.get('active') === 'on',
      is_verified: formData.get('is_verified') === 'on',
    }

    // Only include password for new users
    if (!editingUser) {
      data.password = formData.get('password')
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredUsers = users?.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  ) || []

  const getLevelBadge = (level: string) => {
    const levels = {
      'admin': { label: 'Admin', className: 'bg-blue-50 text-blue-600 border-blue-100' },
      'user': { label: 'User', className: 'bg-neutral-50 text-neutral-600 border-neutral-100' },
    }
    const levelInfo = levels[level as keyof typeof levels] || levels['user']
    return (
      <Badge className={`${levelInfo.className} hover:${levelInfo.className} rounded-lg px-2 text-[10px] font-black uppercase tracking-widest shadow-none`}>
        {levelInfo.label}
      </Badge>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase mb-1">User Management</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Identity Control & Access Rights</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) setEditingUser(null); }}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-8 font-bold gap-2 shadow-xl shadow-blue-500/10">
                <Plus className="w-4 h-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">
                  {editingUser ? 'Update user information and permissions.' : 'Add a new user to the system.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name *</label>
                    <Input name="full_name" defaultValue={editingUser?.full_name} required className="rounded-xl h-12 bg-muted border-none px-4 text-foreground" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address *</label>
                    <Input name="email" type="email" defaultValue={editingUser?.email} required className="rounded-xl h-12 bg-muted border-none px-4 text-foreground" />
                  </div>
                  {!editingUser && (
                    <div className="grid gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password *</label>
                      <Input name="password" type="password" required minLength={8} className="rounded-xl h-12 bg-muted border-none px-4 text-foreground" placeholder="Minimum 8 characters" />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" name="active" defaultChecked={editingUser?.active ?? true} className="w-5 h-5 rounded-lg text-primary focus:ring-primary" />
                       <label className="text-xs font-bold uppercase tracking-widest text-foreground">Active</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" name="is_verified" defaultChecked={editingUser?.is_verified ?? false} className="w-5 h-5 rounded-lg text-primary focus:ring-primary" />
                       <label className="text-xs font-bold uppercase tracking-widest text-foreground">Verified</label>
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs">
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {editingUser ? 'Save Changes' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="border-none shadow-none focus-visible:ring-0 bg-transparent text-sm h-10 text-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14">User</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14">Email</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14 text-center">Level</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-14 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={5} className="h-20 px-6"><div className="h-4 bg-muted rounded-full w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.map(user => (
                <TableRow key={user.id} className="group border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="font-black uppercase tracking-tight text-sm">{user.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 font-mono text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="px-6 py-5 text-center">
                    {getLevelBadge(user.level)}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {user.active ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                          <XCircle className="w-3 h-3" /> Inactive
                        </div>
                      )}
                      {user.is_verified && (
                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 rounded-full px-2 py-0.5 text-[8px] font-black">
                          <Shield className="w-2.5 h-2.5 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setEditingUser(user); setIsModalOpen(true); }} 
                        className="rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeleteUserId(user.id)}
                        className="rounded-xl hover:bg-red-500 hover:text-white transition-all text-foreground hover:border-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && filteredUsers.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No Users Found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-bold text-neutral-500 pt-2">
              This action cannot be undone. This will permanently delete the user account and remove all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl h-12 font-bold uppercase tracking-widest text-xs border-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteUserId && deleteMutation.mutate(deleteUserId)}
              disabled={deleteMutation.isPending}
              className="rounded-2xl h-12 font-bold uppercase tracking-widest text-xs bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
