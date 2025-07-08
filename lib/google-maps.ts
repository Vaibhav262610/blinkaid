declare global {
  interface Window {
    google: any
    googleMapsLoaded: boolean
  }
}

let loadPromise: Promise<void> | null = null

export const loadGoogleMaps = (): Promise<void> => {
  console.log('loadGoogleMaps called')
  
  // If already loaded, return immediately
  if (window.google && window.googleMapsLoaded) {
    console.log('Google Maps already loaded, returning immediately')
    return Promise.resolve()
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    console.log('Google Maps already loading, returning existing promise')
    return loadPromise
  }

  // Create new loading promise
  loadPromise = new Promise((resolve, reject) => {
    console.log('Creating new Google Maps loading promise')
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for it to load')
      // Script exists but might not be loaded yet
      const checkLoaded = () => {
        if (window.google && window.google.maps) {
          console.log('Existing Google Maps script loaded')
          window.googleMapsLoaded = true
          resolve()
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    console.log('Creating new Google Maps script')
    // Create and load the script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCrMtqPErZSyTRKLB_pClosV9CRIzVSbU0&libraries=places,geometry`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully')
      window.googleMapsLoaded = true
      resolve()
    }
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script')
      loadPromise = null
      reject(new Error('Failed to load Google Maps'))
    }
    
    document.head.appendChild(script)
  })

  return loadPromise
}

export const isGoogleMapsLoaded = (): boolean => {
  return !!(window.google && window.googleMapsLoaded)
} 