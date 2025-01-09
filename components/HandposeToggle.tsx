'use client'

import { Switch } from '@headlessui/react'
import { cn } from '@/lib/utils'

interface HandposeToggleProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

export function HandposeToggle({ isEnabled, onToggle }: HandposeToggleProps) {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
      <Switch
        checked={isEnabled}
        onChange={onToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full',
          isEnabled ? 'bg-blue-600' : 'bg-gray-400'
        )}
      >
        <span className="sr-only">Enable handpose detection</span>
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition',
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </Switch>
      <span className="text-sm text-white">Handpose Detection</span>
    </div>
  )
}
