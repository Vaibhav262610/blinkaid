"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Activity, AlertTriangle, CheckCircle, MapPin, TrendingUp, Shield, Settings, Clock, RefreshCw, Check, X, Eye, Users, Car } from "lucide-react"

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalAmbulances: 0,
    activeAmbulances: 0,
    pendingApprovals: 0,
  })
  const [users, setUsers] = useState<any[]>([])
  const [ambulances, setAmbulances] = useState<any[]>([])
  const [pendingAmbulances, setPendingAmbulances] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        const userType = localStorage.getItem('userType')
        
        if (!token || !userData || userType !== 'admin') {
          window.location.href = '/login'
          return
        }

        const admin = JSON.parse(userData)
        setAdmin(admin)

        // Initial data fetch
        await fetchRealTimeData()
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('/api/realtime')
      const data = await response.json()
      
      if (data.data) {
        setSystemStats(data.data.stats || {
          totalUsers: 0,
          totalAdmins: 0,
          totalAmbulances: 0,
          activeAmbulances: 0,
          pendingApprovals: 0,
        })
        setUsers(data.data.recentUsers || [])
        setAmbulances(data.data.recentAmbulances || [])
        setPendingAmbulances(data.data.pendingAmbulances || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error)
    }
  }

  const handleApproval = async (ambulanceId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/ambulances/${ambulanceId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved }),
      })

      if (response.ok) {
        // Refresh data after approval
        await fetchRealTimeData()
        alert(`Driver ${approved ? 'approved' : 'rejected'} successfully!`)
      } else {
        alert('Failed to update approval status')
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('Error updating approval status')
    }
  }

  const [recentRequests] = useState([
    {
      id: "ER-2024-010",
      type: "Cardiac Emergency",
      status: "In Progress",
      location: "Downtown District",
      driver: "John Smith (AMB-003)",
      requestTime: "14:45",
      responseTime: "2 min",
    },
    {
      id: "ER-2024-009",
      type: "Traffic Accident",
      status: "Completed",
      location: "Highway 101",
      driver: "Sarah Johnson (AMB-007)",
      requestTime: "14:30",
      responseTime: "4 min",
    },
    {
      id: "ER-2024-008",
      type: "Breathing Difficulty",
      status: "En Route",
      location: "Residential Area",
      driver: "Mike Chen (AMB-012)",
      requestTime: "14:25",
      responseTime: "3 min",
    },
  ])

  const [drivers] = useState([
    {
      id: "DRV-001",
      name: "John Smith",
      vehicle: "AMB-003",
      status: "Active",
      location: "Downtown",
      tripsToday: 8,
      rating: 4.9,
    },
    {
      id: "DRV-002",
      name: "Sarah Johnson",
      vehicle: "AMB-007",
      status: "Available",
      location: "North District",
      tripsToday: 6,
      rating: 4.8,
    },
    {
      id: "DRV-003",
      name: "Mike Chen",
      vehicle: "AMB-012",
      status: "En Route",
      location: "South District",
      tripsToday: 7,
      rating: 4.9,
    },
  ])

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

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in as admin to access the dashboard</p>
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
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">blinkAid Admin</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">System Online</Badge>
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
            Welcome, {admin.firstName} {admin.lastName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Monitor and manage the emergency response network</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{systemStats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{systemStats.totalAdmins}</div>
                <div className="text-sm text-gray-600">Total Admins</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{systemStats.totalAmbulances}</div>
                <div className="text-sm text-gray-600">Total Ambulances</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{systemStats.activeAmbulances}</div>
                <div className="text-sm text-gray-600">Active Ambulances</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{systemStats.pendingApprovals}</div>
                <div className="text-sm text-gray-600">Pending Approvals</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm">Users</TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs sm:text-sm">Ambulances</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Approvals</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Emergency Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{request.id}</span>
                            <Badge
                              className={
                                request.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : request.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {request.type} • {request.location}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.driver} • Response: {request.responseTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Users</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(systemStats.totalUsers / Math.max(systemStats.totalUsers, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{systemStats.totalUsers}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Admins</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(systemStats.totalAdmins / Math.max(systemStats.totalAdmins, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{systemStats.totalAdmins}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Ambulances</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(systemStats.totalAmbulances / Math.max(systemStats.totalAmbulances, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{systemStats.totalAmbulances}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Ambulances</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(systemStats.activeAmbulances / Math.max(systemStats.totalAmbulances, 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{systemStats.activeAmbulances}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">API Status</p>
                      <p className="font-medium text-green-800">Operational</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Database</p>
                      <p className="font-medium text-green-800">Healthy</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">GPS Services</p>
                      <p className="font-medium text-green-800">Active</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Notifications</p>
                      <p className="font-medium text-yellow-800">Delayed</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage registered users and their profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input placeholder="Search users..." className="max-w-sm" />
                </div>
                <div className="space-y-4">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <Card key={user._id}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Name</p>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
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
                              <p className="text-sm text-gray-600">Blood Type</p>
                              <p className="font-medium">{user.bloodType || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <Badge
                                className={
                                  user.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              Deactivate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No users registered yet</p>
                      <Button variant="outline">
                        Add New User
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ambulance & Driver Management</CardTitle>
                <CardDescription>Monitor and manage ambulance drivers and vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input placeholder="Search ambulances..." className="max-w-sm" />
                </div>
                <div className="space-y-4">
                  {ambulances.length > 0 ? (
                    ambulances.map((ambulance) => (
                      <Card key={ambulance._id}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Driver</p>
                              <p className="font-medium">
                                {ambulance.driver?.firstName} {ambulance.driver?.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Vehicle</p>
                              <p className="font-medium">{ambulance.vehicleNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <Badge
                                className={
                                  ambulance.status === "available"
                                    ? "bg-green-100 text-green-800"
                                    : ambulance.status === "busy"
                                      ? "bg-red-100 text-red-800"
                                      : ambulance.status === "maintenance"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                }
                              >
                                {ambulance.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Type</p>
                              <p className="font-medium capitalize">{ambulance.vehicleType}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Hospital</p>
                              <p className="font-medium">{ambulance.hospitalAffiliation}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Capacity</p>
                              <p className="font-medium">{ambulance.capacity}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline">
                              <MapPin className="h-4 w-4 mr-2" />
                              Track
                            </Button>
                            <Button size="sm" variant="outline">
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No ambulances registered yet</p>
                      <Button variant="outline">
                        Add New Ambulance
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Driver Approvals</CardTitle>
                <CardDescription>Review and approve new driver registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-600">
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={fetchRealTimeData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-4">
                  {pendingAmbulances.length > 0 ? (
                    pendingAmbulances.map((ambulance) => (
                      <Card key={ambulance._id} className="border-orange-200">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Driver Name</p>
                              <p className="font-medium">
                                {ambulance.driver?.firstName} {ambulance.driver?.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{ambulance.driver?.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium">{ambulance.driver?.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Vehicle</p>
                              <p className="font-medium">{ambulance.vehicleNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">License</p>
                              <p className="font-medium">{ambulance.licensePlate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Hospital</p>
                              <p className="font-medium">{ambulance.hospitalAffiliation}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproval(ambulance._id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleApproval(ambulance._id, false)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No pending approvals</p>
                      <p className="text-sm text-gray-400">All driver registrations have been reviewed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Response Time</span>
                      <span className="font-semibold">3.2 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Request Completion Rate</span>
                      <span className="font-semibold">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Driver Utilization</span>
                      <span className="font-semibold">76%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Patient Satisfaction</span>
                      <span className="font-semibold">4.7/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Downtown District</span>
                      <span className="font-medium">34%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">North District</span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">South District</span>
                      <span className="font-medium">22%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">East District</span>
                      <span className="font-medium">16%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Max Response Time Alert</p>
                    <p className="font-medium">5 minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Auto-Assignment Radius</p>
                    <p className="font-medium">10 km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority Queue Enabled</p>
                    <p className="font-medium">Yes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hospital Integration</p>
                    <p className="font-medium">Active</p>
                  </div>
                </div>
                <Button>Update Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
