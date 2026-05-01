import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Trash2, AlertTriangle } from 'lucide-react'

export default function Privacy() {
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true })
  const [exportRequested, setExportRequested] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C67C5A] border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <main className="mx-auto max-w-xl px-6 py-8">
        <h1 className="font-serif text-3xl font-semibold text-[#3D3632]">Privacy settings</h1>

        <Card className="border-[#E8E2DA] bg-white mt-6">
          <CardContent className="p-6">
            <h2 className="font-serif text-lg font-semibold text-[#3D3632]">Your data</h2>
            <p className="mt-2 text-sm text-[#6B6058]">
              Request a downloadable export of all your data, including your lists, items, claims, and contributions.
            </p>
            <Button
              variant="outline"
              onClick={() => setExportRequested(true)}
              disabled={exportRequested}
              className="mt-4 border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]"
            >
              <Download className="mr-2 h-4 w-4" />
              {exportRequested ? 'Export requested — check your email' : 'Request export'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#E8E2DA] bg-white mt-6">
          <CardContent className="p-6">
            <h2 className="font-serif text-lg font-semibold text-[#3D3632]">Delete account</h2>
            <p className="mt-2 text-sm text-[#6B6058]">
              This will permanently delete your account, all your lists, and anonymize your claims. There is a 30-day grace period during which you can recover your account.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4 inline-flex items-center text-sm text-[#B85450] hover:underline"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete my account
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-[#B85450]/10 p-3 border border-[#B85450]/20 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#B85450] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#6B6058]">
                    This action cannot be undone. All your lists will be deleted and your claims will be anonymized.
                  </p>
                </div>
                <p className="text-sm text-[#3D3632]">
                  Type your email address to confirm: <strong>{user?.email}</strong>
                </p>
                <input
                  type="text"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder={user?.email || ''}
                  className="w-full rounded-lg border border-[#E8E2DA] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B85450] focus:ring-offset-2"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteEmail('')
                    }}
                    className="flex-1 border-[#E8E2DA]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteEmail !== user?.email}
                    className="flex-1"
                  >
                    Permanently delete my account
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
