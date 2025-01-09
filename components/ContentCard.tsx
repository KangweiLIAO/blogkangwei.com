import { cn } from '@/utils/utils'
import { ReactNode } from 'react'

interface ContentCardProps {
  children: ReactNode
  className?: string
}

export const ContentCard = ({ children, className }: ContentCardProps) => {
  return (
    <div
      className={cn(
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 rounded-2xl border p-12 backdrop-blur',
        className
      )}
    >
      {children}
    </div>
  )
}
