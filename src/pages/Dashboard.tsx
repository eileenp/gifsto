import { useState } from 'react'
import { useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Copy,
  Settings,
  Users,
  ArrowRight,
  Gift,
  Eye,
  Check,
} from 'lucide-react'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = ['bg-[#C67C5A]', 'bg-[#8FA98F]', 'bg-[#D4A574]', 'bg-[#5A8F6E]', 'bg-[#B85450]']

function AvatarInitials({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${avatarColors[index % avatarColors.length]} text-white text-xs font-medium ring-2 ring-white`}>
      {getInitials(name)}
    </div>
  )
}

export default function Dashboard({ tab = 'lists' }: { tab?: 'lists' | 'items' }) {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true })
  const [activeTab, setActiveTab] = useState<'lists' | 'items'>(tab)
  const [createOpen, setCreateOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Create list form state
  const [newListTitle, setNewListTitle] = useState('')
  const [newListPassword, setNewListPassword] = useState('')
  const [newListZelle, setNewListZelle] = useState('')
  const [newListVenmo, setNewListVenmo] = useState('')
  const [newListPaypal, setNewListPaypal] = useState('')

  const utils = trpc.useUtils()
  const { data: myLists, isLoading: listsLoading } = trpc.list.mine.useQuery(undefined, {
    enabled: !!user,
  })
  const { data: allItems } = trpc.list.allItems.useQuery(undefined, {
    enabled: activeTab === 'items' && !!user,
  })

  const createList = trpc.list.create.useMutation({
    onSuccess: () => {
      utils.list.mine.invalidate()
      setCreateOpen(false)
      setNewListTitle('')
      setNewListPassword('')
      setNewListZelle('')
      setNewListVenmo('')
      setNewListPaypal('')
    },
  })

  function suggestPassphrase() {
    const words = ['happy', 'joyful', 'warm', 'cozy', 'bright', 'sweet', 'lovely', 'gentle']
    const nouns = ['birthday', 'holiday', 'wedding', 'baby', 'celebration', 'moment', 'gathering', 'wish']
    const r1 = words[Math.floor(Math.random() * words.length)]
    const r2 = nouns[Math.floor(Math.random() * nouns.length)]
    const r3 = Math.floor(1000 + Math.random() * 9000)
    setNewListPassword(`${r1}-${r2}-${r3}`)
  }

  function copyLinkAndPassword(listId: number, password: string) {
    const url = `${window.location.origin}/lists/${listId}/access`
    navigator.clipboard.writeText(`${url}\nPassword: ${password}`)
    setCopiedId(listId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleCreate() {
    if (!newListTitle.trim() || !newListPassword.trim()) return
    createList.mutate({
      title: newListTitle.trim(),
      password: newListPassword.trim(),
      zelle: newListZelle || undefined,
      venmo: newListVenmo || undefined,
      paypal: newListPaypal || undefined,
    })
  }

  if (authLoading || listsLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C67C5A] border-t-transparent" />
        </div>
      </div>
    )
  }

  const ownedLists = myLists?.owned || []
  const hasLists = ownedLists.length > 0

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as 'lists' | 'items')
          if (v === 'items') navigate('/dashboard/items')
          else navigate('/dashboard')
        }} className="mb-8">
          <TabsList className="bg-[#F5F1EC] border border-[#E8E2DA]">
            <TabsTrigger value="lists" className="data-[state=active]:bg-white data-[state=active]:text-[#3D3632]">My lists</TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-white data-[state=active]:text-[#3D3632]">All my items</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'lists' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold text-[#3D3632]">Lists I own</h2>
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-[#C67C5A] text-white hover:bg-[#B56A48]"
              >
                <Plus className="mr-2 h-4 w-4" />
                New list
              </Button>
            </div>

            {!hasLists && (
              <Card className="border-[#E8E2DA] bg-white">
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C67C5A]/10">
                    <Gift className="h-8 w-8 text-[#C67C5A]" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-[#3D3632]">
                    Welcome — create your first list
                  </h3>
                  <p className="mt-2 max-w-md text-[#6B6058]">
                    Create a wishlist for your next celebration, share it privately with a password, and let people claim items.
                  </p>
                  <Button
                    onClick={() => setCreateOpen(true)}
                    className="mt-6 bg-[#C67C5A] text-white hover:bg-[#B56A48]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create a list
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasLists && (
              <div className="grid gap-4 md:grid-cols-2">
                {ownedLists.map((list) => {
                  const totalItems = (list as any).items?.length || 0
                  const claimedCount = (list as any).items?.reduce((acc: number, item: any) => acc + (item.claims?.length || 0), 0) || 0
                  return (
                    <Card key={list.id} className="border-[#E8E2DA] bg-white hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-serif text-lg font-semibold text-[#3D3632]">{list.title}</h3>
                            <p className="mt-1 text-sm text-[#6B6058]">
                              {totalItems} items · {claimedCount} claimed
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/lists/${list.id}`)}
                            className="text-[#6B6058] hover:text-[#3D3632] hover:bg-[#F5F1EC]"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyLinkAndPassword(list.id, list.password)}
                            className="border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]"
                          >
                            {copiedId === list.id ? (
                              <Check className="mr-2 h-4 w-4 text-[#5A8F6E]" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            {copiedId === list.id ? 'Copied' : 'Copy link'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/lists/${list.id}`)}
                            className="border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]"
                          >
                            Manage
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>

                        {((list as any).accessRecords?.length || 0) > 0 && (
                          <div className="mt-4 flex items-center gap-2 border-t border-[#E8E2DA] pt-4">
                            <div className="flex -space-x-2">
                              {(list as any).accessRecords?.slice(0, 3).map((a: any, i: number) => (
                                <AvatarInitials key={i} name={a.name || a.email} index={i} />
                              ))}
                            </div>
                            <span className="text-sm text-[#6B6058]">
                              {(list as any).accessRecords?.length || 0} {(list as any).accessRecords?.length === 1 ? 'person' : 'people'} have access
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/lists/${list.id}/people`)}
                              className="ml-auto text-[#C67C5A] hover:text-[#B56A48] hover:bg-[#C67C5A]/10"
                            >
                              <Users className="mr-1 h-4 w-4" />
                              View all
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'items' && (
          <>
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-[#3D3632]">All my items</h2>
              <p className="mt-1 text-sm text-[#6B6058]">
                {allItems?.length || 0} items across {myLists?.owned?.length || 0} lists
              </p>
            </div>

            {!allItems?.length && (
              <Card className="border-[#E8E2DA] bg-white">
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C67C5A]/10">
                    <Eye className="h-8 w-8 text-[#C67C5A]" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-[#3D3632]">No items yet</h3>
                  <p className="mt-2 text-[#6B6058]">Add items to any of your lists to see them here.</p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="mt-6 bg-[#C67C5A] text-white hover:bg-[#B56A48]"
                  >
                    Go to my lists
                  </Button>
                </CardContent>
              </Card>
            )}

            {!!allItems?.length && (
              <div className="grid gap-3">
                {allItems.map((item) => (
                  <Card key={item.id} className="border-[#E8E2DA] bg-white">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="h-14 w-14 rounded-lg bg-[#F5F1EC] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Gift className="h-6 w-6 text-[#A39B92]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#3D3632] truncate">{item.name}</p>
                        <p className="text-sm text-[#6B6058]">
                          {item.price ? `$${item.price}` : 'No price'} · on{" "}
                          <span
                            className="text-[#C67C5A] cursor-pointer hover:underline"
                            onClick={() => navigate(`/lists/${item.listId}`)}
                          >
                            {item.list?.title || 'Unknown list'}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/lists/${item.listId}`)}
                        className="text-[#C67C5A] hover:text-[#B56A48] hover:bg-[#C67C5A]/10"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create List Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white border-[#E8E2DA] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#3D3632]">Create a new list</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[#3D3632]">List name</Label>
              <Input
                placeholder="Sarah's Birthday"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="mt-1 border-[#E8E2DA] focus-visible:ring-[#C67C5A]"
              />
            </div>
            <div>
              <Label className="text-[#3D3632]">Password</Label>
              <Input
                placeholder="Enter a password"
                value={newListPassword}
                onChange={(e) => setNewListPassword(e.target.value)}
                className="mt-1 border-[#E8E2DA] focus-visible:ring-[#C67C5A]"
              />
              <button
                onClick={suggestPassphrase}
                className="mt-1 text-xs text-[#C67C5A] hover:underline"
              >
                Suggest a passphrase
              </button>
            </div>
            <div className="border-t border-[#E8E2DA] pt-4">
              <Label className="text-[#3D3632] text-sm">Payment handles (optional)</Label>
              <p className="text-xs text-[#A39B92] mb-2">Shown to group gift contributors</p>
              <div className="space-y-2">
                <Input placeholder="Zelle handle" value={newListZelle} onChange={(e) => setNewListZelle(e.target.value)} className="border-[#E8E2DA] focus-visible:ring-[#C67C5A]" />
                <Input placeholder="Venmo handle" value={newListVenmo} onChange={(e) => setNewListVenmo(e.target.value)} className="border-[#E8E2DA] focus-visible:ring-[#C67C5A]" />
                <Input placeholder="PayPal handle" value={newListPaypal} onChange={(e) => setNewListPaypal(e.target.value)} className="border-[#E8E2DA] focus-visible:ring-[#C67C5A]" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1 border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newListTitle.trim() || !newListPassword.trim() || createList.isPending}
                className="flex-1 bg-[#C67C5A] text-white hover:bg-[#B56A48]"
              >
                {createList.isPending ? 'Creating...' : 'Create list'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
