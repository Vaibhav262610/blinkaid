"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Ambulance,
  MapPin,
  Clock,
  Phone,
  User,
  Navigation,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Building2,
} from "lucide-react"
import Map from "@/components/Map"

export default function DriverDashboard() {
  const [driver, setDriver] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [currentRequest, setCurrentRequest] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [completedTrips, setCompletedTrips] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [showMap, setShowMap] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<any>(null)
  const [hospitalLocation, setHospitalLocation] = useState<any>(null)

  useEffect(() => {
    const initializeDriver = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        const userType = localStorage.getItem('userType')
        
        if (!token || !userData || userType !== 'driver') {
          window.location.href = '/login'
          return
        }

        const driver = JSON.parse(userData)
        setDriver(driver)
        setIsOnline(driver.status === 'available')

        // Initial data fetch
        await fetchDriverData()
      } catch (error) {
        console.error('Error fetching driver data:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeDriver()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDriverData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDriverData = async () => {
    try {
      // Fetch driver's pending requests and completed trips
      await fetchPendingRequests()
      await fetchCompletedTrips()
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching driver data:', error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      // Fetch real emergency requests from API
      const response = await fetch('/api/emergency-requests?status=pending')
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.requests || [])
      } else {
        console.error('Failed to fetch pending requests')
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  const fetchCompletedTrips = async () => {
    try {
      // For now, we'll use mock data since we don't have completed trips API yet
      const mockTrips = [
        {
          id: "ER-2024-001",
          type: "Cardiac Emergency",
          completedAt: "13:45",
          duration: "25 minutes",
          hospital: "City General Hospital",
          rating: 5,
        },
        {
          id: "ER-2024-002",
          type: "Traffic Accident",
          completedAt: "11:20",
          duration: "35 minutes",
          hospital: "Metro Medical Center",
          rating: 5,
        },
      ]
      setCompletedTrips(mockTrips)
    } catch (error) {
      console.error('Error fetching completed trips:', error)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      if (!driver || !driver._id) {
        alert('Driver information not available. Please refresh the page.')
        return
      }

      const requestBody = {
        status: 'assigned',
        driverId: driver._id
      }

      console.log('Sending request:', requestBody)

      const response = await fetch(`/api/emergency-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        // Get the request details to show on map
        const requestResponse = await fetch(`/api/emergency-requests/${requestId}`)
        if (requestResponse.ok) {
          const requestData = await requestResponse.json()
          setSelectedRequest(requestData.request)
          
          // Set driver location (mock for now - in real app would get from GPS)
          setDriverLocation({
            lat: requestData.request.pickupLocation.lat + 0.01,
            lng: requestData.request.pickupLocation.lng + 0.01,
            address: 'Your current location'
          })
          
          // Find nearest hospital
          findNearestHospital(requestData.request.pickupLocation)
          
          setShowMap(true)
        }
        
        // Refresh data after accepting
        await fetchDriverData()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Failed to accept request: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error accepting request:', error)
      alert('Error accepting request')
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const requestBody = {
        status: 'cancelled'
      }

      console.log('Declining request:', requestBody)

      const response = await fetch(`/api/emergency-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        // Refresh data after declining
        await fetchDriverData()
        alert('Request declined')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(`Failed to decline request: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error declining request:', error)
      alert('Error declining request')
    }
  }

  const findNearestHospital = async (userLocation: any) => {
    // In a real app, this would use Google Places API to find the nearest hospital
    // For now, we'll create a mock hospital location
    setHospitalLocation({
      lat: userLocation.lat + 0.02,
      lng: userLocation.lng + 0.02,
      address: 'Nearest Hospital'
    })
  }

  const openInGoogleMaps = () => {
    if (selectedRequest) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedRequest.pickupLocation.lat},${selectedRequest.pickupLocation.lng}`
      window.open(url, '_blank')
    }
  }

  const callPatient = () => {
    if (selectedRequest?.userId?.phone) {
      window.open(`tel:${selectedRequest.userId.phone}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in as driver to access the dashboard</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Ambulance className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">blinkAid Driver</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge className={isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm">Online</span>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('userType')
                window.location.href = '/login'
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome, {driver.driver?.firstName} {driver.driver?.lastName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Ambulance Unit: {driver.vehicleNumber} | License: {driver.driver?.licenseNumber}
          </p>
        </div>

        {/* Status Alert */}
        {!isOnline && (
          <Alert className="mb-4 sm:mb-8 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <AlertDescription className="text-yellow-800 text-sm sm:text-base">
              <strong>You're offline.</strong> Turn on your status to receive emergency requests.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Active Request */}
        {currentRequest && isOnline && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Activity className="h-5 w-5" />
                Active Emergency Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-medium">{currentRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emergency Type</p>
                  <p className="font-medium">{currentRequest.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="font-medium">{currentRequest.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ETA</p>
                  <p className="font-medium text-red-600">{currentRequest.eta}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {currentRequest.location}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Patient Information</p>
                <div className="bg-white p-3 rounded-lg">
                  <p>
                    <strong>Age:</strong> {currentRequest.patient.age}
                  </p>
                  <p>
                    <strong>Gender:</strong> {currentRequest.patient.gender}
                  </p>
                  <p>
                    <strong>Medical Conditions:</strong> {currentRequest.patient.conditions}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate to Patient
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </Button>
                <Button variant="outline">Mark Arrived</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests" className="text-xs sm:text-sm">Pending</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm">Stats</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Pending Emergency Requests</CardTitle>
                <CardDescription className="text-sm">
                  {isOnline ? "Available requests in your area" : "Go online to see available requests"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {isOnline ? (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <Card key={request._id} className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold capitalize">{request.emergencyType.replace('_', ' ')}</h3>
                                <Badge
                                  className={
                                    request.priority === "high" || request.priority === "critical"
                                      ? "bg-red-100 text-red-800"
                                      : request.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }
                                >
                                  {request.priority} Priority
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                <MapPin className="h-3 w-3" />
                                {request.pickupLocation.address}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                <User className="h-3 w-3" />
                                {request.patientDetails.name} • {request.patientDetails.phone}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Requested at {new Date(request.requestTime).toLocaleTimeString()}
                              </p>
                              {request.description && (
                                <p className="text-sm text-gray-600 mt-2">
                                  {request.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleDeclineRequest(request._id)}
                              size="sm"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request)
                                setDriverLocation({
                                  lat: request.pickupLocation.lat + 0.01,
                                  lng: request.pickupLocation.lng + 0.01,
                                  address: 'Your current location'
                                })
                                findNearestHospital(request.pickupLocation)
                                setShowMap(true)
                              }}
                              size="sm"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              <span className="hidden sm:inline">View Route</span>
                              <span className="sm:hidden">Route</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Go online to receive emergency requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Trips</CardTitle>
                <CardDescription>Your recent emergency response history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedTrips.map((trip) => (
                    <Card key={trip.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Trip ID</p>
                            <p className="font-medium">{trip.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Emergency Type</p>
                            <p className="font-medium">{trip.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">{trip.duration}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Hospital</p>
                            <p className="font-medium">{trip.hospital}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Completed at {trip.completedAt}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <span className="text-yellow-500">{"★".repeat(trip.rating)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">47</div>
                    <div className="text-sm text-gray-600">Total Trips</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">3.2</div>
                    <div className="text-sm text-gray-600">Avg Response Time (min)</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
                    <div className="text-sm text-gray-600">Hours This Month</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Acceptance Rate</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">On-Time Arrival</span>
                    <span className="font-semibold">96%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Patient Satisfaction</span>
                    <span className="font-semibold">4.8/5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Safety Score</span>
                    <span className="font-semibold">98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Accept High Priority</p>
                    <p className="text-sm text-gray-600">Automatically accept high priority emergency requests</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Voice Navigation</p>
                    <p className="text-sm text-gray-600">Enable voice-guided navigation during trips</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications for new requests and updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Location Sharing</p>
                    <p className="text-sm text-gray-600">Share real-time location with patients and dispatch</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle ID</p>
                    <p className="font-medium">AMB-007</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-medium">EMR-2024</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Equipment Level</p>
                    <p className="font-medium">Advanced Life Support</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Inspection</p>
                    <p className="font-medium">Jan 15, 2024</p>
                  </div>
                </div>
                <Button variant="outline">Update Vehicle Info</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Map Dialog */}
      <Dialog open={showMap} onOpenChange={setShowMap}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Emergency Route Navigation
              {selectedRequest && (
                <Badge variant="outline" className="ml-auto">
                  #{selectedRequest.requestId}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 space-y-4">
            {selectedRequest && (
              <Map
                userLocation={selectedRequest.pickupLocation}
                driverLocation={driverLocation}
                hospitalLocation={hospitalLocation}
                requestId={selectedRequest.requestId}
                status={selectedRequest.status}
                estimatedArrival="5-8 minutes"
              />
            )}
            <div className="flex gap-2">
              <Button 
                onClick={openInGoogleMaps}
                className="flex-1"
                variant="outline"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Open in Google Maps
              </Button>
              <Button 
                onClick={callPatient}
                className="flex-1"
                variant="outline"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Patient
              </Button>
              <Button 
                onClick={() => setShowMap(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
