"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Ambulance, MapPin, Clock, Phone, User, Navigation, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react"
import Map from "@/components/Map"
import Link from "next/link"

interface Location {
  lat: number
  lng: number
  address?: string
}

interface EmergencyRequest {
  _id: string
  requestId: string
  emergencyType: string
  status: string
  priority: string
  pickupLocation: Location
  description: string
  requestTime: string
  estimatedArrival?: string
  responseTime?: number
  driverId?: {
    _id: string
    vehicleNumber: string
    driver: {
      firstName: string
      lastName: string
      phone: string
    }
  }
  userId: {
    firstName: string
    lastName: string
    phone: string
  }
}

export default function TrackingPage() {
  const [currentRequest, setCurrentRequest] = useState<EmergencyRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [driverLocation, setDriverLocation] = useState<Location | null>(null)
  const [hospitalLocation, setHospitalLocation] = useState<Location | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchCurrentRequest = async () => {
      try {
        // Get current emergency request ID from localStorage
        const requestId = localStorage.getItem('currentEmergencyRequest')
        if (!requestId) {
          setError('No active emergency request found')
          setLoading(false)
          return
        }

        // Fetch the emergency request
        const response = await fetch(`/api/emergency-requests/${requestId}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentRequest(data.request)
          
          // If driver is assigned, get driver location (mock for now)
          if (data.request.driverId) {
            // In a real app, this would get the driver's real-time location
            setDriverLocation({
              lat: data.request.pickupLocation.lat + 0.01, // Mock driver location
              lng: data.request.pickupLocation.lng + 0.01,
              address: 'Driver current location'
            })
          }
        } else {
          setError('Failed to fetch emergency request')
        }
      } catch (error) {
        console.error('Error fetching emergency request:', error)
        setError('Error loading tracking information')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentRequest()

    // Set up real-time updates every 10 seconds
    const interval = setInterval(fetchCurrentRequest, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'en_route':
        return 'bg-orange-100 text-orange-800'
      case 'arrived':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'assigned':
        return <Ambulance className="h-4 w-4" />
      case 'en_route':
        return <Navigation className="h-4 w-4" />
      case 'arrived':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const callDriver = () => {
    if (currentRequest?.driverId?.driver?.phone) {
      window.open(`tel:${currentRequest.driverId.driver.phone}`, '_blank')
    }
  }

  const callEmergency = () => {
    window.open('tel:911', '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error || !currentRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-xl">No Active Emergency</CardTitle>
            <CardDescription>
              {error || 'No emergency request is currently being tracked'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/emergency">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Ambulance className="h-4 w-4 mr-2" />
                Request Emergency
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={callEmergency}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 911
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Ambulance className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Emergency Tracking</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            <Link href="/dashboard/user">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Emergency Alert */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency in progress!</strong> Help is on the way. Stay calm and follow instructions.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Map
              userLocation={currentRequest.pickupLocation}
              driverLocation={driverLocation || undefined}
              hospitalLocation={hospitalLocation || undefined}
              requestId={currentRequest.requestId}
              status={currentRequest.status}
              estimatedArrival={currentRequest.estimatedArrival}
            />
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Request Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(currentRequest.status)}
                  Request Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={getStatusColor(currentRequest.status)}>
                    {currentRequest.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <Badge 
                    className={
                      currentRequest.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      currentRequest.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {currentRequest.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Request ID</span>
                  <span className="font-mono text-sm">{currentRequest.requestId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Request Time</span>
                  <span className="text-sm">
                    {new Date(currentRequest.requestTime).toLocaleTimeString()}
                  </span>
                </div>
                {currentRequest.responseTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium text-green-600">
                      {currentRequest.responseTime} minutes
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Information */}
            {currentRequest.driverId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Assigned Driver
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Driver Name</p>
                    <p className="font-medium">
                      {currentRequest.driverId.driver.firstName} {currentRequest.driverId.driver.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Number</p>
                    <p className="font-medium">{currentRequest.driverId.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{currentRequest.driverId.driver.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={callDriver}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Driver
                    </Button>
                    <Button 
                      onClick={callEmergency}
                      variant="outline"
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call 911
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Emergency Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">
                    {currentRequest.emergencyType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{currentRequest.pickupLocation.address}</p>
                </div>
                {currentRequest.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-sm">{currentRequest.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={callEmergency}
                  variant="outline" 
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 911
                </Button>
                <Link href="/emergency">
                  <Button variant="outline" className="w-full">
                    <Ambulance className="h-4 w-4 mr-2" />
                    New Emergency
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
