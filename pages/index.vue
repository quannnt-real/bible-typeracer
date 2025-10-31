<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      
      <!-- Hero Section - Welcome -->
      <div v-if="!gameStarted" class="text-center py-12">
        <div class="mb-6 animate-bounce-slow">
          <svg class="w-20 h-20 mx-auto text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          Bible Typing Race
        </h1>
        <p class="text-xl text-gray-600 mb-2">
          Rèn luyện kỹ năng gõ phím với Kinh Thánh
        </p>
        <p v-if="!isAuthenticated" class="text-sm text-gray-500 mb-8">
          💡 <span class="font-semibold">Mẹo:</span> Đăng nhập để lưu điểm số và theo dõi tiến độ!
        </p>
      </div>

      <!-- Bible Selector - Hiện khi chưa bắt đầu game -->
      <div v-if="!gameStarted">
        <BibleSelector @start="startWithBible" />
      </div>

      <!-- Game Area -->
      <div v-if="gameStarted" class="space-y-6">
        
        <!-- Reference Display -->
        <div v-if="bibleReference" class="text-center">
          <div class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span class="text-lg font-semibold">{{ bibleReference }}</span>
          </div>
        </div>

        <!-- Text Display Card -->
        <div class="bg-white rounded-2xl shadow-game p-8 border border-gray-100">
          <div
            id="text-display"
            v-if="text.length > 0"
            class="text-2xl leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            ref="textDisplay"
          >
            <span class="text-green-600 font-semibold">{{ previousText }}</span><span class="bg-blue-100 px-1 rounded" ref="currentWordHighlight">
              <span class="text-green-600 font-semibold">{{ currentWordTypedPart }}</span><span class="text-gray-900 font-bold">{{ currentWordStayingPart }}</span>
            </span><span class="text-gray-800">{{ followingText }}</span>
          </div>

          <div
            v-else
            class="text-2xl text-center text-gray-400 italic animate-pulse"
          >
            <svg class="w-12 h-12 mx-auto mb-4 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tải văn bản...
          </div>
        </div>

        <!-- Input Area -->
        <div v-if="text.length > 0" class="space-y-4">
          <div class="relative">
            <input
              @input="handleInput"
              v-model="writtenText"
              placeholder="Bắt đầu gõ..."
              class="w-full px-6 py-4 text-xl bg-white border-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md"
              :class="{
                'border-red-500': invalidWrittenText !== '',
                'border-gray-300': invalidWrittenText === ''
              }"
              autocomplete="off"
              spellcheck="false"
            />
            <div v-if="invalidWrittenText" class="absolute -top-8 right-4 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-lg">
              ❌ Sai rồi!
            </div>
            <!-- Pause Button -->
            <button
              v-if="isAuthenticated && started && !finished"
              @click="pauseGame"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zM11 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" clip-rule="evenodd" />
              </svg>
              Tạm dừng
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              id="bar" 
              class="h-full bg-gradient-to-r from-accent-400 via-primary-500 to-secondary-500 transition-all duration-300 ease-out relative overflow-hidden"
              style="width: 0%"
            >
              <div class="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-sm font-bold text-gray-700 drop-shadow">
                {{ progressionPercentage }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Resume Dialog -->
      <div v-if="showResumeDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-96 overflow-y-auto">
          <div class="text-center">
            <div class="mb-4">
              <svg class="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Chọn đoạn để tiếp tục</h3>
            <p class="text-gray-600 mb-6">
              Bạn có {{ availableProgresses.length }} đoạn chưa hoàn thành
            </p>
            
            <!-- List of progresses -->
            <div class="space-y-3 mb-6">
              <div
                v-for="progress in availableProgresses"
                :key="progress.id"
                class="relative p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200"
              >
                <button
                  @click="resumeProgress(progress)"
                  class="w-full text-left pr-12"
                >
                  <div class="font-semibold text-gray-900">{{ progress.bibleReference }}</div>
                  <div class="text-sm text-gray-600 mt-1">
                    Hoàn thành: {{ progress.progressPercentage || 0 }}%
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    Cập nhật: {{ new Date(progress.last_updated).toLocaleString('vi-VN') }}
                  </div>
                </button>
                
                <!-- Delete button -->
                <button
                  @click="deleteSingleProgress(progress)"
                  class="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 shadow-sm"
                  title="Xóa progress này"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button
                @click="discardAllProgress"
                class="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Xóa tất cả
              </button>
              <button
                @click="skipResume"
                class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Limit Dialog -->
      <div v-if="showProgressLimitDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-96 overflow-y-auto">
          <div class="text-center">
            <div class="mb-4">
              <svg class="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Đã đạt giới hạn 5 progress</h3>
            <p class="text-gray-600 mb-6">
              Bạn đã có {{ availableProgresses.length }} đoạn chưa hoàn thành. Hãy chọn một đoạn để tiếp tục hoặc xóa để lưu đoạn mới.
            </p>
            
            <!-- List of progresses -->
            <div class="space-y-3 mb-6">
              <div
                v-for="progress in availableProgresses"
                :key="progress.id"
                class="relative p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200"
              >
                <button
                  @click="handleProgressLimitSelection('resume', progress)"
                  class="w-full text-left pr-12"
                >
                  <div class="font-semibold text-gray-900">{{ progress.bibleReference }}</div>
                  <div class="text-sm text-gray-600 mt-1">
                    Hoàn thành: {{ progress.progressPercentage || 0 }}%
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    Cập nhật: {{ new Date(progress.last_updated).toLocaleString('vi-VN') }}
                  </div>
                </button>
                
                <!-- Delete button -->
                <button
                  @click="handleProgressLimitSelection('delete', progress)"
                  class="absolute top-2 right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 shadow-sm"
                  title="Xóa progress này"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button
                @click="discardAllProgressFromLimit"
                class="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Xóa tất cả
              </button>
              <button
                @click="cancelProgressLimit"
                class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Modal -->
      <NotificationModal
        :show="showNotificationModal"
        :title="notificationTitle"
        :message="notificationMessage"
        :type="notificationType"
        @close="showNotificationModal = false"
      />

    </div>
  </div>
</template>

<script lang="ts">
type State = {
  invalidWrittenText: string;
  startingTime: Date;
  text: string;
  validWrittenText: string;
  wordIndexPassed: number;
  writtenText: string;
  finished: boolean;
  started: boolean;
  progressionPercentage: number;
  gameStarted: boolean;
  bibleReference: string;
  currentSelection: any;
  // Progress features
  hasProgress: boolean;
  progressData: any;
  autoSaveInterval: any;
  showResumeDialog: boolean;
}

export default {
  setup() {
    const { user, isAuthenticated } = useAuth()
    return { user, isAuthenticated }
  },
  data(): State {
    return {
      invalidWrittenText: "",
      startingTime: new Date(),
      text: "",
      validWrittenText: "",
      wordIndexPassed: 0,
      writtenText: "",
      finished: false,
      started: false,
      progressionPercentage: 0,
      gameStarted: false,
      bibleReference: "",
      currentSelection: null,
      // Progress features
      hasProgress: false,
      progressData: null,
      availableProgresses: [], // List tất cả progress có thể resume
      showProgressLimitDialog: false, // Dialog khi vượt quá 5 progress
      pendingProgressData: null, // Progress mới đang chờ lưu
      totalTimeSpentBeforeResume: 0, // Thời gian đã gõ trước khi resume
      autoSaveInterval: null,
      showResumeDialog: false,
      // Notification modal
      showNotificationModal: false,
      notificationTitle: '',
      notificationMessage: '',
      notificationType: 'info', // 'success', 'error', 'info'
    }
  },
  computed: {
    // Tách text thành mảng các "token" - mỗi token là 1 từ hoặc 1 newline
    textTokens() {
      if (!this.text) return [];
      
      const tokens = [];
      const parts = this.text.split(/(\n)/); // Tách theo newline nhưng giữ lại newline
      
      for (const part of parts) {
        if (part === '\n') {
          tokens.push('\n'); // Newline là 1 token riêng
        } else if (part) {
          // Tách phần text theo space
          const words = part.split(' ').filter(w => w !== '');
          tokens.push(...words);
        }
      }
      
      return tokens;
    },
    previousText() {
      if (this.textTokens.length === 0) {
        return ""
      }
      
      // Tìm vị trí từ thật sự hiện tại (sau các newline)
      let currentRealWordIndex = this.wordIndexPassed;
      while (currentRealWordIndex < this.textTokens.length && this.textTokens[currentRealWordIndex] === '\n') {
        currentRealWordIndex++;
      }
      
      const passedTokens = this.textTokens.slice(0, currentRealWordIndex);
      let result = '';
      
      for (let i = 0; i < passedTokens.length; i++) {
        const token = passedTokens[i];
        if (token === '\n') {
          result += '\n';
        } else {
          result += token;
          // Thêm space sau từ, trừ khi token tiếp theo là newline
          const nextToken = passedTokens[i + 1];
          if (nextToken !== '\n' && i < passedTokens.length - 1) {
            result += ' ';
          }
        }
      }
      
      // Thêm space sau previousText nếu có từ tiếp theo
      if (this.currentWord && result && !result.endsWith('\n')) {
        result += ' ';
      }
      
      return result;
    },
    currentWordTypedPart() {
      return this.validWrittenText;
    },
    currentWordStayingPart() {
      if (this.currentWord === '\n') return '';
      return this.currentWord.substring(this.currentWordTypedPart.length);
    },
    currentWord() {
      // Tìm từ thật sự tiếp theo, bỏ qua các newline
      let index = this.wordIndexPassed;
      while (index < this.textTokens.length && this.textTokens[index] === '\n') {
        index++;
      }
      return this.textTokens[index] || '';
    },
    followingText() {
      if (this.textTokens.length === 0) {
        return ""
      }
      
      // Tìm vị trí từ thật sự hiện tại (sau các newline)
      let currentRealWordIndex = this.wordIndexPassed;
      while (currentRealWordIndex < this.textTokens.length && this.textTokens[currentRealWordIndex] === '\n') {
        currentRealWordIndex++;
      }
      
      const followingTokens = this.textTokens.slice(currentRealWordIndex + 1);
      let result = '';
      
      for (let i = 0; i < followingTokens.length; i++) {
        const token = followingTokens[i];
        if (token === '\n') {
          result += '\n';
        } else {
          result += token;
          // Thêm space sau từ, trừ khi token tiếp theo là newline hoặc là token cuối
          const nextToken = followingTokens[i + 1];
          if (nextToken !== '\n' && i < followingTokens.length - 1) {
            result += ' ';
          }
        }
      }
      
      return result;
    },
    followingWord() {
      if (this.textTokens.length === 0) {
        return ""
      }
      
      return this.followingText;
    },
  },
  mounted() {
    this.checkExistingProgress();
  },
  watch: {
    // Theo dõi thay đổi của isAuthenticated
    isAuthenticated(newVal) {
      if (newVal) {
        // User vừa đăng nhập, kiểm tra progress
        console.log('[WATCH] User authenticated, checking progress');
        this.checkExistingProgress();
      }
    }
  },
  methods: {
    // Kiểm tra có tiến độ cũ chưa hoàn thành không
    async checkExistingProgress() {
      if (!this.isAuthenticated) {
        console.log('[CHECK_PROGRESS] User not authenticated');
        return;
      }

      try {
        console.log('[CHECK_PROGRESS] Checking progress for user:', this.user?.id);
        const data = await $fetch('/api/progress/resume');
        console.log('[CHECK_PROGRESS] API response:', data);
        if (data.progress && data.progress.length > 0) {
          console.log('[CHECK_PROGRESS] Found progresses:', data.progress.length);
          
          // Xử lý từng progress để thêm thông tin hiển thị
          const processedProgresses = await Promise.all(
            data.progress.map(async (progress: any) => {
              console.log('Progress data:', progress); // Debug log
              const wordsCompleted = progress.current_word_index || 0;
              
              // Tạo bible reference
              const bookName = await this.getBookName(progress.book_id);
              let bibleReference = `${bookName} ${progress.chapter}`;
              if (progress.verse_start) {
                if (progress.verse_end && progress.verse_end !== progress.verse_start) {
                  bibleReference += `:${progress.verse_start}-${progress.verse_end}`;
                } else {
                  bibleReference += `:${progress.verse_start}`;
                }
              }
              
              return {
                ...progress,
                wordsCompleted,
                totalWords: 120, // Ước tính
                bibleReference,
                progressPercentage: progress.progress_percentage || 0,
                displayText: `${bibleReference} (${wordsCompleted}/120 từ)`
              };
            })
          );
          
          this.availableProgresses = processedProgresses;
          this.hasProgress = true;
          this.showResumeDialog = true;
        } else {
          console.log('[CHECK_PROGRESS] No progress found');
        }
      } catch (error) {
        console.error('[CHECK_PROGRESS] Error checking progress:', error);
      }
    },

    // Tiếp tục từ tiến độ được chọn
    async resumeProgress(selectedProgress: any) {
      if (!selectedProgress) return;

      // Lưu progress được chọn
      this.progressData = selectedProgress;
      this.totalTimeSpentBeforeResume = selectedProgress.total_time_spent || 0;

      // Restore game state
      this.gameStarted = true;
      this.wordIndexPassed = selectedProgress.current_word_index;
      this.writtenText = selectedProgress.typed_text;
      this.validWrittenText = selectedProgress.typed_text;
      this.started = true;

      // Restore selection
      this.currentSelection = {
        bookId: selectedProgress.book_id,
        chapter: selectedProgress.chapter,
        verseStart: selectedProgress.verse_start,
        verseEnd: selectedProgress.verse_end,
        reference: `Đang tiếp tục...`
      };

      // Load lại text
      await this.loadTextFromProgress();

      // Tính lại progress percentage
      this.updateProgress();

      // Start auto-save
      this.startAutoSave();

      this.showResumeDialog = false;
    },

    // Load text từ progress data
    async loadTextFromProgress() {
      if (!this.currentSelection) return;

      let url = `/api/texts/random?source=bible&bookId=${this.currentSelection.bookId}&chapter=${this.currentSelection.chapter}`;

      if (this.currentSelection.verseStart) {
        url += `&verseStart=${this.currentSelection.verseStart}`;
        if (this.currentSelection.verseEnd) {
          url += `&verseEnd=${this.currentSelection.verseEnd}`;
        }
      }

      const data = await $fetch(url);
      this.text = this.normalizeText(data.text);
      
      // Tạo reference tạm thời, sẽ được update khi load xong
      const bookName = await this.getBookName(this.currentSelection.bookId);
      this.bibleReference = `${bookName} ${this.currentSelection.chapter}`;
      if (this.currentSelection.verseStart) {
        if (this.currentSelection.verseEnd && this.currentSelection.verseEnd !== this.currentSelection.verseStart) {
          this.bibleReference += `:${this.currentSelection.verseStart}-${this.currentSelection.verseEnd}`;
        } else {
          this.bibleReference += `:${this.currentSelection.verseStart}`;
        }
      }
    },

    // Lấy tên sách từ bookId
    async getBookName(bookId: number): Promise<string> {
      try {
        const books = await $fetch('/api/bible/books');
        const book = books.find((b: any) => b.id === bookId);
        return book ? book.name : `Sách ${bookId}`;
      } catch (error) {
        console.error('Error fetching book name:', error);
        return `Sách ${bookId}`;
      }
    },

    // Bắt đầu auto-save mỗi 30 giây
    startAutoSave() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }

      this.autoSaveInterval = setInterval(async () => {
        if (this.isAuthenticated && this.gameStarted && !this.finished) {
          await this.saveProgress();
        }
      }, 30000); // 30 giây
    },

    // Lưu tiến độ hiện tại
    async saveProgress() {
      if (!this.isAuthenticated || !this.currentSelection) return;

      try {
        const currentSessionTime = this.started ?
          Math.floor((new Date().getTime() - this.startingTime.getTime()) / 1000) : 0;
        const totalTimeSpent = this.totalTimeSpentBeforeResume + currentSessionTime;

        await $fetch('/api/progress/save', {
          method: 'POST',
          body: {
            bookId: this.currentSelection.bookId,
            chapter: this.currentSelection.chapter,
            verseStart: this.currentSelection.verseStart,
            verseEnd: this.currentSelection.verseEnd,
            currentWordIndex: this.wordIndexPassed,
            typedText: this.validWrittenText,
            progressPercentage: this.progressionPercentage,
            textLength: this.text.length,
            status: 'active',
            startTime: this.startingTime.toISOString(),
            totalTimeSpent: totalTimeSpent
          }
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    },

    // Tạm dừng game
    async pauseGame() {
      if (!this.isAuthenticated) return;

      try {
        // Kiểm tra số lượng progress hiện có
        const currentProgressCount = await this.getCurrentProgressCount();
        
        if (currentProgressCount >= 5) {
          // Load available progresses để hiển thị trong dialog
          await this.loadAvailableProgresses();
          
          // Vượt quá limit, hiện dialog để chọn
          this.pendingProgressData = {
            bookId: this.currentSelection.bookId,
            chapter: this.currentSelection.chapter,
            verseStart: this.currentSelection.verseStart,
            verseEnd: this.currentSelection.verseEnd,
            currentWordIndex: this.wordIndexPassed,
            typedText: this.validWrittenText,
            progressPercentage: this.progressionPercentage,
            textLength: this.text.length,
            status: 'paused',
            startTime: this.startingTime.toISOString(),
            totalTimeSpent: this.totalTimeSpentBeforeResume + (this.started ? Math.floor((new Date().getTime() - this.startingTime.getTime()) / 1000) : 0)
          };
          
          this.showProgressLimitDialog = true;
          return;
        }

        // Lưu progress hiện tại trước khi pause
        await this.saveProgress();
        
        // Sau đó pause
        await $fetch('/api/progress/pause', {
          method: 'POST'
        });

        // Clear auto-save
        if (this.autoSaveInterval) {
          clearInterval(this.autoSaveInterval);
          this.autoSaveInterval = null;
        }

        // Reset game state
        this.resetGame();

        // Thông báo
        this.showNotification('Đã tạm dừng!', 'Bạn có thể tiếp tục sau.', 'info');

      } catch (error) {
        console.error('Error pausing game:', error);
      }
    },

    // Bỏ qua progress cũ
    discardProgress() {
      this.hasProgress = false;
      this.progressData = null;
      this.showResumeDialog = false;
    },

    // Xóa tất cả progress
    async discardAllProgress() {
      if (!this.isAuthenticated) return;

      try {
        // Xóa tất cả progress của user
        await $fetch('/api/progress/clear-all', {
          method: 'POST'
        });

        this.hasProgress = false;
        this.availableProgresses = [];
        this.progressData = null;
        this.showResumeDialog = false;
      } catch (error) {
        console.error('Error clearing all progress:', error);
      }
    },

    // Xóa tất cả progress từ progress limit dialog
    async discardAllProgressFromLimit() {
      if (!this.isAuthenticated) return;

      try {
        // Xóa tất cả progress của user
        await $fetch('/api/progress/clear-all', {
          method: 'POST'
        });

        this.hasProgress = false;
        this.availableProgresses = [];
        this.progressData = null;
        this.showProgressLimitDialog = false;
        
        // Reset game và thông báo
        this.resetGame();
        this.showNotification('Thành công', 'Đã xóa tất cả progress và tạo progress mới!', 'success');
      } catch (error) {
        console.error('Error clearing all progress:', error);
        this.showNotification('Lỗi', 'Không thể xóa tất cả progress!', 'error');
      }
    },

    // Tạm thời bỏ qua resume (progress vẫn còn)
    skipResume() {
      this.showResumeDialog = false;
      // Progress vẫn còn trong database
    },

    // Lấy số lượng progress hiện có
    async getCurrentProgressCount(): Promise<number> {
      try {
        const data = await $fetch('/api/progress/count');
        return data.count || 0;
      } catch (error) {
        console.error('Error getting progress count:', error);
        return 0;
      }
    },

    // Xử lý khi chọn progress trong limit dialog
    async handleProgressLimitSelection(action: 'resume' | 'delete', selectedProgress: any) {
      try {
        if (action === 'resume') {
          // Lưu progress mới trước
          await this.savePendingProgress();
          
          // Sau đó resume progress đã chọn
          await this.resumeProgress(selectedProgress);
          
        } else if (action === 'delete') {
          // Xóa progress đã chọn
          await $fetch('/api/progress/delete', {
            method: 'POST',
            body: { progressId: selectedProgress.id }
          });
          
          // Lưu progress mới
          await this.savePendingProgress();
          
          // Reset game và thông báo
          this.resetGame();
          this.showNotification('Thành công', 'Đã lưu progress mới và xóa progress cũ!', 'success');
        }
        
        this.showProgressLimitDialog = false;
        this.pendingProgressData = null;
        
      } catch (error) {
        console.error('Error handling progress limit selection:', error);
      }
    },

    // Lưu pending progress
    async savePendingProgress() {
      if (!this.pendingProgressData) return;
      
      const progressId = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await $fetch('/api/progress/save', {
        method: 'POST',
        body: {
          id: progressId,
          ...this.pendingProgressData
        }
      });
    },

    // Hủy bỏ progress limit dialog
    cancelProgressLimit() {
      this.showProgressLimitDialog = false;
      this.pendingProgressData = null;
      // Tiếp tục game hiện tại mà không lưu progress
    },

    normalizeText(text) {
      return text
        .replace(/[\u201C\u201D]/g, '"')  // Unicode 8220, 8221 (""") -> straight quotes
        .replace(/[\u2018\u2019]/g, "'")  // Unicode 8216, 8217 ('') -> straight apostrophes
        .replace(/\u2013/g, '-')          // Unicode 8211 (–) En dash -> hyphen
        .replace(/\u2014/g, '-')          // Unicode 8212 (—) Em dash -> hyphen
        .replace(/\u2026/g, '...')        // Unicode 8230 (…) Ellipsis -> three dots
        // GIỮ NGUYÊN newline, chỉ collapse multiple spaces trên cùng dòng
        .replace(/ +/g, ' ')              // Multiple spaces -> single space (không touch newline)
    },
    async startWithBible(selection) {
      // Không cần check authentication nữa - cho phép guest mode
      this.gameStarted = true;
      this.bibleReference = selection.reference;
      this.currentSelection = selection;

      let url = `/api/texts/random?source=bible&bookId=${selection.bookId}&chapter=${selection.chapter}`;

      if (selection.verseStart) {
        url += `&verseStart=${selection.verseStart}`;
        if (selection.verseEnd) {
          url += `&verseEnd=${selection.verseEnd}`;
        }
      }

      // Không cần kiểm tra nữa vì đã hiển thị trong BibleSelector
      const data = await $fetch(url);
      // Normalize text ngay khi load
      this.text = this.normalizeText(data.text);

      // Start auto-save cho user đăng nhập
      if (this.isAuthenticated) {
        this.startAutoSave();
      }
    },
    handleInput($e) {
      // Bắt đầu timer
      if (!this.started) {
        this.started = true;
        this.startingTime = new Date();
      }
      
      if (this.finished) {
        return;
      }

      const inputValue = $e.target.value;
      
      // Skip newline tokens nếu có
      while (this.wordIndexPassed < this.textTokens.length && this.textTokens[this.wordIndexPassed] === '\n') {
        this.wordIndexPassed++;
      }
      
      // Kiểm tra completion
      if (this.wordIndexPassed >= this.textTokens.length) {
        this.handleCompletion();
        return;
      }
      
      // Xử lý khi có space - user đã gõ xong ít nhất 1 từ
      if (inputValue.includes(' ')) {
        const words = inputValue.split(' ').filter(w => w !== '');
        
        // Xử lý từng từ đã hoàn thành
        for (const word of words) {
          // Skip newline tokens
          while (this.wordIndexPassed < this.textTokens.length && this.textTokens[this.wordIndexPassed] === '\n') {
            this.wordIndexPassed++;
          }
          
          if (this.wordIndexPassed >= this.textTokens.length) {
            this.handleCompletion();
            return;
          }
          
          const expectedWord = this.textTokens[this.wordIndexPassed];
          
          if (word === expectedWord) {
            // Từ đúng, chuyển sang từ tiếp theo
            this.wordIndexPassed++;
          } else {
            // Từ sai
            this.invalidWrittenText = word;
            return;
          }
        }
        
        // Clear input sau khi xử lý xong tất cả từ
        this.writtenText = "";
        this.validWrittenText = "";
        this.invalidWrittenText = "";
        $e.target.value = "";
        
        // Update progress
        this.updateProgress();
        return;
      }
      
      // Xử lý khi đang gõ (chưa có space)
      const trimmedInput = inputValue.trim();
      
      if (!trimmedInput) {
        // Input rỗng
        this.validWrittenText = "";
        this.invalidWrittenText = "";
        return;
      }
      
      const expectedWord = this.textTokens[this.wordIndexPassed];
      
      // Kiểm tra input có phải phần đầu của từ cần gõ không
      if (expectedWord.startsWith(trimmedInput)) {
        // Đúng
        this.validWrittenText = trimmedInput;
        this.invalidWrittenText = "";
        
        // Kiểm tra nếu đã gõ đúng từ cuối cùng - complete ngay lập tức
        if (trimmedInput === expectedWord && this.wordIndexPassed === this.textTokens.length - 1) {
          this.wordIndexPassed++;
          this.handleCompletion();
          return;
        }
      } else {
        // Sai
        this.validWrittenText = "";
        this.invalidWrittenText = trimmedInput;
      }
      
      // Update progress
      this.updateProgress();
      
      // Auto-scroll khi cần
      this.autoScrollToCurrentWord();
    },
    updateProgress() {
      const percentage = Math.floor((this.previousText.length + this.validWrittenText.length) / this.text.length * 100);
      this.progressionPercentage = percentage;
      const barElement = document.getElementById('bar');
      if (barElement) {
        barElement.style.width = percentage + "%";
      }
    },
    autoScrollToCurrentWord() {
      // Tìm element highlight hiện tại
      const highlightElement = document.querySelector('.bg-blue-100');
      const textDisplay = document.getElementById('text-display');
      
      if (highlightElement && textDisplay) {
        // Lấy vị trí của highlight element
        const highlightRect = highlightElement.getBoundingClientRect();
        const containerRect = textDisplay.getBoundingClientRect();
        
        // Tính vị trí tương đối trong container
        const relativeTop = highlightRect.top - containerRect.top;
        const containerHeight = containerRect.height;
        
        // Nếu highlight nằm ở nửa dưới của container, scroll để đưa nó lên giữa
        if (relativeTop > containerHeight * 0.6) {
          const scrollAmount = relativeTop - containerHeight * 0.4;
          textDisplay.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    },
    handleCompletion() {
      // Clear current word state để không hiển thị duplicate
      this.validWrittenText = "";
      this.writtenText = "";
      this.invalidWrittenText = "";
      
      // Đảm bảo tất cả text được hiển thị trong previousText
      this.wordIndexPassed = this.textTokens.length;
      
      const currentSessionDuration = Math.floor(new Date().getTime() / 1000 - this.startingTime.getTime() / 1000);
      const totalDuration = this.totalTimeSpentBeforeResume + currentSessionDuration;
      this.finished = true
      window.setTimeout(async () => {
        // Đếm số từ thực (không tính newline)
        const wordCount = this.textTokens.filter(t => t !== '\n').length;
        // WPM = words per minute, đảm bảo duration tối thiểu 1 giây để tránh chia cho 0
        const safeDuration = Math.max(totalDuration, 1);
        const wpm = Math.floor(wordCount / (safeDuration / 60));
        
        // Giới hạn WPM hợp lý (không quá 300 WPM)
        const reasonableWpm = Math.min(wpm, 300);
        
        // Nếu đã đăng nhập - lưu score và history đồng bộ, sau đó xóa progress
        if (this.isAuthenticated) {
          const nickname = this.user?.display_name || this.user?.username || 'Anonymous'

          try {
            // Lưu ranking trước
            await $fetch('/api/rankings/new', {
              method: "POST",
              body: { nickname, score_wpm: reasonableWpm }
            });
            console.log('✅ Ranking saved successfully');

            // Sau đó lưu typing history (luôn có currentSelection khi gõ Bible)
            if (this.currentSelection) {
              const verseStart = this.currentSelection.verseStart || 1;
              const verseEnd = this.currentSelection.verseEnd || this.currentSelection.verseCount;

              await $fetch('/api/typing-history/record', {
                method: "POST",
                body: {
                  bookId: this.currentSelection.bookId,
                  chapter: this.currentSelection.chapter,
                  verseStart: verseStart,
                  verseEnd: verseEnd,
                  wpm: reasonableWpm
                }
              });
              console.log('✅ Typing history saved successfully');
            } else {
              console.warn('⚠️  No currentSelection - typing history not saved');
            }

            // Xóa progress sau khi hoàn thành thành công
            try {
              console.log('🗑️ Calling API complete with:', {
                bookId: this.currentSelection?.bookId,
                chapter: this.currentSelection?.chapter,
                verseStart: this.currentSelection?.verseStart || 1,
                verseEnd: this.currentSelection?.verseEnd || this.currentSelection?.verseCount
              });
              
              const completeResult = await $fetch('/api/progress/complete', {
                method: "POST",
                body: { 
                  bookId: this.currentSelection?.bookId,
                  chapter: this.currentSelection?.chapter,
                  verseStart: this.currentSelection?.verseStart || 1,
                  verseEnd: this.currentSelection?.verseEnd || this.currentSelection?.verseCount
                }
              });
              
              console.log('✅ Progress cleared result:', completeResult);
              this.showNotification('Thành công', 'Progress đã được xóa thành công!', 'success');
            } catch (progressError) {
              console.warn('⚠️  Could not clear progress:', progressError);
              this.showNotification('Lỗi', 'Không thể xóa progress! ' + progressError.message, 'error');
            }
          } catch (error) {
            console.error('❌ Error saving data:', error);
          }

          this.showNotification('Thành công', `Hoàn thành trong ${totalDuration} giây (${reasonableWpm} WPM)! Tuyệt vời! 🎉\n\nĐiểm số đã được lưu!`, 'success');
        } else {
          // Guest mode - prompt đăng nhập để lưu score
          const shouldLogin = confirm(
            `Hoàn thành trong ${totalDuration} giây (${reasonableWpm} WPM)! Tuyệt vời! 🎉\n\n` +
            `💡 Đăng nhập để lưu điểm số và thi đua với mọi người?\n\n` +
            `Nhấn OK để đăng nhập, Cancel để chơi tiếp.`
          );
          
          if (shouldLogin) {
            // Chuyển đến trang đăng nhập
            this.$router.push('/login');
            return;
          }
        }
        
        // Hỏi có muốn chơi lại không
        if (confirm('Bạn có muốn chơi lại không?')) {
          this.resetGame();
        }
      }, 1)
    },
    async fetchText() {
      const data = await $fetch('/api/texts/random')
      this.text = data.text
    },
    resetGame() {
      this.text = '';
      this.writtenText = '';
      this.validWrittenText = '';
      this.invalidWrittenText = '';
      this.wordIndexPassed = 0;
      this.progressionPercentage = 0;
      this.finished = false;
      this.started = false;
      // Không reset gameStarted để giữ trạng thái
      this.gameStarted = false;
      this.bibleReference = '';
      // Không reset currentSelection để lưu typing-history
      this.currentSelection = null;
      // Reset progress tracking
      this.totalTimeSpentBeforeResume = 0;
      this.progressData = null;
    },

    // Load available progresses mà không hiện dialog
    async loadAvailableProgresses() {
      if (!this.isAuthenticated) return;

      try {
        const data = await $fetch('/api/progress/resume');
        if (data.progress && data.progress.length > 0) {
          // Xử lý từng progress để thêm thông tin hiển thị
          const processedProgresses = await Promise.all(
            data.progress.map(async (progress: any) => {
              const wordsCompleted = progress.current_word_index || 0;
              
              // Tạo bible reference
              const bookName = await this.getBookName(progress.book_id);
              let bibleReference = `${bookName} ${progress.chapter}`;
              if (progress.verse_start) {
                if (progress.verse_end && progress.verse_end !== progress.verse_start) {
                  bibleReference += `:${progress.verse_start}-${progress.verse_end}`;
                } else {
                  bibleReference += `:${progress.verse_start}`;
                }
              }
              
              return {
                ...progress,
                wordsCompleted,
                totalWords: 120, // Ước tính
                bibleReference,
                progressPercentage: progress.progress_percentage || 0,
                displayText: `${bibleReference} (${wordsCompleted}/120 từ)`
              };
            })
          );
          
          this.availableProgresses = processedProgresses;
        } else {
          this.availableProgresses = [];
        }
      } catch (error) {
        console.error('Error loading available progresses:', error);
        this.availableProgresses = [];
      }
    },

    // Xóa một progress cụ thể
    async deleteSingleProgress(progress: any) {
      this.showNotification('Đang xóa...', `Đang xóa progress "${progress.bibleReference}"...`, 'info');

      try {
        await $fetch('/api/progress/delete', {
          method: 'POST',
          body: { progressId: progress.id }
        });
        
        this.availableProgresses = this.availableProgresses.filter(p => p.id !== progress.id);
        if (this.availableProgresses.length === 0) {
          this.showResumeDialog = false;
          this.hasProgress = false;
        }
      } catch (error) {
        this.showNotification('Lỗi', 'Lỗi khi xóa!', 'error');
      }
    },
    // Hiển thị notification modal thay thế alert
    showNotification(title: string, message: string, type: 'success' | 'error' | 'info' = 'info') {
      this.notificationTitle = title;
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotificationModal = true;
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar cho text display */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f9fafb;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>