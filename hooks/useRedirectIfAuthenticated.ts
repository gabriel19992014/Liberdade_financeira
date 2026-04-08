'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredToken } from '@/services/api-client'

export function useRedirectIfAuthenticated(path = '/dashboard', delayMs = 100) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = getStoredToken()
      if (token) {
        router.push(path)
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [delayMs, path, router])
}
