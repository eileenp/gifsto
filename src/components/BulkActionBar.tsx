import { useState } from 'react'
import { ArrowRight, Copy, Trash2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface OwnedList {
  id: number
  title: string
}

interface ClaimedItem {
  id: number
  name: string
  claimerName: string | null
}

interface Props {
  count: number
  ownedLists: OwnedList[]
  claimedItems: ClaimedItem[]          // items in selection that have active claims
  onMove: (targetListId: number) => void
  onCopy: (targetListId: number) => void
  onDelete: () => void
  onCreateNewAndMove: () => void
  onCreateNewAndCopy: () => void
  onClear: () => void
}

export function BulkActionBar({
  count,
  ownedLists,
  claimedItems,
  onMove,
  onCopy,
  onDelete,
  onCreateNewAndMove,
  onCreateNewAndCopy,
  onClear,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [claimWarning, setClaimWarning] = useState<{ targetListId: number } | null>(null)

  function handleMoveSelect(listId: number) {
    if (claimedItems.length > 0) {
      setClaimWarning({ targetListId: listId })
    } else {
      onMove(listId)
    }
  }

  return (
    <>
      {/* Floating bar */}
      <div
        role="toolbar"
        aria-label={`Bulk actions for ${count} selected item${count !== 1 ? 's' : ''}`}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-[#3D3632] px-5 py-3 shadow-2xl text-white text-sm whitespace-nowrap"
      >
        <span className="font-semibold">{count} item{count !== 1 ? 's' : ''} selected</span>

        <div className="w-px h-5 bg-white/20" />

        {/* Move to… */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/10 h-8 gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              Move to…
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[200px]">
            {ownedLists.map((list) => (
              <DropdownMenuItem
                key={list.id}
                onClick={() => handleMoveSelect(list.id)}
                className="cursor-pointer"
              >
                {list.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCreateNewAndMove}
              className="cursor-pointer text-[#C67C5A] font-medium gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create new list
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Copy to… */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/10 h-8 gap-1.5"
            >
              <Copy className="h-4 w-4" />
              Copy to…
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="min-w-[200px]">
            {ownedLists.map((list) => (
              <DropdownMenuItem
                key={list.id}
                onClick={() => onCopy(list.id)}
                className="cursor-pointer"
              >
                {list.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCreateNewAndCopy}
              className="cursor-pointer text-[#C67C5A] font-medium gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create new list
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          className="text-red-300 hover:text-red-200 hover:bg-white/10 h-8 gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>

        <div className="w-px h-5 bg-white/20" />

        <button
          onClick={onClear}
          className="text-white/60 hover:text-white/90 text-xs flex items-center gap-1"
          aria-label="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white border-[#E8E2DA]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-[#3D3632]">
              Remove {count} item{count !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#6B6058]">
              This removes each item from the list it's on. Items on other lists won't be affected.
              Anyone who claimed an item will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Remove {count} item{count !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Claimed-item warning (Move only) */}
      <AlertDialog open={!!claimWarning} onOpenChange={() => setClaimWarning(null)}>
        <AlertDialogContent className="bg-white border-[#E8E2DA]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-[#3D3632]">
              {claimedItems.length} item{claimedItems.length !== 1 ? 's' : ''} in your selection {claimedItems.length !== 1 ? 'have' : 'has'} active claims
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-[#6B6058] space-y-3">
                <ul className="space-y-1">
                  {claimedItems.map((item) => (
                    <li key={item.id} className="text-sm">
                      <span className="font-medium text-[#3D3632]">{item.name}</span>
                      {item.claimerName && (
                        <span className="text-[#A39B92]"> — claimed by {item.claimerName}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-sm">
                  Moving a claimed item could confuse the person who claimed it. You can skip claimed
                  items and move only the rest.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (claimWarning) {
                  onMove(claimWarning.targetListId)
                  setClaimWarning(null)
                }
              }}
              className="bg-[#C67C5A] text-white hover:bg-[#B56A48]"
            >
              Skip claimed &amp; move the rest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
