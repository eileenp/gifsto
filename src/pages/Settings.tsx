import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true })

  const { data: settings, isLoading: settingsLoading } = trpc.settings.get.useQuery(undefined, {
    enabled: !!user,
  })

  const utils = trpc.useUtils()
  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.invalidate()
    },
  })

  const [notifyClaim, setNotifyClaim] = useState(true)
  const [notifyContribution, setNotifyContribution] = useState(true)
  const [notifyNewItem, setNotifyNewItem] = useState(true)

  // Sync local state with fetched data
  useState(() => {
    if (settings) {
      setNotifyClaim(settings.notifyClaim)
      setNotifyContribution(settings.notifyContribution)
      setNotifyNewItem(settings.notifyNewItem)
    }
  })

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C67C5A] border-t-transparent" />
        </div>
      </div>
    )
  }

  function handleSave() {
    updateSettings.mutate({
      notifyClaim,
      notifyContribution,
      notifyNewItem,
    })
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <main className="mx-auto max-w-xl px-6 py-8">
        <h1 className="font-serif text-3xl font-semibold text-[#3D3632]">Settings</h1>

        <Card className="border-[#E8E2DA] bg-white mt-6">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label className="text-[#3D3632]">Display name</Label>
              <Input
                value={user?.name || ''}
                disabled
                className="mt-1 border-[#E8E2DA] bg-[#F5F1EC] text-[#6B6058]"
              />
              <p className="mt-1 text-xs text-[#A39B92]">Managed by your authentication provider</p>
            </div>

            <div>
              <Label className="text-[#3D3632]">Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="mt-1 border-[#E8E2DA] bg-[#F5F1EC] text-[#6B6058]"
              />
              <p className="mt-1 text-xs text-[#A39B92]">Managed by your authentication provider</p>
            </div>
          </CardContent>
        </Card>

        <h2 className="mt-8 font-serif text-xl font-semibold text-[#3D3632]">Notification preferences</h2>
        <Card className="border-[#E8E2DA] bg-white mt-4">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3D3632]">When someone claims an item on my list</p>
              </div>
              <Switch
                checked={notifyClaim}
                onCheckedChange={setNotifyClaim}
                className="data-[state=checked]:bg-[#C67C5A]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3D3632]">When someone contributes to a group gift on my list</p>
              </div>
              <Switch
                checked={notifyContribution}
                onCheckedChange={setNotifyContribution}
                className="data-[state=checked]:bg-[#C67C5A]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#3D3632]">When a new item is added to a list I've saved</p>
              </div>
              <Switch
                checked={notifyNewItem}
                onCheckedChange={setNotifyNewItem}
                className="data-[state=checked]:bg-[#C67C5A]"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="mt-6 bg-[#C67C5A] text-white hover:bg-[#B56A48]"
        >
          <Save className="mr-2 h-4 w-4" />
          {updateSettings.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </main>
    </div>
  )
}
