'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, signIn } from '@/lib/auth'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setError(null)

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { user, error } = await signIn(email, password)
        if (error) { setError(error); return }
        router.push('/')
      } else {
        const { user, error } = await signUp(name, email, password)
        if (error) { setError(error); return }
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-teal-600 rounded-2xl mb-4 shadow-lg shadow-teal-900">
            <span className="text-3xl">🚌</span>
          </div>
          <h1 className="text-3xl font-bold text-white">BusBuddy</h1>
          <p className="text-gray-400 mt-1 text-sm">Track your bus in real time</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8 shadow-2xl">

          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold
                          transition-all duration-200
                ${isLogin
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold
                          transition-all duration-200
                ${!isLogin
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-4">

            {/* Name — only on signup */}
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase
                                  tracking-wider mb-1.5 block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl
                             px-4 py-3 text-white placeholder-gray-600 text-sm
                             focus:outline-none focus:border-teal-500
                             focus:ring-1 focus:ring-teal-500
                             transition-all duration-200"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase
                                tracking-wider mb-1.5 block">
                Email
              </label>
              <input
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl
                           px-4 py-3 text-white placeholder-gray-600 text-sm
                           focus:outline-none focus:border-teal-500
                           focus:ring-1 focus:ring-teal-500
                           transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase
                                tracking-wider mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl
                           px-4 py-3 text-white placeholder-gray-600 text-sm
                           focus:outline-none focus:border-teal-500
                           focus:ring-1 focus:ring-teal-500
                           transition-all duration-200"
              />
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-950 border border-red-800 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-teal-600 hover:bg-teal-500 active:bg-teal-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-bold py-3.5 rounded-xl
                       transition-all duration-200 shadow-lg shadow-teal-900/50"
          >
            {loading
              ? '⏳ Please wait...'
              : isLogin ? 'Sign In' : 'Create Account'}
          </button>

        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          By signing in you agree to our Terms & Privacy Policy
        </p>

      </div>
    </main>
  )
}