"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ambulance, MapPin, Clock, User, History, Settings, AlertTriangle, Heart, Shield } from "lucide-react"
import Link from "next/link"

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [emergencyHistory, setEmergencyHistory] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (!token || !userData) {
          // Redirect to login if no token
          window.location.href = '/login'
          return
        }

        const user = JSON.parse(userData)
        setUser(user)

        // Initial data fetch
        await fetchUserData()
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeUser()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchUserData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user's emergency history
      await fetchEmergencyHistory()
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchEmergencyHistory = async () => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      
      // Fetch user's emergency history from API
      const response = await fetch(`/api/emergency-requests?userId=${user._id}`)
      if (response.ok) {
        const data = await response.json()
        setEmergencyHistory(data.requests || [])
      } else {
        console.error('Failed to fetch emergency history')
      }
    } catch (error) {
      console.error('Error fetching emergency history:', error)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access your dashboard</p>
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Ambulance className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RapidResponse</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-100 text-green-800">Active User</Badge>
            <Button 
              variant="outline" 
              size="sm"
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

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName} {user.lastName}!
          </h1>
          <p className="text-gray-600">Your emergency response dashboard</p>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency?</strong> Use the button below for immediate assistance or call 911.
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/emergency">
            <Card className="border-red-200 hover:border-red-300 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <Ambulance className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Emergency Request</h3>
                    <p className="text-sm text-gray-600">Get immediate help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/tracking">
            <Card className="border-blue-200 hover:border-blue-300 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Track Emergency</h3>
                    <p className="text-sm text-gray-600">Monitor active requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-green-200 hover:border-green-300 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Health Profile</h3>
                  <p className="text-sm text-gray-600">Manage medical info</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Emergency Status</span>
                      <Badge className="bg-green-100 text-green-800">Safe</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location Services</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Emergency Contacts</span>
                      <Badge className="bg-blue-100 text-blue-800">3 Added</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Requests</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="font-semibold">5 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="font-semibold">Jan 2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest emergency requests and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyHistory.slice(0, 3).map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{request.emergencyType.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(request.requestTime).toLocaleDateString()} at {new Date(request.requestTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className={
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'en_route' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Emergency History
                </CardTitle>
                <CardDescription>Complete history of your emergency requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyHistory.map((request) => (
                    <Card key={request._id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Request ID</p>
                            <p className="font-medium">{request.requestId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Emergency Type</p>
                            <p className="font-medium capitalize">{request.emergencyType.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Response Time</p>
                            <p className="font-medium">
                              {request.responseTime ? `${request.responseTime} minutes` : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge 
                              className={
                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                request.status === 'en_route' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Location:</strong> {request.pickupLocation.address}
                          </p>
                          {request.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Description:</strong> {request.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {new Date(request.requestTime).toLocaleDateString()} at {new Date(request.requestTime).toLocaleTimeString()}
                            </span>
                            {request.driverId && (
                              <span className="text-sm text-gray-600">
                                Driver: {request.driverId.driver?.firstName} {request.driverId.driver?.lastName}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">
                      {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>Your current address for emergency response</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Street</p>
                    <p className="font-medium">{user.address?.street || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-medium">{user.address?.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-medium">{user.address?.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ZIP Code</p>
                    <p className="font-medium">{user.address?.zipCode || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Profile</CardTitle>
                <CardDescription>
                  Keep your medical information up to date for faster emergency response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Blood Type</p>
                    <p className="font-medium">{user.bloodType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Allergies</p>
                    <p className="font-medium">
                      {user.allergies && user.allergies.length > 0 
                        ? user.allergies.join(', ') 
                        : 'None reported'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Medical Conditions</p>
                    <p className="font-medium">
                      {user.medicalConditions && user.medicalConditions.length > 0 
                        ? user.medicalConditions.join(', ') 
                        : 'None reported'
                      }
                    </p>
                  </div>
                </div>
                <Button className="mt-4">Update Medical Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>People to notify in case of emergency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.emergencyContact && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {user.emergencyContact.name} ({user.emergencyContact.relationship})
                        </p>
                        <p className="text-sm text-gray-600">{user.emergencyContact.phone}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="mt-4 bg-transparent">
                  Add Emergency Contact
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  App Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Location Services</p>
                    <p className="text-sm text-gray-600">Allow app to access your location for emergency requests</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates about emergency requests and system alerts</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Voice Activation</p>
                    <p className="text-sm text-gray-600">Enable "Hey app, I need an ambulance" voice command</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
