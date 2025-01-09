import { Switch } from '@headlessui/react'
import { cn } from '@/utils/utils'

interface HandposeToggleProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

export function HandposeToggle({ isEnabled, onToggle }: HandposeToggleProps) {
  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white/80 p-2 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
      <Switch
        checked={isEnabled}
        onChange={onToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          isEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        <span className="sr-only">Enable handpose magic!</span>
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </Switch>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Handpose Magic</span>
    </div>
  )
}
