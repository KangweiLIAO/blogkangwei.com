// Import required Next.js server components
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Generate a strong nonce using Web Crypto API for enhanced security
const generateNonce = () => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export function middleware(request: NextRequest) {
  // Skip middleware processing for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Generate unique nonce for this request
  const nonce = generateNonce()

  // Check if running in development environment
  const isDev = process.env.NODE_ENV === 'development'

  // Define trusted domains for Vercel Analytics
  const vercelDomains = [
    'vercel.com',
    '*.vercel.com',
    'vercel.app',
    '*.vercel.app',
    'vercel.live',
    '*.vercel.live',
  ]

  // Define Content Security Policy directives
  const cspHeader = [
    // Default source restrictions
    `default-src 'self' ${vercelDomains.join(' ')}`,

    // Scripts configuration
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https: http: blob: ${vercelDomains.join(' ')} 'wasm-unsafe-eval' 'inline-speculation-rules'`,

    // Allow inline styles
    "style-src 'self' 'unsafe-inline'",

    // Allow images from any source
    "img-src 'self' blob: data: https: http:",

    // Allow media
    "media-src 'self' blob: data: mediastream:",

    // Allow connections
    `connect-src 'self' blob: ${vercelDomains.join(' ')} https://* wss://* http://localhost:* ws://localhost:* https://cdn.jsdelivr.net`,

    // Allow fonts
    "font-src 'self' data:",

    // Frame configuration
    "frame-src 'self' https: http:",

    // Worker configuration
    "worker-src 'self' blob: 'unsafe-eval' https://cdn.jsdelivr.net",

    // Allow WebAssembly
    "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net",

    // Child source configuration
    "child-src 'self' blob:",

    // Base URI restriction
    "base-uri 'self'",

    // Form action restriction
    "form-action 'self'",

    // Manifest source restriction
    "manifest-src 'self'",

    // Object source restriction
    "object-src 'none'",

    // Upgrade insecure requests
    ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
  ]
    .filter(Boolean)
    .join('; ')

  // Set up request headers
  const requestHeaders = new Headers()
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())

  // Add additional security headers
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=self',
  }

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set CSP and security headers on response
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)

  // Add all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Configure middleware to run on all routes except internal Next.js paths
export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!_next|api).*)',
    // Optional: Match all root level paths
    '/',
  ],
}
