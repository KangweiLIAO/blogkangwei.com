'use client'
import { Button } from '@/components/Button'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import MobileNav from './MobileNav'

export function MenuButton() {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={handleToggle}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <MobileNav isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
