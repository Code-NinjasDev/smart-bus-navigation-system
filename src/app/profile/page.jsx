'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') return getSession()
    return null
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [requestCount, setRequestCount] = useState(0)

useEffect(() => {
  if (!user) {
    router.push('/auth')
    return
  }
  setName(user.name || '')

  // Fetch request count inline to avoid dependency issues
  supabase
    .from('pickup_requests')
    .select('*', { count: 'exact', head: true })
    .then(({ count }) => setRequestCount(count || 0))

  setLoading(false)
}, [router, user])



  const handleUpdateName = async () => {
    setUpdating(true)
    setError(null)
    setMessage(null)
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id)

      if (error) throw error

      // Update session in localStorage and cookie
      const updatedSession = { ...user, name: name.trim() }
      localStorage.setItem('session', JSON.stringify(updatedSession))
      document.cookie = `session=${JSON.stringify(updatedSession)}; path=/; max-age=604800`
      setUser(updatedSession)
      setMessage('Name updated successfully!')

    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = () => {
    signOut()
    router.push('/auth')
  }

  const getInitials = () => {
    const n = user?.name || user?.email || ''
    return n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent  rounded-full animate-spin"/>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Profile Header */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">

          {/* Avatar */}
          <div className="w-20 h-20 bg-teal-700 rounded-2xl flex items-center  justify-center text-2xl font-bold text-white shrink-0  shadow-lg shadow-teal-900/50">
            {getInitials()}
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-xl font-bold text-white">
              {user?.name || 'No name set'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start  gap-2 mt-3">
              <span className="bg-teal-900/50 border border-teal-800 text-teal-300 text-xs px-3 py-1 rounded-full">
                🎫 {requestCount} Requests Made
              </span>
              <span className="bg-gray-800 border border-gray-700 text-gray-400 text-xs px-3 py-1 rounded-full">
                ✅ Member
              </span>
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800  p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase   tracking-wider">
            Edit Profile
          </h2>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase        tracking-wider mb-1.5 block">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl   px-4 py-3 text-white placeholder-gray-600 text-sm   focus:outline-none focus:border-teal-500   focus:ring-1 focus:ring-teal-500   transition-all duration-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase      tracking-wider mb-1.5 block">
              Email
            </label>
            <input
              type="text"
              value={user?.email || ''}
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-500 text-sm cursor-not-allowed"
            />
            <p className="text-gray-600 text-xs mt-1.5">
              Email cannot be changed
            </p>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 rounded-xl    px-4 py-3">
              <p className="text-red-400 text-sm">❌ {error}</p>
            </div>
          )}
          {message && (
            <div className="bg-green-950 border border-green-800 rounded-xl    px-4 py-3">
              <p className="text-green-400 text-sm">✅ {message}</p>
            </div>
          )}

          <button
            onClick={handleUpdateName}
            disabled={updating}
            className="w-full bg-teal-600 hover:bg-teal-500 active:bg-teal-700   disabled:opacity-50 disabled:cursor-not-allowed   text-white font-bold py-3 rounded-xl   transition-all duration-200"
          >
            {updating ? '⏳ Updating...' : 'Save Changes'}
          </button>
        </div>

        {/* Account Actions */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800    p-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase     tracking-wider">
            Account
          </h2>

          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-between px-4 py-3   bg-gray-800 hover:bg-gray-700 rounded-xl   transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🚌</span>
              <span className="text-white text-sm font-medium">
                Back to Bus Tracker
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400  transition-colors"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3  bg-red-950/50 hover:bg-red-950 border border-red-900  hover:border-red-700 rounded-xl  transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🚪</span>
              <span className="text-red-400 text-sm font-medium">Sign Out</span>
            </div>
            <svg className="w-4 h-4 text-red-800 group-hover:text-red-500  transition-colors"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </main>
  )
}