<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h1>
        
        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ errorMessage }}
        </div>
        
        <!-- Change Password Form -->
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div class="relative">
              <input 
                v-model="form.new_password" 
                :type="showNewPassword ? 'text' : 'password'" 
                required
                minlength="6"
                class="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              >
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <Eye v-if="showNewPassword" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div class="relative">
              <input 
                v-model="form.confirm_password" 
                :type="showConfirmPassword ? 'text' : 'password'" 
                required
                minlength="6"
                class="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập lại mật khẩu mới"
              >
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

          <div class="flex gap-3">
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
            </button>
            <NuxtLink 
              to="/profile"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Hủy
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()

const form = ref({
  new_password: '',
  confirm_password: ''
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

async function changePassword() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  // Validate
  if (form.value.new_password !== form.value.confirm_password) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp'
    loading.value = false
    return
  }
  
  try {
    const response: any = await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        new_password: form.value.new_password
      }
    })
    
    if (response.success) {
      successMessage.value = 'Đổi mật khẩu thành công! Đang chuyển hướng...'
      
      // Reset form
      form.value.new_password = ''
      form.value.confirm_password = ''
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } else {
      errorMessage.value = response.error || 'Có lỗi xảy ra'
    }
  } catch (error) {
    console.error('Error changing password:', error)
    errorMessage.value = 'Có lỗi xảy ra khi đổi mật khẩu'
  } finally {
    loading.value = false
  }
}
</script>
