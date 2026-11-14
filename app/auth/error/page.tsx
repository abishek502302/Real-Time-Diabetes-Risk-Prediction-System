'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-3xl">
                  ✕
                </div>
              </div>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong during the authentication process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-800">
                    We encountered an error while trying to authenticate your account. This might be due to an expired link or network issue.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Please try one of the following:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Request a new confirmation email</li>
                    <li>Try signing up again</li>
                    <li>Contact our support team</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Link href="/auth/sign-up" className="block">
                    <Button className="w-full bg-accent hover:bg-accent-dark text-white">
                      Try Signing Up Again
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" className="w-full border-border">
                      Return to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
