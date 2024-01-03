import { computed } from 'vue'
import axios from 'axios'

interface LoginResponse {
  token: string
  expire: string
  claims: {
    uid: string
    scope?: Array<string>
  }
}

const TOKEN_KEY = 'token'
const EXPIRE_KEY = 'expire'
const UID_KEY = 'uid'
const SCOPES_KEY = 'scopes'

export function useAuth() {
  /**
   * Token from localStorage
   */
  const token = computed((): string | null => localStorage.getItem(TOKEN_KEY))

  /**
   * Expire date from localStorage
   */
  const expire = computed((): string | null => localStorage.getItem(EXPIRE_KEY))

  /**
   * User ID from localStorage
   */
  const uid = computed((): string | null => localStorage.getItem(UID_KEY))

  /**
   * Fetch scopes from the localstorage
   */
  const scopes = computed((): Array<string> => JSON.parse(localStorage.getItem(SCOPES_KEY) ?? '[]'))

  /**
   * Whether the user has previously logged in or not or the token expired
   */
  const previouslyLogged = computed((): boolean => {
    return token.value != null && expire.value != null && Date.parse(expire.value) - Date.now() > 0
  })

  /**
   * Login to the API, saving the token and expire date to localStorage
   * @param username
   * @param password
   */
  async function login(username: string, password: string) {
    const response = await axios.post<LoginResponse>('/api/login', {
      username: username,
      password: password
    })
    localStorage.setItem(TOKEN_KEY, response.data.token)
    localStorage.setItem(EXPIRE_KEY, response.data.expire)
    localStorage.setItem(UID_KEY, response.data.claims.uid)
    // if scope is everything, it will miss in the response
    localStorage.setItem(SCOPES_KEY, JSON.stringify(response.data.claims.scope ?? []))
  }

  /**
   * Removes authorization data from localStorage.
   */
  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRE_KEY)
    localStorage.removeItem(UID_KEY)
    localStorage.removeItem(SCOPES_KEY)
  }

  return { token, expire, uid, scopes, previouslyLogged, login, logout }
}
