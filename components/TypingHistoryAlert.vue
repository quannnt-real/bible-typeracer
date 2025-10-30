<template>
  <div v-if="shouldShowAlert" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
    <p class="text-sm text-gray-700">
      <span v-if="stats.allCompleted" class="text-green-600 font-medium">
        ✅ Đã gõ hết {{ stats.completionCount }} lần
      </span>
      <span v-else class="text-blue-600">
        📝 Đã gõ: {{ completedVersesSummary }}
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  level?: string
  stats?: {
    bookId?: number
    chapter?: number
    verseStart?: number
    verseEnd?: number
    allCompleted: boolean
    completionCount: number
    totalVersesInChapter?: number
    totalChapters?: number
    completedChapters?: number
    verses?: Array<{
      verse: number
      timesTyped: number
    }>
  }
}>()

const shouldShowAlert = computed(() => {
  if (!props.stats) return false
  
  // Book/Chapter: chỉ hiển thị khi allCompleted
  if (props.level === 'book' || props.level === 'chapter') {
    return props.stats.allCompleted
  }
  
  // Segment: hiển thị nếu có ít nhất 1 câu đã gõ
  if (props.level === 'segment') {
    return props.stats.verses && props.stats.verses.some(v => v.timesTyped > 0)
  }
  
  return false
})

const completedVersesSummary = computed(() => {
  if (!props.stats?.verses) return ''
  
  const completed = props.stats.verses.filter(v => v.timesTyped > 0)
  if (completed.length === 0) return ''
  
  // Nhóm các câu theo số lần gõ
  const groupedByTimes = new Map<number, number[]>()
  completed.forEach(v => {
    if (!groupedByTimes.has(v.timesTyped)) {
      groupedByTimes.set(v.timesTyped, [])
    }
    groupedByTimes.get(v.timesTyped)!.push(v.verse)
  })
  
  // Sắp xếp theo số lần gõ giảm dần
  const sortedGroups = Array.from(groupedByTimes.entries())
    .sort((a, b) => b[0] - a[0])
  
  // Format từng nhóm
  const formatted = sortedGroups.map(([times, verses]) => {
    // Sắp xếp câu tăng dần
    verses.sort((a, b) => a - b)
    
    // Gộp các câu liên tiếp thành range
    const ranges: string[] = []
    let start = verses[0]
    let end = verses[0]
    
    for (let i = 1; i <= verses.length; i++) {
      if (i < verses.length && verses[i] === end + 1) {
        end = verses[i]
      } else {
        // Kết thúc một range
        if (start === end) {
          ranges.push(`${start}`)
        } else if (end === start + 1) {
          ranges.push(`${start}, ${end}`)
        } else {
          ranges.push(`${start}-${end}`)
        }
        if (i < verses.length) {
          start = verses[i]
          end = verses[i]
        }
      }
    }
    
    return `Câu ${ranges.join(', ')} (${times} lần)`
  })
  
  return formatted.join('; ')
})
</script>
