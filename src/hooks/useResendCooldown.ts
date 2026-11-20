import { useCallback, useEffect, useState } from 'react'

/**
 * Countdown shown on "Resend code" buttons. The backend accepts one send per
 * minute per address; the cooldown mirrors that so the user sees when the
 * next attempt will go through instead of hitting a 429.
 */
export function useResendCooldown(seconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft(value => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const start = useCallback(() => setSecondsLeft(seconds), [seconds])

  return { secondsLeft, coolingDown: secondsLeft > 0, start }
}

/** Keeps only digits, capped at the 6-character code length. */
export function onlyCodeDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

export const CODE_PATTERN = /^\d{6}$/
