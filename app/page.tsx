import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ambulance, Clock, MapPin, Shield, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Ambulance className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">RapidResponse</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900">
              How It Works
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-3 sm:mb-4 bg-red-100 text-red-800 hover:bg-red-100 text-xs sm:text-sm">🚨 Emergency Response Platform</Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Connect to the Nearest
            <span className="text-red-600 block">Ambulance in Seconds</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Revolutionary emergency response network that connects patients with nearby ambulances in real-time. Every
            second counts in an emergency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/emergency">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                🚨 Emergency Request
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent">
                Join as Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">2.5 min</div>
              <div className="text-gray-600">Average Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
              <div className="text-gray-600">Active Ambulances</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">10,000+</div>
              <div className="text-gray-600">Lives Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
              <div className="text-gray-600">Available Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Life-Saving Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets emergency response to provide the fastest, most reliable ambulance service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="bg-red-100 p-3 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Instant Request</CardTitle>
                <CardDescription>
                  One-tap emergency button sends your location to nearby ambulances instantly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="bg-blue-100 p-3 rounded-lg w-fit">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Track your ambulance's location and get live ETA updates with traffic awareness
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="bg-green-100 p-3 rounded-lg w-fit">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>AI Route Optimization</CardTitle>
                <CardDescription>
                  Smart routing system finds the fastest path considering traffic and road conditions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="bg-purple-100 p-3 rounded-lg w-fit">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Hospital Coordination</CardTitle>
                <CardDescription>
                  Automatic hospital alerts prepare medical teams before ambulance arrival
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="bg-orange-100 p-3 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>First Responder Network</CardTitle>
                <CardDescription>
                  Notify nearby doctors, nurses, and trained civilians for immediate assistance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-red-200 transition-colors">
              <CardHeader>
                <div className="bg-teal-100 p-3 rounded-lg w-fit">
                  <Ambulance className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Voice Activation</CardTitle>
                <CardDescription>"Hey app, I need an ambulance!" - Hands-free emergency requests</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple, fast, life-saving process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Emergency</h3>
              <p className="text-gray-600">
                Tap the emergency button or use voice command. Your location is automatically detected.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Ambulance Responds</h3>
              <p className="text-gray-600">
                Nearby ambulances receive your request and the closest available unit accepts.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Track the ambulance in real-time and receive live updates until help arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-xl mb-8 opacity-90">Join our network as a patient, driver, or healthcare provider</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=user">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Sign Up as User
              </Button>
            </Link>
            <Link href="/signup?role=driver">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-red-600 bg-transparent"
              >
                Join as Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Ambulance className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">RapidResponse</span>
              </div>
              <p className="text-gray-400">Connecting lives with emergency care through innovative technology.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/emergency" className="hover:text-white">
                    Emergency Request
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white">
                    Join Network
                  </Link>
                </li>
                <li>
                  <Link href="/driver" className="hover:text-white">
                    Driver Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Emergency Hotline
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Medical Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RapidResponse. All rights reserved. Emergency services available 24/7.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
