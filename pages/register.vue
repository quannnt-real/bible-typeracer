<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h1 class="mb-6 text-3xl font-bold text-center text-gray-900">Đăng ký tài khoản</h1>
      
      <div v-if="error" class="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="username" class="block mb-2 text-sm font-medium text-gray-700">
            Username *
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Chọn username"
          />
        </div>

        <div>
          <label for="email" class="block mb-2 text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập email"
          />
        </div>

        <div>
          <label for="displayName" class="block mb-2 text-sm font-medium text-gray-700">
            Tên hiển thị
          </label>
          <input
            id="displayName"
            v-model="displayName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tên hiển thị (tùy chọn)"
          />
        </div>

        <div>
          <label for="password" class="block mb-2 text-sm font-medium text-gray-700">
            Password *
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập password (tối thiểu 6 ký tự)"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Eye v-if="showPassword" :size="20" />
              <EyeOff v-else :size="20" />
            </button>
          </div>
        </div>

        <div>
          <label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-700">
            Xác nhận password *
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập lại password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Eye v-if="showConfirmPassword" :size="20" />
              <EyeOff v-else :size="20" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Đã có tài khoản?
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Đăng nhập
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'

const { register, loading } = useAuth()
const router = useRouter()

const username = ref('')
const email = ref('')
const displayName = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleSubmit = async () => {
  error.value = ''
  
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin bắt buộc'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password phải có ít nhất 6 ký tự'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Password xác nhận không khớp'
    return
  }

  const result = await register(
    username.value,
    email.value,
    password.value,
    displayName.value || undefined
  )
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Đăng ký thất bại'
  }
}
</script>
