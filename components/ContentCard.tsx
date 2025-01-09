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
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 rounded-2xl border backdrop-blur',
        'p-6 sm:p-8 md:p-10 lg:p-12',
        'w-full max-w-full',
        className
      )}
    >
      {children}
    </div>
  )
}
