'use client'

export default function SeatCount({ seatData }) {
  if (!seatData) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-800 rounded-lg w-16"></div>
        <div className="h-3 bg-gray-800 rounded w-12 mt-2"></div>
      </div>
    )
  }

  // Color changes based on availability
  const getColor = (vacant, total) => {
    const ratio = vacant / total
    if (ratio > 0.5) return 'text-green-400'
    if (ratio > 0.2) return 'text-yellow-400'
    return 'text-red-400'
  }

  const color = getColor(seatData.vacant_seats, seatData.total_capacity)

  return (
    <div>
      <p className={`text-3xl font-bold ${color}`}>
        {seatData.vacant_seats}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        of {seatData.total_capacity} free
      </p>

      {/* Visual seat bar */}
      <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${ seatData.vacant_seats / seatData.total_capacity > 0.5  ? 'bg-green-400'  : seatData.vacant_seats / seatData.total_capacity > 0.2  ? 'bg-yellow-400'  : 'bg-red-400'  }`}
          style={{
            width: `${(seatData.vacant_seats / seatData.total_capacity) * 100}%`
          }}
        />
      </div>
    </div>
  )
}