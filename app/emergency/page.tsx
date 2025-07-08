"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Ambulance, MapPin, Phone, Camera, Mic, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function EmergencyPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [emergencyType, setEmergencyType] = useState("")
  const [description, setDescription] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

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
      // Get user data from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        alert('Please log in to send emergency requests')
        window.location.href = '/login'
        return
      }

      const user = JSON.parse(userData)

      // Create emergency request
      const requestData = {
        userId: user._id,
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
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone || 'Emergency - No phone provided',
          bloodType: user.bloodType || '',
          allergies: user.allergies || [],
          medicalConditions: user.medicalConditions || []
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

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, this would start/stop voice recording
  }

  if (requestSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Ambulance className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Request Sent!</CardTitle>
            <CardDescription>Your emergency request has been broadcast to nearby ambulances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Help is on the way!</strong> You will receive a notification when an ambulance accepts your
                request.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Request ID:</span>
                <span className="font-mono">#ER-2024-001</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-yellow-100 text-yellow-800">Searching for ambulance</Badge>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Link href="/tracking">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Track Ambulance</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => (window.location.href = "tel:911")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call 911 Directly
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-red-600 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <Ambulance className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Emergency Request</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">Fill out the details below to request immediate medical assistance</p>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <AlertDescription className="text-red-800 text-sm sm:text-base">
            <strong>Life-threatening emergency?</strong> Call 911 immediately or press the emergency button below.
          </AlertDescription>
        </Alert>

        {/* Quick Emergency Button */}
        <Card className="mb-4 sm:mb-6 border-red-200">
          <CardContent className="pt-4 sm:pt-6">
            <Button
              onClick={handleEmergencyRequest}
              disabled={isRequesting}
              className="w-full h-14 sm:h-16 text-lg sm:text-xl bg-red-600 hover:bg-red-700"
            >
              {isRequesting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Sending Request...
                </>
              ) : (
                <>🚨 EMERGENCY - SEND REQUEST NOW</>
              )}
            </Button>
            <p className="text-center text-xs sm:text-sm text-gray-600 mt-2 px-2">
              One-tap emergency request with your current location
            </p>
          </CardContent>
        </Card>

        {/* Detailed Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Emergency Details</CardTitle>
            <CardDescription className="text-sm">Provide additional information to help responders prepare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            {/* Location */}
            <div className="space-y-2">
              <Label>Current Location</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-sm">
                  {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Getting location..."}
                </span>
                {location && <Badge className="ml-auto bg-green-100 text-green-800">Located</Badge>}
              </div>
            </div>

            {/* Emergency Type */}
            <div className="space-y-2">
              <Label htmlFor="emergencyType">Type of Emergency</Label>
              <Select value={emergencyType} onValueChange={setEmergencyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiac">Cardiac Emergency</SelectItem>
                  <SelectItem value="accident">Traffic Accident</SelectItem>
                  <SelectItem value="breathing">Breathing Difficulty</SelectItem>
                  <SelectItem value="stroke">Stroke</SelectItem>
                  <SelectItem value="trauma">Trauma/Injury</SelectItem>
                  <SelectItem value="overdose">Drug Overdose</SelectItem>
                  <SelectItem value="allergic">Allergic Reaction</SelectItem>
                  <SelectItem value="other">Other Medical Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the emergency situation, symptoms, or injuries..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Voice Recording */}
            <div className="space-y-2">
              <Label>Voice Message</Label>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                onClick={handleVoiceRecording}
                className="w-full"
              >
                <Mic className="h-4 w-4 mr-2" />
                {isRecording ? "Stop Recording" : "Record Voice Message"}
              </Button>
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <div className="animate-pulse bg-red-600 rounded-full h-2 w-2"></div>
                  Recording... Speak clearly about the emergency
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Photos (Optional)</Label>
              <Button type="button" variant="outline" className="w-full bg-transparent">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo of Scene
              </Button>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientAge">Patient Age</Label>
                <Input id="patientAge" type="number" placeholder="Age" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientGender">Patient Gender</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Known Medical Conditions</Label>
              <Input id="medicalConditions" placeholder="Diabetes, heart condition, allergies, etc." />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone Number</Label>
              <Input id="contactPhone" type="tel" placeholder="Your phone number" />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleEmergencyRequest}
              disabled={isRequesting}
              className="w-full bg-red-600 hover:bg-red-700 h-12"
            >
              {isRequesting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Emergency Request...
                </>
              ) : (
                <>
                  <Ambulance className="h-5 w-5 mr-2" />
                  Send Detailed Emergency Request
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => (window.location.href = "tel:911")}>
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
