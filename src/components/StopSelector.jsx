'use client'

import { useState, useEffect } from 'react'

export default function StopSelector({ selectedStop, selectedRoute, onSelectStop, onSelectRoute }) {
  const [routes, setRoutes] = useState([])
  const [stops, setStops] = useState([])
  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const [loadingStops, setLoadingStops] = useState(false)

  // Fetch all routes on load
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch('/api/routes')
        const data = await res.json()
        if (data.success) setRoutes(data.routes)
      } catch (error) {
        console.error('Failed to fetch routes', error)
      } finally {
        setLoadingRoutes(false)
      }
    }
    fetchRoutes()
  }, [])

  // Fetch stops when route is selected
  useEffect(() => {
    if (!selectedRoute) {
      setStops([])
      return
    }
    const fetchStops = async () => {
      setLoadingStops(true)
      try {
        const res = await fetch(`/api/stops?route_id=${selectedRoute}`)
        const data = await res.json()
        if (data.success) setStops(data.stops)
      } catch (error) {
        console.error('Failed to fetch stops', error)
      } finally {
        setLoadingStops(false)
      }
    }
    fetchStops()
  }, [selectedRoute])

  return (
    <div className="space-y-4">

      {/* Step 1 — Route Selector */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Step 1 · Select Route
        </p>

        {loadingRoutes ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i}
                   className="animate-pulse bg-gray-800 rounded-xl h-12"/>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {routes.map(route => (
              <button
                key={route.id}
                onClick={() => {
                  onSelectRoute(route.id)
                  onSelectStop(null) // reset stop when route changes
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${selectedRoute === route.id ? 'bg-teal-700 border-teal-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-teal-600' }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{route.route_name}</p>
                    <p className="text-xs mt-0.5 opacity-70">
                      Route {route.route_number}
                    </p>
                  </div>
                  {selectedRoute === route.id && (
                    <span className="text-teal-300 text-xs font-medium">
                      ✓ Selected
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2 — Stop Selector */}
      {selectedRoute && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Step 2 · Select Your Stop
          </p>

          {loadingStops ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i}
                     className="animate-pulse bg-gray-800 rounded-xl h-12"/>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {stops.map(stop => (
                <button
                  key={stop.id}
                  onClick={() => onSelectStop(stop.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${selectedStop === stop.id ? 'bg-teal-700 border-teal-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-teal-600' }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${selectedStop === stop.id  ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-400'  }`}>
                      {stop.stop_order}
                    </span>
                    <p className="text-sm font-medium">{stop.stop_name}</p>
                    {selectedStop === stop.id && (
                      <span className="ml-auto text-teal-300 text-xs font-medium">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state — no route selected */}
      {!selectedRoute && !loadingRoutes && (
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm">
            👆 Select a route above to see stops
          </p>
        </div>
      )}

    </div>
  )
}