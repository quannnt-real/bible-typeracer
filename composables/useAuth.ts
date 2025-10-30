import { ref, computed } from 'vue'

export type User = {
  id: string
  username: string
  email: string
  display_name: string | null
  avatar_url: string | null
  color: string
  created_at: string
}

const user = ref<User | null>(null)
const loading = ref(false)

export const useAuth = () => {
  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    try {
      loading.value = true
      const response: any = await $fetch('/api/auth/me')
      if (response.success && response.user) {
        user.value = response.user
      } else {
        user.value = null
      }
    } catch (error) {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const login = async (username: string, password: string) => {
    try {
      loading.value = true
      const response: any = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (response.success && response.user) {
        user.value = response.user
        return { success: true }
      } else {
        return { success: false, error: response.error || 'Đăng nhập thất bại' }
      }
    } catch (error) {
      return { success: false, error: 'Đã xảy ra lỗi khi đăng nhập' }
    } finally {
      loading.value = false
    }
  }

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    try {
      loading.value = true
      const response: any = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { username, email, password, displayName }
      })

      if (response.success && response.user) {
        user.value = response.user
        return { success: true }
      } else {
        return { success: false, error: response.error || 'Đăng ký thất bại' }
      }
    } catch (error) {
      return { success: false, error: 'Đã xảy ra lỗi khi đăng ký' }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Đã xảy ra lỗi khi đăng xuất' }
    } finally {
      loading.value = false
    }
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout
  }
}
