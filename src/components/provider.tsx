'use client'

import { ReactNode } from 'react'
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs'
import { ThemeProvider } from './theme-provider'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider defaultTheme="dark" attribute="class" enableSystem disableTransitionOnChange>
        <Authenticated>
         <UserButton/>
         {children}
      </Authenticated>
      <Unauthenticated>
        <SignInButton/>
        <SignUpButton/>
      </Unauthenticated>
      <AuthLoading>
        Authenticating...
      </AuthLoading>
      </ThemeProvider>
    </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}