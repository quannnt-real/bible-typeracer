<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Thông tin cá nhân</h1>
        
        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ errorMessage }}
        </div>
        
        <!-- Profile Form -->
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <input 
              type="text" 
              :value="user?.username" 
              disabled
              class="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            >
            <p class="mt-1 text-xs text-gray-500">Tên đăng nhập không thể thay đổi</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email" 
              :value="user?.email" 
              disabled
              class="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            >
            <p class="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tên hiển thị
            </label>
            <input 
              v-model="form.display_name" 
              type="text" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên hiển thị của bạn"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              URL Avatar
            </label>
            <input 
              v-model="form.avatar_url" 
              type="url" 
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/avatar.jpg"
            >
            <p class="mt-1 text-xs text-gray-500">Để trống nếu không muốn dùng avatar</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Màu đại diện
            </label>
            <div class="flex gap-2">
              <input 
                v-model="form.color" 
                type="color" 
                class="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
              >
              <input 
                v-model="form.color" 
                type="text" 
                pattern="^#[0-9A-Fa-f]{6}$"
                class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="#3B82F6"
              >
            </div>
            <p class="mt-1 text-xs text-gray-500">Màu này sẽ hiển thị khi chơi multiplayer</p>
          </div>

          <div class="flex gap-3">
            <button 
              type="submit" 
              :disabled="loading"
              class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
            <NuxtLink 
              to="/"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Hủy
            </NuxtLink>
          </div>
        </form>

        <!-- Change Password Link -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <NuxtLink 
            to="/change-password"
            class="text-blue-600 hover:text-blue-800 font-medium"
          >
            Đổi mật khẩu →
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { user, fetchUser } = useAuth()

const form = ref({
  display_name: '',
  avatar_url: '',
  color: '#3B82F6'
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  await fetchUser()
  
  if (user.value) {
    form.value.display_name = user.value.display_name || ''
    form.value.avatar_url = user.value.avatar_url || ''
    form.value.color = user.value.color || '#3B82F6'
  }
})

async function updateProfile() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    const response: any = await $fetch('/api/auth/update-profile', {
      method: 'POST',
      body: {
        display_name: form.value.display_name,
        avatar_url: form.value.avatar_url,
        color: form.value.color
      }
    })
    
    if (response.success) {
      successMessage.value = 'Cập nhật thông tin thành công!'
      await fetchUser() // Refresh user data
    } else {
      errorMessage.value = response.error || 'Có lỗi xảy ra'
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    errorMessage.value = 'Có lỗi xảy ra khi cập nhật thông tin'
  } finally {
    loading.value = false
  }
}
</script>
