<template>
  <div>
    <!-- Header with user info -->
    <header class="absolute top-0 left-0 z-50 flex justify-end w-full p-4">
      <div v-if="user" class="flex items-center gap-4">
        <NuxtLink 
          to="/profile"
          class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
            :style="{ backgroundColor: user.color }"
          >
            {{ user.username[0].toUpperCase() }}
          </div>
          <span class="font-medium">{{ user.display_name || user.username }}</span>
        </NuxtLink>
        <button
          @click="handleLogout"
          class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Đăng xuất
        </button>
      </div>
      <!-- Chỉ hiển thị login/register buttons khi KHÔNG ở trang index -->
      <div v-else-if="$route.name !== 'index'" class="flex gap-2">
        <NuxtLink
          to="/login"
          class="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Đăng nhập
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="px-4 py-2 text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50"
        >
          Đăng ký
        </NuxtLink>
      </div>
    </header>

    <slot />

    <footer class="mt-16 border-t border-gray-200 bg-white">
      <div class="max-w-5xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <nav class="flex items-center gap-6">
            <nuxt-link
              class="text-lg font-medium transition-colors hover:text-primary-600"
              :class="{
                'text-primary-600': $route.name === 'index',
                'text-gray-600': $route.name !== 'index'
              }"
              to="/"
            >
              🏠 Home
            </nuxt-link>
            <nuxt-link
              class="text-lg font-medium transition-colors hover:text-primary-600"
              :class="{
                'text-primary-600': $route.name === 'ranking',
                'text-gray-600': $route.name !== 'ranking'
              }"
              to="/ranking"
            >
              🏆 Rankings
            </nuxt-link>
            <nuxt-link
              class="text-lg font-medium transition-colors hover:text-primary-600"
              :class="{
                'text-primary-600': $route.name === 'history',
                'text-gray-600': $route.name !== 'history'
              }"
              to="/history"
            >
              📜 Lịch sử
            </nuxt-link>
          </nav>

          <a 
            href="https://github.com/quannnt-real/bible-typeracer" 
            target="_blank" 
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-medium">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, logout, fetchUser } = useAuth()
const router = useRouter()

// Fetch user on mount
onMounted(() => {
  fetchUser()
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>
