'use client'

export default function SeatDisplay({ seatData }) {
  if (!seatData) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-gray-800 rounded-lg w-24"></div>
        <div className="h-3 bg-gray-800 rounded w-32"></div>
        <div className="h-2 bg-gray-800 rounded-full w-full"></div>
      </div>
    )
  }

  const occupancyPercent = Math.round(
    (seatData.current_passengers / seatData.total_capacity) * 100
  )

  const getStatusColor = (percent) => {
    if (percent < 50) return 'text-green-400'
    if (percent < 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBarColor = (percent) => {
    if (percent < 50) return 'bg-green-400'
    if (percent < 80) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  const getStatusLabel = (percent) => {
    if (percent < 50) return 'Plenty of space'
    if (percent < 80) return 'Filling up'
    if (percent < 100) return 'Almost full'
    return 'Bus is full'
  }

  const color = getStatusColor(occupancyPercent)
  const barColor = getBarColor(occupancyPercent)

  return (
    <div className="space-y-4">

      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-2xl font-bold text-white">
            {seatData.current_passengers}
          </p>
          <p className="text-xs text-gray-500 mt-1">On Board</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className={`text-2xl font-bold ${color}`}>
            {seatData.vacant_seats}
          </p>
          <p className="text-xs text-gray-500 mt-1">Vacant</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-2xl font-bold text-gray-300">
            {seatData.total_capacity}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
      </div>

      {/* Occupancy Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{getStatusLabel(occupancyPercent)}</span>
          <span>{occupancyPercent}% full</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </div>

    </div>
  )
}