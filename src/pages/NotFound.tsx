import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white border-[#E8E2DA] shadow-lg">
        <CardContent className="p-8 text-center">
          <h1 className="font-serif text-6xl font-bold text-[#C67C5A]">404</h1>
          <h2 className="mt-4 font-serif text-xl font-semibold text-[#3D3632]">Page not found</h2>
          <p className="mt-2 text-sm text-[#6B6058]">
            The link may have changed or the list may have been removed.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              variant="outline"
              asChild
              className="border-[#E8E2DA] text-[#3D3632] hover:bg-[#F5F1EC]"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go to homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
