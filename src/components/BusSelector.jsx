'use client'

import { useState, useEffect } from 'react'

export default function BusSelector({ selectedBus, onSelect }) {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch('/api/stops?route_id=1')
        const data = await res.json()

        // For MVP we hardcode BUS-01 since we have 1 bus in DB
        // Replace with /api/buses endpoint later
        setBuses([{ id: 1, bus_number: 'BUS-01', route_name: 'City Center to Airport' }])
      } catch (error) {
        console.error('Failed to fetch buses', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBuses()
  }, [])

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading buses...</p>
  }

  return (
    <div className="space-y-2">
      {buses.map(bus => (
        <button
          key={bus.id}
          onClick={() => onSelect(bus.id)}
          className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150  ${selectedBus === bus.id    ? 'bg-teal-700 border-teal-500 text-white'    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-teal-600'  }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{bus.bus_number}</p>
              <p className="text-xs text-gray-400 mt-0.5">{bus.route_name}</p>
            </div>
            <span className="text-2xl">🚌</span>
          </div>
        </button>
      ))}
    </div>
  )
}