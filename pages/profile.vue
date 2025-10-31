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
              Xe đua
            </label>
            <button
              @click="showCarSelector = true"
              type="button"
              class="flex items-center gap-3 p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <img 
                :src="'/car/' + form.car" 
                :class="[
                  'w-12 h-12 object-contain',
                  form.car === 'car-icon.svg' ? 'transform scale-x-[-1]' : ''
                ]"
                :alt="'Selected car'"
              />
              <svg class="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <p class="mt-1 text-xs text-gray-500">Chọn xe đua của bạn</p>
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

      <!-- Car Selector Modal -->
      <div v-if="showCarSelector" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showCarSelector = false">
        <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Chọn xe đua</h3>
            <button @click="showCarSelector = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <button
              v-for="car in availableCars"
              :key="car.value"
              @click="selectCar(car.value)"
              :class="[
                'flex justify-center items-center p-4 border-2 rounded-lg hover:border-blue-500 transition-colors',
                form.car === car.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              ]"
            >
              <img 
                :src="'/car/' + car.value" 
                :class="[
                  'w-20 h-20 object-contain',
                  car.value === 'car-icon.svg' ? 'transform scale-x-[-1]' : ''
                ]"
                :alt="car.label"
              />
            </button>
          </div>
          
          <div class="flex justify-end mt-6">
            <button 
              @click="showCarSelector = false"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
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
  car: 'car-icon.svg'
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showCarSelector = ref(false)

const availableCars = [
  { value: 'car-icon.svg', label: 'Car Icon (Mặc định)' },
  { value: 'biteracer.svg', label: 'Bite Racer' },
  { value: 'candycane_free.svg', label: 'Candy Cane' },
  { value: 'candycorn_free.svg', label: 'Candy Corn' },
  { value: 'fall_2023_acorn-free.svg', label: 'Fall Acorn' },
  { value: 'fall_2023_fallcar-free.svg', label: 'Fall Car' },
  { value: 'fall_2023_falltruck-free.svg', label: 'Fall Truck' },
  { value: 'free-rocketship.svg', label: 'Rocket Ship' },
  { value: 'lunar-basic-design-free.svg', label: 'Lunar Basic' },
  { value: 'lunar-basic-tiger-free.svg', label: 'Lunar Tiger' },
  { value: 'lunar-drag-gold.svg', label: 'Lunar Drag Gold' },
  { value: 'lunar-drag-red.svg', label: 'Lunar Drag Red' },
  { value: 'lunar-drag-tiger.svg', label: 'Lunar Drag Tiger' },
  { value: 'mindracerEmoji-free.svg', label: 'Mind Racer Emoji' },
  { value: 'penguins-typingstats_free.svg', label: 'Penguins' },
  { value: 'premium-drag-blue.svg', label: 'Premium Drag Blue' },
  { value: 'premium-drag-fire.svg', label: 'Premium Drag Fire' },
  { value: 'premium-drag-green.svg', label: 'Premium Drag Green' },
  { value: 'premium-drag-pink.svg', label: 'Premium Drag Pink' },
  { value: 'premium-drag-red.svg', label: 'Premium Drag Red' },
  { value: 'premium-drag-water.svg', label: 'Premium Drag Water' },
  { value: 'premium-earth.svg', label: 'Premium Earth' },
  { value: 'premium-fire.svg', label: 'Premium Fire' },
  { value: 'spring-flowers2-free.svg', label: 'Spring Flowers' }
]

function getCarDisplayName(carValue: string): string {
  const car = availableCars.find(c => c.value === carValue)
  return car ? car.label : 'Car Icon (Mặc định)'
}

function selectCar(carValue: string) {
  form.value.car = carValue
  showCarSelector.value = false
}

onMounted(async () => {
  await fetchUser()
  
  if (user.value) {
    form.value.display_name = user.value.display_name || ''
    form.value.avatar_url = user.value.avatar_url || ''
    form.value.car = user.value.car || 'car-icon.svg'
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
        car: form.value.car
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
