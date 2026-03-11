'use client'

export default function BusList({
  buses,
  loading,
  onNotify,
  notifySuccess,
  notifyError,
  notifiedBuses
}) {

  if (loading && buses.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-800 rounded-2xl h-24"/>
        ))}
      </div>
    )
  }

  if (!loading && buses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-3">🚌</p>
        <p className="text-gray-500 text-sm">No buses found for this stop</p>
      </div>
    )
  }

  const getEtaColor = (minutes) => {
    if (minutes <= 5) return 'text-green-400'
    if (minutes <= 15) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getEtaBg = (minutes) => {
    if (minutes <= 5) return 'bg-green-950 border-green-800'
    if (minutes <= 15) return 'bg-yellow-950 border-yellow-800'
    return 'bg-red-950 border-red-900'
  }

  const getSeatColor = (vacant, total) => {
    const ratio = vacant / total
    if (ratio > 0.5) return 'text-green-400'
    if (ratio > 0.2) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getNotifyState = (busId) => {
    if (notifiedBuses?.includes(busId)) return 'notified'
    if (notifySuccess === busId) return 'success'
    if (notifyError === busId) return 'error'
    return 'idle'
  }

  return (
    <div className="space-y-3">
      {buses.map((bus, index) => {
        const notifyState = getNotifyState(bus.id)
        const isNotified = notifyState === 'notified' || notifyState === 'success'

        return (
          <div
            key={bus.id}
            className={`rounded-2xl border transition-all duration-200 p-4 ${isNotified ? 'bg-teal-950/30 border-teal-800' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
          >
            <div className="flex items-center justify-between gap-3">

              {/* Left — Bus Info */}
              <div className="flex items-center gap-3 min-w-0">

                {/* Rank badge */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${index === 0 ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {index + 1}
                </div>

                {/* Bus details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold text-sm">{bus.bus_number}</p>
                    {index === 0 && (
                      <span className="text-xs bg-teal-900 text-teal-300 border border-teal-800 px-2 py-0.5 rounded-full">
                        Next
                      </span>
                    )}
                    {isNotified && (
                      <span className="text-xs bg-teal-900/50 text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full">
                        Tracking 📍
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-gray-500 text-xs">📍 {bus.distance_km} km away</span>
                    <span className="text-gray-700 text-xs">·</span>
                    <span className={`text-xs font-medium ${getSeatColor(bus.vacant_seats, bus.total_capacity)}`}>
                      {bus.vacant_seats} seats free
                    </span>
                  </div>

                  {isNotified && (
                    <div className="mt-2 flex items-center gap-2 bg-teal-900/40 border border-teal-800 rounded-xl px-3 py-1.5">
                      <span className="text-sm">🧍</span>
                      <p className="text-teal-300 text-xs font-medium">You are waiting here · Notified ✓</p>
                      <span className="ml-auto text-teal-500 text-xs animate-pulse">● Live</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right — ETA + Notify */}
              <div className="flex items-center gap-2 shrink-0">

                {/* ETA Badge */}
                <div className={`border rounded-xl px-3 py-1.5 text-center min-w-15 ${getEtaBg(bus.eta_minutes)}`}>
                  <p className={`text-lg font-bold leading-none ${getEtaColor(bus.eta_minutes)}`}>
                    {bus.eta_minutes}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">min</p>
                </div>

                {/* Notify Button */}
                <button
                  onClick={() => !isNotified && onNotify(bus.id)}
                  disabled={isNotified || notifyState === 'error'}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${isNotified ? 'bg-teal-900 border border-teal-700 text-teal-300 cursor-default' : notifyState === 'error' ? 'bg-red-900 border border-red-700 text-red-300 cursor-default' : 'bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white'}`}
                >
                  {isNotified ? '✓ Notified' : notifyState === 'error' ? '❌ Failed' : '🔔 Notify'}
                </button>

              </div>
            </div>

            {/* Seat progress bar */}
            <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${bus.vacant_seats / bus.total_capacity > 0.5 ? 'bg-green-400' : bus.vacant_seats / bus.total_capacity > 0.2 ? 'bg-yellow-400' : 'bg-red-400'}`}
                style={{ width: `${(bus.vacant_seats / bus.total_capacity) * 100}%` }}
              />
            </div>

          </div>
        )
      })}
    </div>
  )
}