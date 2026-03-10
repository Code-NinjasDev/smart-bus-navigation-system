'use client'

export default function AlertCard({ request, onAccept, onSkip, loading }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-yellow-700 p-4 space-y-4">

      {/* Request Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-lg">🔔</span>
            <p className="font-semibold text-white">
              {request.stops?.stop_name || 'Unknown Stop'}
            </p>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Stop #{request.stops?.stop_order} —{' '}
            <span className="text-white font-medium">
              {request.passenger_count} passenger(s) waiting
            </span>
          </p>
        </div>
        <p className="text-gray-600 text-xs">
          {formatTime(request.created_at)}
        </p>
      </div>

      {/* Accept / Skip Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAccept}
          disabled={loading}
          className="bg-green-700 hover:bg-green-600 active:bg-green-800
                     disabled:opacity-50 text-white font-semibold py-3
                     rounded-xl transition-all duration-150"
        >
          ✅ Accept
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          className="bg-red-800 hover:bg-red-700 active:bg-red-900
                     disabled:opacity-50 text-white font-semibold py-3
                     rounded-xl transition-all duration-150"
        >
          ❌ Skip
        </button>
      </div>

    </div>
  )
}