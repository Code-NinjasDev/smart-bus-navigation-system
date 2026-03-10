'use client'

export default function ETADisplay({ etaData }) {
  if (!etaData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-800 rounded-lg w-16"></div>
        <div className="h-3 bg-gray-800 rounded w-12 mt-2"></div>
      </div>
    )
  }

  // Color changes based on ETA
  const getColor = (minutes) => {
    if (minutes <= 5) return 'text-green-400'
    if (minutes <= 15) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getLabel = (minutes) => {
    if (minutes <= 1) return 'Arriving now'
    if (minutes <= 5) return 'Almost here'
    if (minutes <= 15) return 'On the way'
    return 'Far away'
  }

  const color = getColor(etaData.eta_minutes)

  return (
    <div>
      <div className="flex items-end gap-1">
        <p className={`text-3xl font-bold ${color}`}>
          {etaData.eta_minutes}
        </p>
        <p className="text-gray-400 text-sm mb-1">min</p>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {getLabel(etaData.eta_minutes)}
      </p>

      {/* Distance info */}
      <p className="text-xs text-gray-600 mt-2">
        📍 {etaData.distance_km} km away
      </p>
    </div>
  )
}