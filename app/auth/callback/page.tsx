'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const hasStarted = useRef(false)
  const [message, setMessage] = useState('Verifying your account...')

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const verifyUser = async () => {
      const code = new URLSearchParams(window.location.search).get('code')

      if (!code) {
        setMessage('Authentication failed. Please log in again.')
        return
      }

      try {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          setMessage('Authentication failed. Please log in again.')
          return
        }

        setMessage('Login successful. Redirecting...')
        router.replace('/prediction')
      } catch {
        setMessage('Authentication failed. Please log in again.')
      }
    }

    void verifyUser()
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authentication</h1>
        <p className="mt-3">{message}</p>
      </div>
    </main>
  )
}
