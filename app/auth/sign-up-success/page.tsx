'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignUpSuccessPage() {
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
                    <strong>Didn&apos;t receive the email?</strong> Check your spam folder or contact our support team.
                  </p>
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
