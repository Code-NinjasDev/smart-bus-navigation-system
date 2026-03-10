'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import BusList from '@/components/BusList'
import StopSelector from '@/components/StopSelector'
import BusStatusCard from '@/components/BusStatusCard'
import BusAlertModal from '@/components/BusAlertModal'

function HomeContent() {
  const searchParams = useSearchParams()
  const [user] = useState(() => {
    if (typeof window !== 'undefined') return getSession()
    return null
  })
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedStop, setSelectedStop] = useState(null)
  const [buses, setBuses] = useState([])
  const [loadingBuses, setLoadingBuses] = useState(false)
  const [notifySuccess, setNotifySuccess] = useState(null)
  const [notifyError, setNotifyError] = useState(null)

  // Track notified buses — { busId: { busNumber, stopName } }
  const [notifiedBuses, setNotifiedBuses] = useState({})

  // Track bus status for modal
  const [busStatus, setBusStatus] = useState(null)
 const [activeTracking, setActiveTracking] = useState(null)
const [liveStatusData, setLiveStatusData] = useState(null)// { busId, busNumber, stopName }

  // Auto select stop from navbar search
  useEffect(() => {
    const stopId = searchParams.get('stop_id')
    if (stopId) setSelectedStop(Number(stopId))
  }, [searchParams])

  // Fetch buses when both route and stop selected
  const fetchBuses = useCallback(async () => {
    if (!selectedStop || !selectedRoute) return
    setLoadingBuses(true)
    try {
      const res = await fetch(
        `/api/buses/live?stop_id=${selectedStop}&route_id=${selectedRoute}`
      )
      const data = await res.json()
      if (data.success) setBuses(data.buses)
    } catch (error) {
      console.error('Failed to fetch buses', error)
    } finally {
      setLoadingBuses(false)
    }
  }, [selectedStop, selectedRoute])

  // Poll buses every 5 seconds
  useEffect(() => {
    if (!selectedStop || !selectedRoute) {
      setBuses([])
      return
    }
    fetchBuses()
    const interval = setInterval(fetchBuses, 5000)
    return () => clearInterval(interval)
  }, [selectedStop, selectedRoute, fetchBuses])

  // Handle notify driver
  const handleNotify = async (busId) => {
    setNotifySuccess(null)
    setNotifyError(null)

    try {
      const res = await fetch('/api/request-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bus_id: busId,
          stop_id: selectedStop,
          passenger_count: 1,
          user_id: user?.id || null
        })
      })
      const data = await res.json()

      if (data.success) {
        setNotifySuccess(busId)

        // Find bus details for tracking
        const bus = buses.find(b => b.id === busId)
        const stop = { stop_name: buses[0]?.stop_name || '' }

        // Add to notified buses
        setNotifiedBuses(prev => ({
          ...prev,
          [busId]: {
            busNumber: bus?.bus_number || `Bus ${busId}`,
            stopName: stop.stop_name
          }
        }))

        // Start tracking this bus
        setActiveTracking({
          busId,
          busNumber: bus?.bus_number || `Bus ${busId}`,
          stopName: stop.stop_name
        })

        setTimeout(() => setNotifySuccess(null), 3000)

      } else if (data.already_notified) {
        // Already notified — just start tracking
        const bus = buses.find(b => b.id === busId)
        setActiveTracking({
          busId,
          busNumber: bus?.bus_number || `Bus ${busId}`,
          stopName: ''
        })
      } else {
        setNotifyError(busId)
        setTimeout(() => setNotifyError(null), 3000)
      }
    } catch (error) {
      console.error('Notify failed', error)
      setNotifyError(busId)
      setTimeout(() => setNotifyError(null), 3000)
    }
  }

  // Handle status change from BusStatusCard
const handleStatusChange = useCallback((status, busId, data) => {
  setBusStatus(status)
  // Store live status data to sync distance across both components
  if (data) setLiveStatusData({ busId, ...data })

  if (status === 'arrived') {
    setTimeout(() => {
      setActiveTracking(null)
      setBusStatus(null)
      setNotifiedBuses({})
      setLiveStatusData(null)
      setSelectedRoute(null)
      setSelectedStop(null)
      setBuses([])
    }, 6000)
  }
}, [])
  // Reset tracking when route or stop changes
  const handleRouteSelect = (routeId) => {
    setSelectedRoute(routeId)
    setActiveTracking(null)
    setBusStatus(null)
    setNotifiedBuses({})
  }

  const handleStopSelect = (stopId) => {
    setSelectedStop(stopId)
    setActiveTracking(null)
    setBusStatus(null)
    setNotifiedBuses({})
  }

  const showBusList = selectedRoute && selectedStop

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Bus Alert Modal */}
      {activeTracking && (
        <BusAlertModal
          status={busStatus}
          busNumber={activeTracking.busNumber}
          stopName={activeTracking.busNumber}
          onClose={() => setBusStatus(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Welcome */}
        <div className="pt-2">
          <h2 className="text-2xl font-bold text-white">
            Good {getGreeting()},{' '}
            <span className="text-teal-400">
              {user?.name?.split(' ')[0] || 'Traveller'}
            </span> 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Select your route and stop to see live bus timings
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-semibold
            ${selectedRoute ? 'text-teal-400' : 'text-gray-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center
                            justify-center text-xs font-bold
              ${selectedRoute
                ? 'bg-teal-600 text-white'
                : 'bg-gray-800 text-gray-500'}`}>
              {selectedRoute ? '✓' : '1'}
            </div>
            Route
          </div>
          <div className={`flex-1 h-px
            ${selectedRoute ? 'bg-teal-800' : 'bg-gray-800'}`}/>
          <div className={`flex items-center gap-1.5 text-xs font-semibold
            ${selectedStop ? 'text-teal-400' : 'text-gray-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center
                            justify-center text-xs font-bold
              ${selectedStop
                ? 'bg-teal-600 text-white'
                : 'bg-gray-800 text-gray-500'}`}>
              {selectedStop ? '✓' : '2'}
            </div>
            Stop
          </div>
          <div className={`flex-1 h-px
            ${selectedStop ? 'bg-teal-800' : 'bg-gray-800'}`}/>
          <div className={`flex items-center gap-1.5 text-xs font-semibold
            ${showBusList ? 'text-teal-400' : 'text-gray-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center
                            justify-center text-xs font-bold
              ${showBusList
                ? 'bg-teal-600 text-white'
                : 'bg-gray-800 text-gray-500'}`}>
              {showBusList ? '✓' : '3'}
            </div>
            Bus
          </div>
        </div>

        {/* Route + Stop Selector */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
          <StopSelector
            selectedRoute={selectedRoute}
            selectedStop={selectedStop}
            onSelectRoute={handleRouteSelect}
            onSelectStop={handleStopSelect}
          />
        </div>

        {/* Live Status Card — shown after notifying */}
        {activeTracking && (
          <BusStatusCard
            busId={activeTracking.busId}
            stopId={selectedStop}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Bus List */}
        {showBusList && (
          <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-400
                               uppercase tracking-wider">
                  🚌 Available Buses
                </h3>
                <p className="text-gray-600 text-xs mt-0.5">
                  Sorted by arrival time · updates every 5s
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                <span className="text-green-400 text-xs font-medium">Live</span>
              </div>
            </div>
<BusList
  buses={buses.map(bus => {
    // If this bus is being tracked, override distance with live status data
    if (liveStatusData && liveStatusData.busId === bus.id) {
      return {
        ...bus,
        distance_km: liveStatusData.distance_km,
        distance_meters: liveStatusData.distance_meters,
        eta_minutes: liveStatusData.eta_minutes,
        vacant_seats: liveStatusData.vacant_seats
      }
    }
    return bus
  })}
  loading={loadingBuses}
  onNotify={handleNotify}
  notifySuccess={notifySuccess}
  notifyError={notifyError}
  notifiedBuses={Object.keys(notifiedBuses).map(Number)}
/>
          </div>
        )}

        {/* Empty state */}
        {!showBusList && !activeTracking && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚏</div>
            <p className="text-gray-400 font-medium">
              {!selectedRoute
                ? 'Select a route to get started'
                : 'Now select your stop'}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Live bus timings will appear here
            </p>
          </div>
        )}

      </div>
    </main>
  )
}

function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent
                      rounded-full animate-spin"/>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
