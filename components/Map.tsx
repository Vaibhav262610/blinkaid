"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, Phone, Clock, Car, Building2 } from 'lucide-react'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/google-maps'
import { useGoogleMaps } from '@/hooks/use-google-maps'

interface Location {
  lat: number
  lng: number
  address?: string
}

interface MapProps {
  userLocation: Location
  driverLocation?: Location
  hospitalLocation?: Location
  requestId?: string
  status?: string
  estimatedArrival?: string
  onLocationUpdate?: (location: Location) => void
}



export default function Map({ 
  userLocation, 
  driverLocation, 
  hospitalLocation, 
  requestId,
  status,
  estimatedArrival,
  onLocationUpdate 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const { isLoaded: googleMapsLoaded, isLoading: googleMapsLoading, error: googleMapsError } = useGoogleMaps()
  const [isLoading, setIsLoading] = useState(true)
  const [loadTimeout, setLoadTimeout] = useState(false)

  useEffect(() => {
    if (googleMapsLoaded) {
      initializeMap()
    }
  }, [googleMapsLoaded])

  useEffect(() => {
    if (googleMapsError) {
      console.error('Google Maps error:', googleMapsError)
      setIsLoading(false)
    }
  }, [googleMapsError])

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading || googleMapsLoading) {
        console.warn('Map loading timeout - forcing completion')
        setLoadTimeout(true)
        setIsLoading(false)
      }
    }, 15000) // 15 second timeout

    return () => clearTimeout(timeout)
  }, [isLoading, googleMapsLoading])

  const initializeMap = () => {
    if (!mapRef.current || !isGoogleMapsLoaded()) {
      console.log('Map initialization skipped:', { 
        mapRef: !!mapRef.current, 
        googleMapsLoaded: isGoogleMapsLoaded() 
      })
      return
    }

    console.log('Initializing map with location:', userLocation)

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 14,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP
    })

    mapInstanceRef.current = map

    // Add markers
    addMarkers()
    setIsLoading(false)
    console.log('Map initialized successfully')
  }

  const addMarkers = () => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // User location marker (red)
    const userMarker = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Emergency Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      }
    })

    const userInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; color: #dc2626;">🚨 Emergency Location</h3>
          <p style="margin: 0; font-size: 12px;">${userLocation.address || 'Emergency request location'}</p>
        </div>
      `
    })

    userMarker.addListener('click', () => {
      userInfoWindow.open(mapInstanceRef.current, userMarker)
    })

    markersRef.current.push(userMarker)

    // Driver location marker (blue)
    if (driverLocation) {
      const driverMarker = new window.google.maps.Marker({
        position: driverLocation,
        map: mapInstanceRef.current,
        title: 'Ambulance Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="16" height="12" rx="2" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
              <rect x="6" y="8" width="12" height="8" fill="#ffffff"/>
              <circle cx="8" cy="16" r="2" fill="#2563eb"/>
              <circle cx="16" cy="16" r="2" fill="#2563eb"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      })

      const driverInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; color: #2563eb;">🚑 Ambulance</h3>
            <p style="margin: 0; font-size: 12px;">${driverLocation.address || 'Ambulance location'}</p>
            ${estimatedArrival ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #059669;">ETA: ${estimatedArrival}</p>` : ''}
          </div>
        `
      })

      driverMarker.addListener('click', () => {
        driverInfoWindow.open(mapInstanceRef.current, driverMarker)
      })

      markersRef.current.push(driverMarker)

      // Draw route from driver to user
      if (driverLocation && userLocation) {
        drawRoute(driverLocation, userLocation, '#2563eb')
      }
    }

    // Hospital location marker (green)
    if (hospitalLocation) {
      const hospitalMarker = new window.google.maps.Marker({
        position: hospitalLocation,
        map: mapInstanceRef.current,
        title: 'Nearest Hospital',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7V22H22V7L12 2Z" fill="#059669" stroke="#ffffff" stroke-width="2"/>
              <path d="M9 14H15M12 11V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      })

      const hospitalInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; color: #059669;">🏥 Nearest Hospital</h3>
            <p style="margin: 0; font-size: 12px;">${hospitalLocation.address || 'Hospital location'}</p>
          </div>
        `
      })

      hospitalMarker.addListener('click', () => {
        hospitalInfoWindow.open(mapInstanceRef.current, hospitalMarker)
      })

      markersRef.current.push(hospitalMarker)

      // Draw route from user to hospital
      if (userLocation && hospitalLocation) {
        drawRoute(userLocation, hospitalLocation, '#059669')
      }
    }

    // Fit bounds to show all markers
    const bounds = new window.google.maps.LatLngBounds()
    markersRef.current.forEach(marker => {
      bounds.extend(marker.getPosition())
    })
    mapInstanceRef.current.fitBounds(bounds)
  }

  const drawRoute = (origin: Location, destination: Location, color: string) => {
    if (!mapInstanceRef.current || !isGoogleMapsLoaded()) return

    const directionsService = new window.google.maps.DirectionsService()
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true
    })
    directionsRenderer.setMap(mapInstanceRef.current)

    const request = {
      origin: new window.google.maps.LatLng(origin.lat, origin.lng),
      destination: new window.google.maps.LatLng(destination.lat, destination.lng),
      travelMode: window.google.maps.TravelMode.DRIVING
    }

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result)
      }
    })
  }

  const findNearestHospital = async () => {
    if (!mapInstanceRef.current || !isGoogleMapsLoaded()) return

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
    const request = {
      location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: 5000,
      type: 'hospital'
    }

    service.nearbySearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        const nearestHospital = results[0]
        const hospitalLocation = {
          lat: nearestHospital.geometry.location.lat(),
          lng: nearestHospital.geometry.location.lng(),
          address: nearestHospital.vicinity
        }
        
        // Add hospital marker
        const hospitalMarker = new window.google.maps.Marker({
          position: hospitalLocation,
          map: mapInstanceRef.current,
          title: nearestHospital.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V22H22V7L12 2Z" fill="#059669" stroke="#ffffff" stroke-width="2"/>
                <path d="M9 14H15M12 11V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
        })

        markersRef.current.push(hospitalMarker)
      }
    })
  }

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${userLocation.lat},${userLocation.lng}`
    window.open(url, '_blank')
  }

  if (isLoading || googleMapsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {googleMapsLoading ? 'Loading Google Maps...' : 'Loading map...'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This may take a few seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (googleMapsError || loadTimeout) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <MapPin className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600 mb-2">
                {loadTimeout ? 'Map loading timeout' : 'Failed to load Google Maps'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {loadTimeout ? 'Please refresh the page to try again' : googleMapsError}
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="text-sm"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Emergency Tracking
          {requestId && (
            <Badge variant="outline" className="ml-auto">
              #{requestId}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs sm:text-sm">Emergency</span>
            </div>
            {driverLocation && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs sm:text-sm">Ambulance</span>
              </div>
            )}
            {hospitalLocation && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm">Hospital</span>
              </div>
            )}
          </div>
          {status && (
            <Badge 
              className={
                status === 'en_route' ? 'bg-blue-100 text-blue-800' :
                status === 'arrived' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }
            >
              {status}
            </Badge>
          )}
        </div>

        {/* Map Container */}
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border"
          style={{ minHeight: '384px' }}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={openInGoogleMaps}
            className="flex-1"
            variant="outline"
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Open in Google Maps</span>
            <span className="sm:hidden">Google Maps</span>
          </Button>
          <Button 
            onClick={findNearestHospital}
            className="flex-1"
            variant="outline"
            size="sm"
          >
            <Building2 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Find Nearest Hospital</span>
            <span className="sm:hidden">Find Hospital</span>
          </Button>
        </div>

        {/* Info Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">Emergency Location</p>
              <p className="text-xs text-gray-600">{userLocation.address || 'Location coordinates'}</p>
            </div>
          </div>
          
          {driverLocation && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Ambulance</p>
                <p className="text-xs text-gray-600">{driverLocation.address || 'Driver location'}</p>
                {estimatedArrival && (
                  <p className="text-xs text-green-600">ETA: {estimatedArrival}</p>
                )}
              </div>
            </div>
          )}
          
          {hospitalLocation && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Nearest Hospital</p>
                <p className="text-xs text-gray-600">{hospitalLocation.address || 'Hospital location'}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 