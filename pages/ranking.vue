<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <h1 class="mb-6 text-3xl font-bold text-center">🏆 Bảng Xếp Hạng</h1>

      <!-- Statistics -->
      <div class="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <div class="p-6 bg-yellow-100 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-yellow-800">🥇 Hạng 1</h3>
          <p class="text-2xl font-bold text-yellow-900" v-if="scores.length > 0">
            {{ scores[0].nickname }}
          </p>
          <p class="text-lg text-yellow-700" v-if="scores.length > 0">
            {{ scores[0].score_wpm }} WPM
          </p>
          <p class="text-2xl font-bold text-yellow-900" v-else>Chưa có</p>
        </div>
        <div class="p-6 bg-gray-100 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-800">👥 Tổng người chơi</h3>
          <p class="text-3xl font-bold text-gray-900">{{ scores.length }}</p>
        </div>
        <div class="p-6 bg-blue-100 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-blue-800">🎯 Điểm cao nhất</h3>
          <p class="text-3xl font-bold text-blue-900" v-if="scores.length > 0">
            {{ Math.max(...scores.map(s => s.score_wpm)) }} WPM
          </p>
          <p class="text-3xl font-bold text-blue-900" v-else>0</p>
        </div>
      </div>

      <!-- Rankings Table -->
      <div v-if="!loading" class="bg-white rounded-2xl shadow-game p-8 border border-gray-100">
        <div class="relative overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">
                  Hạng
                </th>
                <th scope="col" class="px-6 py-3">
                  Nickname
                </th>
                <th scope="col" class="px-6 py-3">
                  Tốc độ gõ (WPM)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(score, index) of scores" :key="index"
                  class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  <span v-if="index === 0" class="text-2xl">🥇</span>
                  <span v-else-if="index === 1" class="text-2xl">🥈</span>
                  <span v-else-if="index === 2" class="text-2xl">🥉</span>
                  <span v-else class="text-lg font-bold text-gray-600">#{{ index + 1 }}</span>
                </td>
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ score.nickname }}
                </th>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">
                    {{ score.score_wpm }} WPM
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="scores.length === 0" class="py-12 text-center">
          <p class="text-xl text-gray-500">Chưa có ai tham gia thi đua</p>
          <NuxtLink to="/" class="inline-block px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Bắt đầu thi đua ngay
          </NuxtLink>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else class="bg-white rounded-2xl shadow-game p-8 border border-gray-100">
        <div class="text-center py-12">
          <svg class="w-12 h-12 mx-auto mb-4 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-xl text-gray-500">Đang tải bảng xếp hạng...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
type Ranking = {
  id: string;
  nickname: string;
  score_wpm: number;
  user_id?: string;
  created_at: string;
}

type State = {
  scores: Ranking[];
  loading: boolean;
}

export default {
  data(): State {
    return {
      scores: [],
      loading: true
    }
  },
  mounted() {
    this.fetchScores();
  },
  methods: {
    async fetchScores() {
      try {
        this.loading = true;
        const data = await $fetch('/api/rankings');
        this.scores = data;
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>