import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, registerApi, getMeApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn  = computed(() => !!token.value)
  const isAdmin     = computed(() => user.value?.role === 'ADMIN')
  const isMerchant  = computed(() => user.value?.role === 'MERCHANT' || isAdmin.value)

  function setAuth(data) {
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  async function login(payload) {
    const data = await loginApi(payload)
    setAuth(data)
    return data
  }

  async function register(payload) {
    const data = await registerApi(payload)
    setAuth(data)
    return data
  }

  async function fetchMe() {
    const data = await getMeApi()
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
  }

  function logout() {
    token.value = ''
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isLoggedIn, isAdmin, isMerchant, login, register, logout, fetchMe }
})
