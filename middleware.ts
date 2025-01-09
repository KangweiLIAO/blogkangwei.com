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

  // Skip CSP in development for easier debugging
  if (isDev) {
    return NextResponse.next()
  }

  // Define Content Security Policy directives
  // Controls which resources can be loaded and from where
  const cspHeader = [
    // Only allow resources from same origin
    "default-src 'self'",

    // Scripts must have nonce or be loaded via strict-dynamic
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,

    // Allow inline styles
    "style-src 'self' 'unsafe-inline'",

    // Allow images from any source including blobs and data URIs
    "img-src 'self' blob: data: *",

    // Allow media from same origin, blobs, data URIs and mediastream
    "media-src 'self' blob: data: mediastream:",

    // Define allowed external connections
    "connect-src 'self' https://tfhub.dev https://*.tfhub.dev https://*.vercel-insights.com https://*.vercel-analytics.com https://va.vercel-scripts.com",

    // Only allow fonts from same origin
    "font-src 'self'",

    // Only allow frames from same origin
    "frame-src 'self'",

    // Allow web workers from same origin and blobs
    "worker-src 'self' blob:",

    // Allow child frames from same origin and blobs
    "child-src 'self' blob:",

    // Restrict base URI to same origin
    "base-uri 'self'",

    // Only allow form submissions to same origin
    "form-action 'self'",

    // Upgrade HTTP to HTTPS
    'upgrade-insecure-requests',
  ]
    .filter(Boolean)
    .join('; ')

  // Set up request headers with nonce and CSP
  const requestHeaders = new Headers()
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim())

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set CSP and nonce headers on response
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)

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
