'use client'

export default function RequestButton({ onRequest, loading, disabled }) {
  return (
    <div className="w-full">
      <button
        onClick={onRequest}
        disabled={disabled || loading}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200
          ${disabled
            ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
            : loading
            ? 'bg-teal-800 text-teal-300 border border-teal-700 cursor-wait'
            : 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white shadow-lg shadow-teal-900'
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-teal-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Sending Request...
          </span>
        ) : disabled ? (
          '🚌 Select Bus & Stop First'
        ) : (
          '🙋 Request Pickup'
        )}
      </button>

      {disabled && (
        <p className="text-center text-gray-600 text-xs mt-2">
          Please select both a stop and a bus to request pickup
        </p>
      )}
    </div>
  )
}