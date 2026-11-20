'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const hasStarted = useRef(false)
  const [message, setMessage] = useState('Verifying your account...')
  const [canRecover, setCanRecover] = useState(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const verifyUser = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const authError = params.get('error')

      if (authError) {
        const errorCode = params.get('error_code')
        setMessage(
          errorCode === 'otp_expired'
            ? 'This confirmation link has expired or was already used. Request a new confirmation email.'
            : params.get('error_description') ??
                'Authentication failed. Request a new confirmation email or sign in.',
        )
        setCanRecover(true)
        return
      }

      if (!code) {
        setMessage('This confirmation link is invalid. Request a new confirmation email.')
        setCanRecover(true)
        return
      }

      try {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          setMessage('This confirmation link is invalid or expired. Request a new confirmation email.')
          setCanRecover(true)
          return
        }

        setMessage('Login successful. Redirecting...')
        router.replace('/prediction')
      } catch {
        setMessage('Unable to verify this link. Request a new confirmation email and try again.')
        setCanRecover(true)
      }
    }

    void verifyUser()
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authentication</h1>
        <p className="mt-3">{message}</p>
        {canRecover && (
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/auth/sign-up-success">Resend confirmation</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
