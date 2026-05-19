/**
 * Supabase Auth Service
 * Handles user authentication (email/password) using Supabase Auth.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Sign up a new user with email and password.
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

/**
 * Sign in an existing user with email and password.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the current session (includes access_token JWT).
 * Returns null if no active session.
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.warn('[Auth] getSession error:', error.message)
    return null
  }
  return data.session
}

/**
 * Get the current user's JWT access token.
 * Returns empty string if not logged in.
 */
export async function getAccessToken() {
  const session = await getSession()
  return session?.access_token || ''
}

/**
 * Get the current user object.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return data.subscription.unsubscribe
}
