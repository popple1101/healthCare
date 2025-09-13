import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { decode as atob } from 'base-64'
import { apiPost, setAuthToken, clearAuthToken } from '../config/api'
import { useI18n } from '../i18n/I18nContext' // >>> [ADDED]

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

const goalKey = (userId) => `goalsetup_${String(userId || '').replace(/[^a-zA-Z0-9._-]/g, '_')}`

export default function AuthProvider({ children }) {
  const { t } = useI18n() // >>> [ADDED]
  const [ready, setReady] = useState(false)
  const [isAuthenticated, setAuthed] = useState(false)
  const [user, setUser] = useState(null)
  const [needsGoalSetup, setNeedsGoalSetup] = useState(false)

  const parseJwt = (tokenWithPrefix) => {
    try {
      const raw = String(tokenWithPrefix || '').replace(/^Bearer\s+/i, '')
      const payload = raw.split('.')[1]
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      return json || {}
    } catch { return {} }
  }

  const loadGoalFlag = async (userId) => {
    if (!userId) return false
    const v = await SecureStore.getItemAsync(goalKey(userId))
    return v !== '1'
  }

  const wipeLegacyTokens = async () => {
    try { await AsyncStorage.multiRemove(['token','authToken','accessToken','@auth/token']) } catch {}
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await wipeLegacyTokens()
        const token = await SecureStore.getItemAsync('accessToken')
        if (!mounted) return
        if (token) {
          setAuthToken(token)
          let uid = null
          try { uid = parseJwt(token).sub ?? null } catch {}
          if (!mounted) return
          setUser({ id: uid })
          setAuthed(true)
          try { await AsyncStorage.setItem('last_user_id', String(uid || '')) } catch {}
          try {
            const need = await loadGoalFlag(uid)
            if (mounted) setNeedsGoalSetup(need)
          } catch {}
        }
      } catch (e) {
      } finally {
        if (mounted) setReady(true)
      }
    })()
    return () => { mounted = false }
  }, [])

  const login = async (id, password) => {
    try {
      const res = await apiPost('/api/auth/login', { id, password })
      const token = `${res.tokenType} ${res.token}`
      await SecureStore.setItemAsync('accessToken', token)
      await wipeLegacyTokens()
      setAuthToken(token)
      const userId = res.id ?? parseJwt(token).sub ?? id
      setUser({ id: userId })
      setAuthed(true)
      try { await AsyncStorage.setItem('last_user_id', String(userId)) } catch {}
      setNeedsGoalSetup(await loadGoalFlag(userId))
      return true
    } catch (e) {
      // >>> [ADDED] 401/인증 실패 메시지 매핑
      const msg = String(e?.message || '')
      if (msg.includes('401') || /Invalid credentials|Unauthorized/i.test(msg)) {
        throw new Error(t('INVALID_CREDENTIALS'))
      }
      throw e
    }
  }

  const logout = async () => {
    try { await apiPost('/api/auth/logout', {}) } catch {}
    try { await SecureStore.deleteItemAsync('accessToken') } catch {}
    await wipeLegacyTokens()
    try { await AsyncStorage.removeItem('last_user_id') } catch {}
    clearAuthToken()
    setUser(null)
    setAuthed(false)
    setNeedsGoalSetup(false)
  }

  const markGoalDone = async () => {
    const uid = user?.id
    if (!uid) return
    await SecureStore.setItemAsync(goalKey(uid), '1')
    setNeedsGoalSetup(false)
  }

  const value = useMemo(() => ({
    ready, isAuthenticated, user, needsGoalSetup, login, logout, markGoalDone,
  }), [ready, isAuthenticated, user, needsGoalSetup])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
