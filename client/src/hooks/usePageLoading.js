import { useEffect, useState } from 'react'

export function usePageLoading(delay = 500) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return isLoading
}
