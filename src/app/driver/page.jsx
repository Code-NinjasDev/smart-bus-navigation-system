'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import SeatDisplay from '@/components/SeatDisplay'

export default function DriverDashboard() {
  const BUS_ID = 1 // Change this per driver later

  const [upcomingStops, setUpcomingStops] = useState([])
  const [seatData, setSeatData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Poll upcoming stops with waiting passengers every 5 seconds
  useEffect(() => {
    const fetchUpcomingStops = async () => {
      try {
        const res = await fetch(`/api/stops/reached?bus_id=${BUS_ID}`)
        const data = await res.json()
        if (data.success) setUpcomingStops(data.stops)
      } catch (error) {
        console.error('Failed to fetch stops', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingStops()
    const interval = setInterval(fetchUpcomingStops, 5000)
    return () => clearInterval(interval)
  }, [])

  // Poll seat count every 5 seconds
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await fetch(`/api/seats/count?bus_id=${BUS_ID}`)
        const data = await res.json()
        if (data.success) setSeatData(data)
      } catch (error) {
        console.error('Failed to fetch seats', error)
      }
    }

    fetchSeats()
    const interval = setInterval(fetchSeats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="pt-2">
          <h2 className="text-2xl font-bold text-white">
            🚌 Driver Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            BUS-01 · Route R1 · Live updates every 5s
          </p>
        </div>

        {/* Seat Status */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              💺 Current Seat Status
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-green-400 text-xs font-medium">Live</span>
            </div>
          </div>
          <SeatDisplay seatData={seatData} />
        </div>

        {/* Upcoming Stops */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase
                           tracking-wider">
              🚏 Upcoming Stops with Passengers
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-green-400 text-xs font-medium">Live</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i}
                     className="animate-pulse bg-gray-800 rounded-2xl h-16"/>
              ))}
            </div>
          ) : upcomingStops.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-400 font-medium">
                No passengers waiting at any stop
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Notifications will appear here when passengers request pickup
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingStops.map((stop, index) => (
                <div
                  key={stop.stop_id}
                  className={`rounded-2xl p-4 border  ${index === 0    ? 'bg-teal-950 border-teal-800'    : 'bg-gray-800 border-gray-700'  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Stop order badge */}
                      <div className={`w-9 h-9 rounded-xl flex items-center  justify-center text-sm font-bold shrink-0  ${index === 0    ? 'bg-teal-700 text-white'    : 'bg-gray-700 text-gray-400'  }`}>
                        #{stop.stop_order}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {stop.stop_name}
                        </p>
                        {index === 0 && (
                          <p className="text-teal-400 text-xs mt-0.5">
                            Next stop
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Passenger count */}
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-lg">
                        {stop.total_passengers}
                      </p>
                      <p className="text-gray-500 text-xs">waiting</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}