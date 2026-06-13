import { type ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/signals', {
      method: 'GET',
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then((res) => {
        setStatus(res.ok ? 'authenticated' : 'unauthenticated')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Network error — treat as unauthenticated for safety.
        setStatus('unauthenticated')
      })

    return () => {
      controller.abort()
    }
  }, [])

  if (status === 'loading') return null // render nothing; do NOT flash dashboard content
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <>{children}</>
}
