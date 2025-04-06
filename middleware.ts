import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the request is for the API route
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Get the API key from the environment variables
    const apiKey = process.env.GOOGLE_API_KEY

    // Only redirect if it's a server-side API call
    // Client-side calls will use the key from localStorage
    if (!apiKey && !request.cookies.has("HAS_API_KEY")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}

