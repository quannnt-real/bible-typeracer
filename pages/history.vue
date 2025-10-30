<template>
  <div class="container px-4 py-8 mx-auto">
    <h1 class="mb-6 text-3xl font-bold">Lịch sử gõ của bạn</h1>
    
    <!-- Statistics -->
    <div class="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
      <div class="p-6 bg-blue-100 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-blue-800">Tổng số đoạn đã gõ</h3>
        <p class="text-3xl font-bold text-blue-900">{{ stats.totalTexts }}</p>
      </div>
      <div class="p-6 bg-green-100 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-green-800">Tổng số lần gõ</h3>
        <p class="text-3xl font-bold text-green-900">{{ stats.totalTypings }}</p>
      </div>
      <div class="p-6 bg-purple-100 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-purple-800">Đoạn gõ nhiều nhất</h3>
        <p class="text-xl font-bold text-purple-900" v-if="stats.mostTypedText">
          {{ getBookName(stats.mostTypedText.book_id) }} {{ stats.mostTypedText.chapter }}:{{ formatVerseDisplay(stats.mostTypedText.verse_start, stats.mostTypedText.verse_end) }}
        </p>
        <p class="text-sm text-purple-700" v-if="stats.mostTypedText">
          {{ stats.mostTypedText.times_typed }} lần
        </p>
        <p class="text-xl font-bold text-purple-900" v-else>N/A</p>
      </div>
    </div>

    <!-- Recent History -->
    <h2 class="mb-4 text-2xl font-semibold">Lịch sử gần đây</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">Sách</th>
            <th scope="col" class="px-6 py-3">Chương</th>
            <th scope="col" class="px-6 py-3">Câu</th>
            <!-- <th scope="col" class="px-6 py-3">Số lần gõ</th> -->
            <th scope="col" class="px-6 py-3" title="Words Per Minute - Số từ gõ được mỗi phút">WPM</th>
            <th scope="col" class="px-6 py-3">Lần gõ cuối</th>
            <th scope="col" class="px-6 py-3">Nội dung</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in history" 
            :key="item.id"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50"
          >
            <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
              {{ getBookName(item.book_id) }}
            </td>
            <td class="px-6 py-4">{{ item.chapter }}</td>
            <td class="px-6 py-4">
              <span v-if="!item.verse_start">Cả chương</span>
              <span v-else-if="item.verse_end && item.verse_end !== item.verse_start">
                {{ item.verse_start }}-{{ item.verse_end }}
              </span>
              <span v-else>{{ item.verse_start }}</span>
            </td>
            <!-- <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                {{ item.times_typed }}
              </span>
            </td> -->
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full" 
                    :title="'Words Per Minute: ' + (item.best_wpm || 0) + ' từ/phút - Tốc độ gõ cao nhất cho đoạn này'">
                {{ item.best_wpm || 0 }} WPM
              </span>
            </td>
            <td class="px-6 py-4">{{ formatDate(item.last_typed_at) }}</td>
            <td class="px-6 py-4 max-w-xs truncate" :title="getCachedText(item)">
              {{ getCachedText(item) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="history.length === 0" class="py-12 text-center">
      <p class="text-xl text-gray-500">Chưa có lịch sử gõ nào</p>
      <NuxtLink to="/" class="inline-block px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
        Bắt đầu gõ ngay
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts">
type TypingHistoryItem = {
  id: string;
  book_id: number;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  times_typed: number;
  last_typed_at: string;
  created_at: string;
  best_wpm: number;
}

type Stats = {
  totalTexts: number;
  totalTypings: number;
  mostTypedText?: TypingHistoryItem;
}

type State = {
  history: TypingHistoryItem[];
  stats: Stats;
  books: any[];
  textCache: Map<string, string>;
}

export default {
  data(): State {
    return {
      history: [],
      stats: {
        totalTexts: 0,
        totalTypings: 0
      },
      books: [],
      textCache: new Map()
    }
  },
  mounted() {
    this.fetchBooks();
    this.fetchHistory();
    this.fetchStats();
  },
  methods: {
    async fetchBooks() {
      try {
        const data = await $fetch('/api/bible/books');
        this.books = data;
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    },
    async fetchHistory() {
      try {
        const data = await $fetch('/api/typing-history/recent');
        this.history = data;
        
        // Load text content for all history items one by one to avoid overwhelming
        for (const item of this.history) {
          await this.loadTextContent(item);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    },
    async fetchStats() {
      try {
        const data = await $fetch('/api/typing-history/stats');
        this.stats = data;
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    },
    getBookName(bookId: number) {
      const book = this.books.find(b => b.id === bookId);
      return book ? book.name : `Sách ${bookId}`;
    },
    formatVerseDisplay(verseStart: number | null, verseEnd: number | null) {
      if (!verseStart) return 'Cả chương';
      if (verseEnd && verseEnd !== verseStart) return `${verseStart}-${verseEnd}`;
      return `${verseStart}`;
    },
    formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getCachedText(item: TypingHistoryItem): string {
      const cacheKey = `${item.book_id}-${item.chapter}-${item.verse_start || 'null'}-${item.verse_end || 'null'}`;
      return this.textCache.get(cacheKey) || 'Đang tải...';
    },
    async loadTextContent(item: TypingHistoryItem) {
      const cacheKey = `${item.book_id}-${item.chapter}-${item.verse_start || 'null'}-${item.verse_end || 'null'}`;
      
      // Skip if already cached
      if (this.textCache.has(cacheKey)) {
        return;
      }
      
      try {
        // Build query string manually to avoid issues
        let url = `/api/bible/verses?bookId=${item.book_id}&chapter=${item.chapter}&format=text`;
        
        if (item.verse_start) {
          url += `&verseStart=${item.verse_start}`;
        }
        if (item.verse_end) {
          url += `&verseEnd=${item.verse_end}`;
        }
        
        console.log('Fetching text from:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('API response:', data);
        
        const text = data.text || 'Không thể tải nội dung';
        
        // Cache the result
        this.textCache.set(cacheKey, text);
        console.log('Cached text for', cacheKey, ':', text);
      } catch (error) {
        console.error('Error fetching text content:', error);
        this.textCache.set(cacheKey, 'Lỗi khi tải nội dung');
      }
    }
  }
}
</script>
