'use client'

import { createClient } from '@/lib/supabase/client'
import { getAuthCallbackUrl } from '@/lib/supabase/auth-redirect'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

export default function SignUpSuccessPage() {
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const resendConfirmation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsResending(true)
    setResendError(null)
    setResendMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            getAuthCallbackUrl(window.location.origin),
        },
      })

      if (error) throw error
      setResendMessage('A new confirmation email has been sent if this account still needs verification.')
    } catch (error: unknown) {
      setResendError(error instanceof Error ? error.message : 'Unable to resend the confirmation email.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl">
                  ✓
                </div>
              </div>
              <CardTitle className="text-2xl">Account Created!</CardTitle>
              <CardDescription>
                Please check your email to verify your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    We&apos;ve sent you a confirmation email. Click the link in the email to activate your account and get started with your diabetes risk assessment.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>Confirmation link expired?</strong> Enter your email to request a new link.
                  </p>
                  <form onSubmit={resendConfirmation} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="resend-email">Email</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                    {resendError && (
                      <p role="alert" className="text-sm text-red-700">{resendError}</p>
                    )}
                    {resendMessage && (
                      <p role="status" className="text-sm text-green-700">{resendMessage}</p>
                    )}
                    <Button type="submit" variant="outline" className="w-full" disabled={isResending}>
                      {isResending ? 'Sending...' : 'Resend confirmation email'}
                    </Button>
                  </form>
                  <p className="text-sm text-muted-foreground">
                    Once verified, you&apos;ll be able to access all features including prediction tracking and personalized insights.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full bg-accent hover:bg-accent-dark text-white">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
