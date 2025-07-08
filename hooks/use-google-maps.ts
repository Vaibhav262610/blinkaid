import { useState, useEffect } from 'react'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/google-maps'

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      console.log('Initializing Google Maps...')
      
      // If already loaded, set state immediately
      if (isGoogleMapsLoaded()) {
        console.log('Google Maps already loaded')
        setIsLoaded(true)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('Loading Google Maps...')
        await loadGoogleMaps()
        console.log('Google Maps loaded successfully')
        setIsLoaded(true)
      } catch (err) {
        console.error('Failed to load Google Maps:', err)
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps')
      } finally {
        setIsLoading(false)
      }
    }

    initializeGoogleMaps()
  }, [])

  return {
    isLoaded,
    isLoading,
    error,
    reload: () => {
      setIsLoaded(false)
      setIsLoading(false)
      setError(null)
      // Force reload by clearing the global state
      if (typeof window !== 'undefined') {
        window.googleMapsLoaded = false
      }
    }
  }
} 