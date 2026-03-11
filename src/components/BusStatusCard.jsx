'use client'

import { useState, useEffect } from 'react'

export default function BusStatusCard({ busId, stopId, onStatusChange }) {
  const [statusData, setStatusData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stopped, setStopped] = useState(false)

  useEffect(() => {
    if (!busId || !stopId) return
    if (stopped) return

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/buses/status?bus_id=${busId}&stop_id=${stopId}`)
        const data = await res.json()
        if (data.success) {
          setStatusData(data)
          if (onStatusChange) onStatusChange(data.status, busId, data)
          if (data.status === 'arrived') {
            setStopped(true)
          }
        }
      } catch (error) {
        console.error('Failed to fetch bus status', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [busId, stopId, onStatusChange, stopped])

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-800 rounded w-32"/>
          <div className="h-10 bg-gray-800 rounded-2xl"/>
          <div className="h-4 bg-gray-800 rounded w-24"/>
        </div>
      </div>
    )
  }

  if (!statusData) return null

  const getStatusConfig = (status) => {
    switch (status) {
      case 'arrived':
        return {
          bg: 'bg-green-950',
          border: 'border-green-800',
          icon: '✅',
          label: 'Bus Arrived!',
          labelColor: 'text-green-400',
          pulse: 'bg-green-400'
        }
      case 'arriving_soon':
        return {
          bg: 'bg-yellow-950',
          border: 'border-yellow-800',
          icon: '🚨',
          label: 'Bus Arriving Soon!',
          labelColor: 'text-yellow-400',
          pulse: 'bg-yellow-400'
        }
      default:
        return {
          bg: 'bg-gray-900',
          border: 'border-gray-800',
          icon: '🚌',
          label: 'Bus On The Way',
          labelColor: 'text-teal-400',
          pulse: 'bg-teal-400'
        }
    }
  }

  const config = getStatusConfig(statusData.status)

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  const formatETA = (minutes) => {
    if (minutes < 1) return 'Less than a minute'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }

  return (
    <div className={`rounded-3xl border p-5 transition-all duration-500 ${config.bg} ${config.border}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${config.pulse}`}/>
          <p className={`text-xs font-semibold uppercase tracking-wider ${config.labelColor}`}>
            {config.label}
          </p>
        </div>
        <span className="text-xl">{config.icon}</span>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">

        {/* Distance */}
        <div className="bg-gray-900/50 rounded-2xl p-3">
          <p className={`text-2xl font-bold ${config.labelColor}`}>
            {formatDistance(statusData.distance_meters)}
          </p>
          <p className="text-gray-500 text-xs mt-1">Away</p>
        </div>

        {/* ETA */}
        <div className="bg-gray-900/50 rounded-2xl p-3">
          <p className={`text-2xl font-bold ${config.labelColor}`}>
            {statusData.status === 'arrived' ? '0' : statusData.eta_minutes}
          </p>
          <p className="text-gray-500 text-xs mt-1">Min ETA</p>
        </div>

        {/* Vacant Seats */}
        <div className="bg-gray-900/50 rounded-2xl p-3">
          <p className={`text-2xl font-bold ${statusData.vacant_seats > 10 ? 'text-green-400' : statusData.vacant_seats > 3 ? 'text-yellow-400' : 'text-red-400'}`}>
            {statusData.vacant_seats}
          </p>
          <p className="text-gray-500 text-xs mt-1">Seats Free</p>
        </div>

      </div>

      {/* Bus + Stop Info */}
      <div className="mt-4 flex items-center justify-between bg-gray-900/50 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🚌</span>
          <p className="text-white text-sm font-medium">{statusData.bus_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">📍</span>
          <p className="text-gray-400 text-sm">{statusData.stop_name}</p>
        </div>
      </div>

      {/* ETA Text */}
      {statusData.status !== 'arrived' && (
        <p className="text-center text-gray-500 text-xs mt-3">
          Arriving in approximately{' '}
          <span className={`font-semibold ${config.labelColor}`}>
            {formatETA(statusData.eta_minutes)}
          </span>
        </p>
      )}

      {statusData.status === 'arrived' && (
        <p className={`text-center text-sm font-semibold mt-3 ${config.labelColor}`}>
          🎉 Your bus has arrived at {statusData.stop_name}!
        </p>
      )}

    </div>
  )
}