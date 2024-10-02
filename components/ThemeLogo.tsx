'use client'

import { useTheme } from 'next-themes'
import LightLogo from '@/data/logo.svg'
import DarkLogo from '@/data/logo-dark.svg'

export default function ThemeAwareLogo() {
  const { theme } = useTheme()
  return theme === 'dark' ? <LightLogo /> : <DarkLogo />
}
