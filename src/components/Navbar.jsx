'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, signOut } from '@/lib/auth'
import Link from 'next/link'

export default function Navbar() {
  const router = useRouter()

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allStops, setAllStops] = useState([])
  const searchRef = useRef(null)

  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      return getSession()
    }
    return null
  })

  // Fetch all stops for search
  useEffect(() => {
    const fetchStops = async () => {
      const res = await fetch('/api/stops')
      const data = await res.json()
      if (data.success) setAllStops(data.stops)
    }
    fetchStops()
  }, [])

  // Compute search results with useMemo
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return allStops.filter(stop =>
      stop.stop_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, allStops])

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    if (searchOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    if (searchOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [searchOpen])

  // Get user initials
  const getInitials = () => {
    const name = user?.name || user?.email || ''
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left — Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50 group-hover:bg-teal-500 transition-all duration-200">
                <span className="text-base">🚌</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                BusBuddy
              </span>
            </Link>

            {/* Right — Icons */}
            <div className="flex items-center gap-2">

              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
                aria-label="Search stops"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Profile Icon */}
              <button
                onClick={() => router.push('/profile')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm transition-all duration-200 shadow-md"
                aria-label="Go to profile"
              >
                {getInitials()}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div
            ref={searchRef}
            className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search bus stops..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 text-base focus:outline-none"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                className="text-gray-500 hover:text-white transition-colors text-sm bg-gray-800 px-2.5 py-1 rounded-lg shrink-0"
              >
                ESC
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-72 sm:max-h-96 overflow-y-auto">
              {searchQuery === '' ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-4xl mb-3">🚏</p>
                  <p className="text-gray-500 text-sm">
                    Type to search bus stops
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-gray-500 text-sm">
                    No stops found for{' '}
                    <span className="text-white font-medium">
                      &ldquo;{searchQuery}&rdquo;
                    </span>
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.map(stop => (
                    <button
                      key={stop.id}
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                        router.push(`/?stop_id=${stop.id}`)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors duration-150 text-left group"
                    >
                      <div className="w-9 h-9 bg-gray-800 group-hover:bg-gray-700 rounded-xl flex items-center justify-center shrink-0 text-teal-400 text-xs font-bold transition-colors">
                        #{stop.stop_order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {stop.stop_name}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Route {stop.route_id}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
