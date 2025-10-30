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
            v-if="text.length > 0"
            class="text-2xl leading-relaxed whitespace-pre-wrap"
          >
            <span class="text-green-600 font-semibold">{{ previousText }}</span><span class="bg-blue-100 px-1 rounded">
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
    // Không tự động fetch text nữa, đợi user chọn
  },
  methods: {
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
      } else {
        // Sai
        this.validWrittenText = "";
        this.invalidWrittenText = trimmedInput;
      }
      
      // Update progress
      this.updateProgress();
    },
    updateProgress() {
      const percentage = Math.floor((this.previousText.length + this.validWrittenText.length) / this.text.length * 100);
      this.progressionPercentage = percentage;
      const barElement = document.getElementById('bar');
      if (barElement) {
        barElement.style.width = percentage + "%";
      }
    },
    handleCompletion() {
      const duration = Math.floor(new Date().getTime() / 1000 - this.startingTime.getTime() / 1000);
      this.finished = true
      window.setTimeout(async () => {
        // Đếm số từ thực (không tính newline)
        const wordCount = this.textTokens.filter(t => t !== '\n').length;
        const wpm = Math.floor(wordCount / (duration / 60))
        
        // Nếu đã đăng nhập - lưu score và history
        if (this.isAuthenticated) {
          const nickname = this.user?.display_name || this.user?.username || 'Anonymous'

          // Lưu ranking
          await $fetch('/api/rankings/new', {
            method: "POST",
            body: { nickname, score_wpm: wpm }
          });

          // Lưu lịch sử gõ
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
                textContent: this.text
              }
            });
          }

          alert(`Hoàn thành trong ${duration} giây (${wpm} WPM)! Tuyệt vời! 🎉\n\nĐiểm số đã được lưu!`)
        } else {
          // Guest mode - prompt đăng nhập để lưu score
          const shouldLogin = confirm(
            `Hoàn thành trong ${duration} giây (${wpm} WPM)! Tuyệt vời! 🎉\n\n` +
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
      this.gameStarted = false;
      this.bibleReference = '';
      this.currentSelection = null;
    }
  }
}
</script>