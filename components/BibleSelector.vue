<template>
  <div class="w-full max-w-4xl mx-auto">

    <!-- Main Card -->
    <div class="bg-white rounded-2xl shadow-game border border-gray-100 p-8">
      
      <!-- Chọn Sách -->
      <div class="mb-6">
        <label class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <svg class="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
          Chọn Sách
        </label>
        <select 
          v-model="selectedBookId" 
          @change="onBookChange"
          class="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
        >
          <option value="">📖 Chọn sách Kinh Thánh...</option>
          <option v-for="book in books" :key="book.id" :value="book.id">
            {{ book.name }}
          </option>
        </select>
      </div>

      <!-- Chọn Chương -->
      <div class="mb-6" v-if="selectedBookId">
        <label class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <svg class="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
          </svg>
          Chọn Chương
        </label>
        <select 
          v-model="selectedChapter"
          @change="onChapterChange"
          class="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-secondary-100 focus:border-secondary-500 transition-all bg-gray-50 hover:bg-white"
        >
          <option value="">📄 Chọn chương...</option>
          <option v-for="i in chapterCount" :key="i" :value="i">
            Chương {{ i }}
          </option>
        </select>
      </div>

      <!-- Chọn Câu (Optional) -->
      <div class="mb-6" v-if="selectedChapter">
        <label class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <svg class="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          Câu cụ thể
          <span class="text-xs text-gray-500 font-normal">(Tùy chọn - Bỏ trống để lấy cả chương)</span>
        </label>
        <div class="flex gap-4">
        <!-- Từ câu -->
        <div class="flex-1">
          <div class="relative">
            <button
              type="button"
              @click="showVerseStartPicker = !showVerseStartPicker"
              class="w-full p-2 text-left border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {{ verseStart ? `Câu ${verseStart}` : '-- Từ câu --' }}
            </button>
            
            <div v-if="showVerseStartPicker" 
                 class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
            >
              <div class="grid grid-cols-5 gap-1 p-2">
                <button
                  type="button"
                  @click="selectVerseStart(null)"
                  class="p-2 text-sm text-center border border-gray-200 rounded hover:bg-gray-100"
                >
                  ---
                </button>
                <button
                  v-for="i in verseCount"
                  :key="i"
                  type="button"
                  @click="selectVerseStart(i)"
                  :class="[
                    'p-2 text-sm text-center border rounded',
                    verseStart === i 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'border-gray-200 hover:bg-blue-50'
                  ]"
                >
                  {{ i }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <span class="flex items-center px-2">đến</span>

        <!-- Đến câu -->
        <div class="flex-1">
          <div class="relative">
            <button
              type="button"
              @click="verseStart && (showVerseEndPicker = !showVerseEndPicker)"
              :disabled="!verseStart"
              :class="[
                'w-full p-2 text-left border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                verseStart ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
              ]"
            >
              {{ verseEnd ? `Câu ${verseEnd}` : '-- Đến câu --' }}
            </button>
            
            <div v-if="showVerseEndPicker && verseStart" 
                 class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
            >
              <div class="grid grid-cols-5 gap-1 p-2">
                <button
                  type="button"
                  @click="selectVerseEnd(null)"
                  class="p-2 text-sm text-center border border-gray-200 rounded hover:bg-gray-100"
                >
                  ---
                </button>
                <button
                  v-for="i in availableVerseEndOptions"
                  :key="i"
                  type="button"
                  @click="selectVerseEnd(i)"
                  :class="[
                    'p-2 text-sm text-center border rounded',
                    verseEnd === i 
                      ? 'bg-blue-500 text-white border-blue-600' 
                      : 'border-gray-200 hover:bg-blue-50'
                  ]"
                >
                  {{ i }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <!-- Reference Display -->
      <div v-if="referenceText" class="p-4 mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-primary-500 rounded-lg">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-semibold text-gray-700">Đã chọn:</span>
          <span class="text-lg font-bold text-primary-700">{{ referenceText }}</span>
        </div>
      </div>

      <!-- Typing History Alert -->
      <TypingHistoryAlert 
        :level="typingStatsLevel"
        :stats="typingStats"
      />

      <!-- Button Start -->
      <button 
        @click="startGame"
        :disabled="!selectedBookId || !selectedChapter"
        class="w-full py-4 text-xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl hover:from-accent-600 hover:to-accent-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
      >
        <span v-if="selectedBookId && selectedChapter" class="flex items-center justify-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Bắt đầu gõ!
        </span>
        <span v-else>Vui lòng chọn sách và chương</span>
      </button>

      <!-- Preview Text -->
      <div v-if="previewText" class="p-5 mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <h3 class="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
          <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
          Xem trước nội dung:
        </h3>
        <p class="text-sm leading-relaxed text-gray-700 italic">{{ previewText.substring(0, 200) }}{{ previewText.length > 200 ? '...' : '' }}</p>
      </div>
      
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      books: [] as any[],
      selectedBookId: '',
      selectedChapter: '',
      chapterCount: 0,
      verseCount: 0,
      verseStart: null as number | null,
      verseEnd: null as number | null,
      previewText: '',
      typingStats: null as any,
      typingStatsLevel: '' as string,
      showVerseStartPicker: false,
      showVerseEndPicker: false,
    }
  },
  computed: {
    referenceText() {
      if (!this.selectedBookId || !this.selectedChapter) return '';
      
      const book = this.books.find(b => b.id === parseInt(this.selectedBookId));
      if (!book) return '';
      
      let ref = `${book.name} ${this.selectedChapter}`;
      
      if (this.verseStart) {
        if (this.verseEnd && this.verseEnd !== this.verseStart) {
          ref += `:${this.verseStart}-${this.verseEnd}`;
        } else {
          ref += `:${this.verseStart}`;
        }
      }
      
      return ref;
    },
    availableVerseEndOptions() {
      if (!this.verseStart || !this.verseCount) return [];
      // Chỉ hiển thị các câu từ (verseStart + 1) đến verseCount
      const options = [];
      for (let i = this.verseStart + 1; i <= this.verseCount; i++) {
        options.push(i);
      }
      return options;
    }
  },
  mounted() {
    this.fetchBooks();
    // Close pickers when clicking outside
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
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
    async onBookChange() {
      this.selectedChapter = '';
      this.chapterCount = 0;
      this.previewText = '';
      this.verseStart = null;
      this.verseEnd = null;
      this.typingStats = null;
      
      if (!this.selectedBookId) return;
      
      try {
        const data = await $fetch(`/api/bible/verses?bookId=${this.selectedBookId}&chapter=1&action=chapter-count`);
        this.chapterCount = data.count;
        
        // Fetch typing stats for this book
        await this.fetchTypingStats();
      } catch (error) {
        console.error('Error fetching chapter count:', error);
      }
    },
    async onChapterChange() {
      this.previewText = '';
      this.verseStart = null;
      this.verseEnd = null;
      this.verseCount = 0;
      
      if (!this.selectedChapter) return;
      
      // Fetch verse count for the chapter
      try {
        const data = await $fetch(`/api/bible/verses?bookId=${this.selectedBookId}&chapter=${this.selectedChapter}&action=verse-count`);
        this.verseCount = data.count;
      } catch (error) {
        console.error('Error fetching verse count:', error);
      }
      
      await this.loadPreview();
      await this.fetchTypingStats();
    },
    selectVerseStart(verse: number | null) {
      this.verseStart = verse;
      this.showVerseStartPicker = false;
      
      // Reset verseEnd khi verseStart thay đổi
      if (this.verseEnd && this.verseStart && this.verseEnd <= this.verseStart) {
        this.verseEnd = null;
      }
      this.loadPreview();
      this.fetchTypingStats();
    },
    selectVerseEnd(verse: number | null) {
      this.verseEnd = verse;
      this.showVerseEndPicker = false;
      this.loadPreview();
      this.fetchTypingStats();
    },
    onVerseStartChange() {
      // Reset verseEnd khi verseStart thay đổi
      if (this.verseEnd && this.verseStart && this.verseEnd <= this.verseStart) {
        this.verseEnd = null;
      }
      this.loadPreview();
      this.fetchTypingStats();
    },
    onVerseEndChange() {
      this.loadPreview();
      this.fetchTypingStats();
    },
    async loadPreview() {
      if (!this.selectedBookId || !this.selectedChapter) return;
      
      try {
        let url = `/api/bible/verses?bookId=${this.selectedBookId}&chapter=${this.selectedChapter}&format=text`;
        
        if (this.verseStart) {
          url += `&verseStart=${this.verseStart}`;
          // Nếu không chọn verseEnd, chỉ lấy 1 câu
          const endVerse = this.verseEnd || this.verseStart;
          url += `&verseEnd=${endVerse}`;
        }
        
        const data = await $fetch(url);
        this.previewText = data.text;
      } catch (error) {
        console.error('Error loading preview:', error);
      }
    },
    async fetchTypingStats() {
      if (!this.selectedBookId) return;
      
      try {
        let url = `/api/typing-history/stats-by-book?bookId=${this.selectedBookId}`;
        if (this.selectedChapter) {
          url += `&chapter=${this.selectedChapter}`;
        }
        if (this.verseStart) {
          const endVerse = this.verseEnd || this.verseStart;
          url += `&verseStart=${this.verseStart}&verseEnd=${endVerse}`;
        }
        
        console.log('🔍 Fetching typing stats from:', url);
        const response: any = await $fetch(url);
        console.log('📊 Response:', response);
        
        if (response.success) {
          this.typingStats = response.stats;
          this.typingStatsLevel = response.level;
          console.log('✅ Stats loaded:', this.typingStatsLevel, this.typingStats);
        } else {
          this.typingStats = null;
          this.typingStatsLevel = '';
          console.log('❌ No stats or failed');
        }
      } catch (error) {
        console.error('Error fetching typing stats:', error);
        this.typingStats = null;
        this.typingStatsLevel = '';
      }
    },
    handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.showVerseStartPicker = false;
        this.showVerseEndPicker = false;
      }
    },
    startGame() {
      if (!this.selectedBookId || !this.selectedChapter) return;
      
      // Nếu chỉ chọn verseStart mà không chọn verseEnd, verseEnd = verseStart
      const finalVerseEnd = this.verseStart && !this.verseEnd ? this.verseStart : this.verseEnd;
      
      // Emit event hoặc navigate với params
      this.$emit('start', {
        bookId: this.selectedBookId,
        chapter: this.selectedChapter,
        verseStart: this.verseStart,
        verseEnd: finalVerseEnd,
        verseCount: this.verseCount, // Tổng số câu trong chương
        reference: this.referenceText,
      });
    }
  }
}
</script>
