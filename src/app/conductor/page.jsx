'use client'

import { useState, useEffect, useRef } from 'react'

export default function ConductorPanel() {
  const BUS_ID = 2

  const [seatData, setSeatData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastAction, setLastAction] = useState(null)
  const [simulating, setSimulating] = useState(false)
  const simulateRef = useRef(null)

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

  // Simulate bus movement
  const startSimulation = () => {
    if (simulating) {
      clearInterval(simulateRef.current)
      setSimulating(false)
      return
    }

    setSimulating(true)

    simulateRef.current = setInterval(async () => {
      try {
        await fetch('/api/buses/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bus_id: BUS_ID })
        })
      } catch (error) {
        console.error('Simulation failed', error)
      }
    }, 2000)
  }

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulateRef.current) clearInterval(simulateRef.current)
    }
  }, [])

  // Handle board / exit tap
  const handleTap = async (action) => {
    setLoading(true)
    try {
      const res = await fetch('/api/seats/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bus_id: BUS_ID, action })
      })
      const data = await res.json()
      if (data.success) {
        setSeatData(prev => ({
          ...prev,
          current_passengers: data.current_passengers,
          vacant_seats: data.vacant_seats
        }))
        setLastAction(action)
        setTimeout(() => setLastAction(null), 1000)
      } else {
        alert(data.message)
      }
    } catch (error) {
      alert('Update failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">🎫 Conductor Panel</h1>
            <p className="text-gray-500 text-xs mt-0.5">BUS-01 · Route R1</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Bus Simulation */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            🗺️ Bus Location Simulation
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">
                {simulating ? '🟢 Bus is moving...' : '⚫ Bus is stationary'}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {simulating
                  ? 'Auto clears stop requests within 100m'
                  : 'Tap Start to simulate bus movement'}
              </p>
            </div>
            <button
              onClick={startSimulation}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm   transition-all duration-200 ${simulating   ? 'bg-red-700 hover:bg-red-600 text-white'   : 'bg-teal-600 hover:bg-teal-500 text-white' }`}
            >
              {simulating ? '⏹ Stop' : '▶ Start'}
            </button>
          </div>

          {simulating && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-teal-400 text-xs">
                Moving toward next stop...
              </p>
            </div>
          )}
        </div>

        {/* Seat Info */}
        {seatData && (
          <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              💺 Seat Status
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-800 rounded-2xl p-3">
                <p className="text-2xl font-bold text-white">
                  {seatData.current_passengers}
                </p>
                <p className="text-gray-500 text-xs mt-1">On Board</p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-3">
                <p className={`text-2xl font-bold ${
                  seatData.vacant_seats / seatData.total_capacity > 0.5
                    ? 'text-green-400'
                    : seatData.vacant_seats / seatData.total_capacity > 0.2
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {seatData.vacant_seats}
                </p>
                <p className="text-gray-500 text-xs mt-1">Vacant</p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-3">
                <p className="text-2xl font-bold text-gray-300">
                  {seatData.total_capacity}
                </p>
                <p className="text-gray-500 text-xs mt-1">Total</p>
              </div>
            </div>
          </div>
        )}

        {/* Board / Exit Buttons */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase  tracking-wider mb-4">
            👥 Passenger Count
          </h3>

          {lastAction && (
            <div className={`text-center text-sm font-semibold mb-3  ${lastAction === 'board' ? 'text-green-400' : 'text-red-400'}`}>  {lastAction === 'board'    ? '✅ Passenger Boarded'    : '✅ Passenger Exited'}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTap('board')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-50 text-white text-4xl font-bold rounded-2xl py-8 transition-all duration-150 shadow-lg"
            >
              +
            </button>
            <button
              onClick={() => handleTap('exit')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white text-4xl font-bold rounded-2xl py-8 transition-all duration-150 shadow-lg"
            >
              −
            </button>
          </div>
          <p className="text-center text-gray-600 text-xs mt-3">
            Tap <span className="text-green-400 font-bold">+</span> when
            boarding · Tap <span className="text-red-400 font-bold">−</span>
            when exiting
          </p>
        </div>

      </div>
    </main>
  )
}