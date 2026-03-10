import { supabase } from '@/lib/supabase'

// Simple hash function using Web Crypto API
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Sign Up
export async function signUp(name, email, password) {
  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return { error: 'Email already registered. Please sign in.' }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword
      }])
      .select()
      .single()

    if (error) throw error

    // Save session to localStorage
    const session = {
      id: data.id,
      name: data.name,
      email: data.email,
      created_at: data.created_at
    }
    localStorage.setItem('session', JSON.stringify(session))

    return { user: session }

  } catch (err) {
    return { error: err.message }
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    // Hash password
    const hashedPassword = await hashPassword(password)

    // Find user with matching email and password
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('email', email.toLowerCase().trim())
      .eq('password', hashedPassword)
      .single()

    if (error || !data) {
      return { error: 'Invalid email or password' }
    }

// Save session to localStorage and cookie
const session = {
  id: data.id,
  name: data.name,
  email: data.email,
  created_at: data.created_at
}
localStorage.setItem('session', JSON.stringify(session))
document.cookie = `session=${JSON.stringify(session)}; path=/; max-age=604800`

return { user: session }

  } catch (err) {
    return { error: 'Invalid email or password' }
  }
}

//Sign Out
export function signOut() {
  localStorage.removeItem('session')
  document.cookie = 'session=; path=/; max-age=0'
}

// Get current session
export function getSession() {
  try {
    const session = localStorage.getItem('session')
    return session ? JSON.parse(session) : null
  } catch {
    return null
  }
}