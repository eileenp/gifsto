import { useParams, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Gift, Heart, Bookmark } from 'lucide-react'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = ['bg-[#C67C5A]', 'bg-[#8FA98F]', 'bg-[#D4A574]', 'bg-[#5A8F6E]', 'bg-[#B85450]']

export default function PeopleAccess() {
  const { id } = useParams<{ id: string }>()
  const listId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth({ redirectOnUnauthenticated: true })

  const { data: list, isLoading } = trpc.list.get.useQuery(
    { id: listId },
    { enabled: !!user && !!listId }
  )

  if (isLoading || !list) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C67C5A] border-t-transparent" />
        </div>
      </div>
    )
  }

  const accessRecords = list.accessRecords || []
  const hasPeople = accessRecords.length > 0

  // Aggregate activities per person
  const peopleMap = new Map<string, any>()
  for (const record of accessRecords) {
    if (!record.email) continue
    const key = record.email
    if (!peopleMap.has(key)) {
      peopleMap.set(key, {
        name: record.name || record.email,
        email: record.email,
        claimed: 0,
        contributed: 0,
        saved: record.saved,
      })
    }
  }

  // Count claims per person
  for (const item of list.items || []) {
    for (const claim of item.claims || []) {
      const person = peopleMap.get(claim.email)
      if (person) {
        person.claimed += 1
      }
    }
    for (const contrib of item.contributions || []) {
      const person = peopleMap.get(contrib.email)
      if (person) {
        person.contributed += parseFloat(contrib.amount || '0')
      }
    }
  }

  const people = Array.from(peopleMap.values())

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <button
          onClick={() => navigate(`/lists/${listId}`)}
          className="flex items-center gap-1 text-sm text-[#6B6058] hover:text-[#3D3632] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {list.title}
        </button>

        <h1 className="font-serif text-3xl font-semibold text-[#3D3632]">People with access</h1>
        <p className="mt-1 text-sm text-[#6B6058]">{people.length} {people.length === 1 ? 'person' : 'people'}</p>

        <div className="mt-4 rounded-lg bg-[#D4A574]/10 p-4 border border-[#D4A574]/20">
          <p className="text-sm text-[#6B6058]">
            <strong className="text-[#3D3632]">Privacy note:</strong> Only identifiable people are shown here (those who gave their name and email when claiming or contributing). Anyone with the link and password can still view the list anonymously. To fully block someone, change the list password.
          </p>
        </div>

        {!hasPeople && (
          <Card className="border-[#E8E2DA] bg-white mt-6">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <p className="text-[#6B6058]">No one has accessed this list yet.</p>
              <Button
                onClick={() => {
                  const url = `${window.location.origin}/lists/${list.id}/access`
                  navigator.clipboard.writeText(`${url}\nPassword: ${list.password}`)
                }}
                className="mt-4 bg-[#C67C5A] text-white hover:bg-[#B56A48]"
              >
                Copy your list link
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 space-y-3">
          {people.map((person: any, i: number) => (
            <Card key={person.email} className="border-[#E8E2DA] bg-white">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${avatarColors[i % avatarColors.length]} text-white text-sm font-medium`}>
                  {getInitials(person.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#3D3632]">{person.name}</p>
                  <p className="text-sm text-[#A39B92] truncate">{person.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {person.claimed > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#C67C5A]/10 px-2.5 py-0.5 text-xs font-medium text-[#C67C5A]">
                      <Gift className="h-3 w-3" />
                      Claimed {person.claimed}
                    </span>
                  )}
                  {person.contributed > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#8FA98F]/10 px-2.5 py-0.5 text-xs font-medium text-[#5A8F6E]">
                      <Heart className="h-3 w-3" />
                      Contributed ${person.contributed.toFixed(2)}
                    </span>
                  )}
                  {person.saved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D4A574]/10 px-2.5 py-0.5 text-xs font-medium text-[#D4A574]">
                      <Bookmark className="h-3 w-3" />
                      Saved list
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
