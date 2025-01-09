import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Generate a strong nonce using Web Crypto API
const generateNonce = () => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const nonce = generateNonce()
  const isDev = process.env.NODE_ENV === 'development'

  // In development, we need to be more permissive
  if (isDev) {
    return NextResponse.next()
  }

  // Create CSP header with strict-dynamic and proper nonce handling
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: *",
    "media-src 'self' blob: data: mediastream:",
    "connect-src 'self' https://tfhub.dev https://*.tfhub.dev https://*.vercel-insights.com https://*.vercel-analytics.com https://va.vercel-scripts.com",
    "font-src 'self'",
    "frame-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ]
    .filter(Boolean)
    .join('; ')

  const requestHeaders = new Headers()
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set the CSP header
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)

  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!_next|api).*)',
    // Optional: Match all root level paths
    '/',
  ],
}
