import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Gift, Check, AlertTriangle } from 'lucide-react'

export default function Unclaim() {
  const { claimId } = useParams<{ claimId: string }>()
  const id = Number(claimId)
  const [success, setSuccess] = useState(false)

  // We need to get the claim details. Since viewer router has no getClaim endpoint,
  // we'll just show a generic unclaim UI based on the claim ID
  const unclaim = trpc.viewer.unclaim.useMutation({
    onSuccess: () => setSuccess(true),
    onError: () => setSuccess(false),
  })

  function handleUnclaim() {
    unclaim.mutate({ claimId: id })
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="font-serif text-2xl font-semibold text-[#3D3632]">Gifsto</span>
        </div>
        <Card className="bg-white border-[#E8E2DA] shadow-lg">
          <CardContent className="p-8">
            {!success ? (
              <>
                <h2 className="font-serif text-2xl font-semibold text-[#3D3632] text-center">
                  Unclaim this gift?
                </h2>
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#F5F1EC] p-3">
                  <div className="h-12 w-12 rounded-lg bg-[#E8E2DA] flex items-center justify-center flex-shrink-0">
                    <Gift className="h-6 w-6 text-[#A39B92]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#3D3632]">Gift item</p>
                    <p className="text-xs text-[#6B6058]">Claim #{id}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[#6B6058] text-center">
                  This will make it available for someone else to claim.
                </p>
                <div className="mt-3 rounded-lg bg-[#D4A574]/10 p-3 border border-[#D4A574]/20">
                  <p className="text-xs text-[#6B6058]">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    The list owner will be notified.
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    asChild
                    className="flex-1 border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]"
                  >
                    <Link to="/">Keep my claim</Link>
                  </Button>
                  <Button
                    onClick={handleUnclaim}
                    disabled={unclaim.isPending}
                    className="flex-1 bg-[#C67C5A] text-white hover:bg-[#B56A48]"
                  >
                    {unclaim.isPending ? 'Processing...' : 'Yes, unclaim it'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#5A8F6E]/10">
                  <Check className="h-6 w-6 text-[#5A8F6E]" />
                </div>
                <h2 className="mt-4 font-serif text-xl font-semibold text-[#3D3632]">Done</h2>
                <p className="mt-2 text-sm text-[#6B6058]">
                  This item has been unclaimed and is now available for others.
                </p>
                <Button asChild className="mt-6 bg-[#C67C5A] text-white hover:bg-[#B56A48]">
                  <Link to="/">Go to homepage</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
