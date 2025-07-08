"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Ambulance, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default function EmergencyPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [emergencyType, setEmergencyType] = useState("")
  const [description, setDescription] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)


  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  const handleEmergencyRequest = async () => {
    setIsRequesting(true)

    try {
      // Create emergency request without requiring login
      const requestData = {
        emergencyType: emergencyType || 'other',
        priority: 'high',
        pickupLocation: {
          address: `Location: ${location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Unknown'}`,
          coordinates: location ? {
            latitude: location.lat,
            longitude: location.lng
          } : undefined
        },
        patientDetails: {
          name: 'Emergency Patient',
          phone: 'Emergency - No phone provided',
          bloodType: '',
          allergies: [],
          medicalConditions: []
        },
        description: description || 'Emergency request sent via app'
      }

      const response = await fetch('/api/emergency-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        const data = await response.json()
        setRequestSent(true)
        // Store request ID for tracking
        localStorage.setItem('currentEmergencyRequest', data.request._id)
        // Redirect to tracking page after a short delay
        setTimeout(() => {
          window.location.href = '/tracking'
        }, 3000)
      } else {
        const errorData = await response.json()
        alert(`Failed to send emergency request: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error sending emergency request:', error)
      alert('Failed to send emergency request. Please try again.')
    } finally {
      setIsRequesting(false)
    }
  }



  if (requestSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-green-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Ambulance className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">Help is Coming!</h1>
          <p className="text-gray-600 mb-8">
            Your emergency request has been sent. Emergency services are being notified.
          </p>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Request sent at {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="text-center">
                <Badge className="bg-yellow-100 text-yellow-800">Searching for help</Badge>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => (window.location.href = "tel:911")}
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 911 Directly
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-red-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Ambulance className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Help</h1>
          <p className="text-gray-600">Get immediate assistance</p>
        </div>

        {/* Main Emergency Button */}
        <div className="mb-8">
          <Button
            onClick={handleEmergencyRequest}
            disabled={isRequesting}
            className="w-full h-24 text-2xl bg-red-600 hover:bg-red-700 shadow-lg"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-4"></div>
                Sending Emergency Request...
              </>
            ) : (
              <>🚨 GET HELP NOW</>
            )}
          </Button>
          <p className="text-center text-sm text-gray-500 mt-2">
            Tap to send your location to emergency services
          </p>
        </div>

        {/* Simple Form */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location Status */}
            <div className="space-y-2">
              <Label>Location Status</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-sm">
                  {location ? "Location detected" : "Getting your location..."}
                </span>
                {location && <Badge className="ml-auto bg-green-100 text-green-800">✓ Ready</Badge>}
              </div>
            </div>

            {/* Emergency Type */}
            <div className="space-y-2">
              <Label>Type of Emergency</Label>
              <Select value={emergencyType} onValueChange={setEmergencyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiac">Heart/Cardiac</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="breathing">Breathing Problem</SelectItem>
                  <SelectItem value="trauma">Injury</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of the emergency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Call 911 Button */}
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => (window.location.href = "tel:911")}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call 911 Directly
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
