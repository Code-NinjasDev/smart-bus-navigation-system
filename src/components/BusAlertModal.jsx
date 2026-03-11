'use client'

import { useEffect, useState, useMemo } from 'react'

export default function BusAlertModal({ status, busNumber, stopName, onClose }) {
  const [dismissed, setDismissed] = useState(false)
  const [lastStatus, setLastStatus] = useState(status)

  // When status changes to a new alert type reset dismissed
  if (status !== lastStatus) {
    setLastStatus(status)
    setDismissed(false)
  }

  const visible = useMemo(() => {
    if (dismissed) return false
    return status === 'arriving_soon' || status === 'arrived'
  }, [status, dismissed])

  const handleClose = () => {
    setDismissed(true)
    if (onClose) onClose()
  }

  // Auto close after 5 seconds
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setDismissed(true), 5000)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  const isArrived = status === 'arrived'

  const config = isArrived
    ? {
        bg: 'bg-green-950',
        border: 'border-green-700',
        iconBg: 'bg-green-800',
        icon: '✅',
        title: 'Bus Has Arrived!',
        titleColor: 'text-green-400',
        message: `Your bus ${busNumber} has arrived at ${stopName}. Board quickly!`,
        buttonBg: 'bg-green-700 hover:bg-green-600',
        progressBg: 'bg-green-500'
      }
    : {
        bg: 'bg-yellow-950',
        border: 'border-yellow-700',
        iconBg: 'bg-yellow-800',
        icon: '🚨',
        title: 'Bus Arriving Soon!',
        titleColor: 'text-yellow-400',
        message: `Bus ${busNumber} is less than 500m away from ${stopName}. Get ready!`,
        buttonBg: 'bg-yellow-700 hover:bg-yellow-600',
        progressBg: 'bg-yellow-500'
      }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-gray-950/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div
          className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl pointer-events-auto ${config.bg} ${config.border}`}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >

          {/* Icon */}
          <div className={`w-16 h-16 ${config.iconBg} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg`}>
            {config.icon}
          </div>

          {/* Title */}
          <h2 className={`text-xl font-bold text-center mb-2 ${config.titleColor}`}>
            {config.title}
          </h2>

          {/* Message */}
          <p className="text-gray-400 text-sm text-center leading-relaxed mb-6">
            {config.message}
          </p>

          {/* Bus + Stop Info */}
          <div className="bg-gray-900/50 rounded-2xl p-3 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🚌</span>
              <p className="text-white text-sm font-semibold">{busNumber}</p>
            </div>
            <div className="w-px h-4 bg-gray-700"/>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <p className="text-gray-300 text-sm">{stopName}</p>
            </div>
          </div>

          {/* Auto close progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-1 mb-4 overflow-hidden">
            <div
              className={`h-1 rounded-full ${config.progressBg}`}
              style={{ animation: 'shrink 5s linear forwards' }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`w-full py-3 rounded-2xl text-white font-bold text-sm transition-all duration-200 ${config.buttonBg}`}>
            Got it!
          </button>

          <p className="text-center text-gray-600 text-xs mt-3">
            Auto closes in 5 seconds
          </p>

        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  )
}
