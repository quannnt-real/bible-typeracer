import { defineEventHandler, getQuery } from 'h3'
import { getCurrentUser } from '../../utils/auth';
import { queryTypingHistoryDatabase } from '../../utils/typing-history-db';
import { getChapterCount, getVerseCount } from '../../utils/sqlite';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const bookId = parseInt(query.bookId as string)
    const chapter = query.chapter ? parseInt(query.chapter as string) : undefined
    const verseStart = query.verseStart ? parseInt(query.verseStart as string) : undefined
    const verseEnd = query.verseEnd ? parseInt(query.verseEnd as string) : undefined

    if (!bookId) {
      return { success: false, error: 'bookId is required' }
    }

    const user = await getCurrentUser(event)
    if (!user) {
      return { success: false, stats: null }
    }

    // Trường hợp: Chọn phân khúc (verse range)
    if (chapter && verseStart && verseEnd) {
      const sql = `
        SELECT verse_start, verse_end, times_typed, last_typed_at
        FROM typing_history
        WHERE book_id = ${bookId} 
          AND chapter = ${chapter}
          AND user_id = '${user.id}'
          AND verse_start <= ${verseEnd}
          AND (verse_end >= ${verseStart} OR verse_end IS NULL)
        ORDER BY verse_start
      `
      
      const records = await queryTypingHistoryDatabase(sql)
      
      // Tạo map để tra cứu nhanh
      const verseMap = new Map<number, number>()
      for (const record of records) {
        const start = record.verse_start
        const end = record.verse_end || record.verse_start // Nếu verse_end null thì dùng verse_start
        for (let v = start; v <= end; v++) {
          // Chỉ tính các câu nằm trong range được chọn
          if (v >= verseStart && v <= verseEnd) {
            verseMap.set(v, (verseMap.get(v) || 0) + record.times_typed)
          }
        }
      }
      
      // Kiểm tra tất cả các câu trong range
      const allVerses = []
      let minTimes = Infinity
      let allCompleted = true
      
      for (let v = verseStart; v <= verseEnd; v++) {
        const times = verseMap.get(v) || 0
        if (times === 0) {
          allCompleted = false
        } else {
          minTimes = Math.min(minTimes, times)
        }
        allVerses.push({
          verse: v,
          timesTyped: times
        })
      }
      
      return {
        success: true,
        level: 'segment',
        stats: {
          bookId,
          chapter,
          verseStart,
          verseEnd,
          allCompleted,
          completionCount: allCompleted ? minTimes : 0,
          verses: allVerses
        }
      }
    }

    // Trường hợp: Chọn chương (chapter)
    if (chapter) {
      const totalVersesInChapter = await getVerseCount(bookId, chapter)
      
      const sql = `
        SELECT verse_start, verse_end, times_typed
        FROM typing_history
        WHERE book_id = ${bookId} 
          AND chapter = ${chapter}
          AND user_id = '${user.id}'
      `
      
      const records = await queryTypingHistoryDatabase(sql)
      
      // Tạo map để tra cứu
      const verseMap = new Map<number, number>()
      for (const record of records) {
        const start = record.verse_start
        const end = record.verse_end || record.verse_start
        for (let v = start; v <= end; v++) {
          verseMap.set(v, (verseMap.get(v) || 0) + record.times_typed)
        }
      }
      
      // Kiểm tra tất cả các câu trong chương
      let minTimes = Infinity
      let allCompleted = true
      
      for (let v = 1; v <= totalVersesInChapter; v++) {
        const times = verseMap.get(v) || 0
        if (times === 0) {
          allCompleted = false
        } else {
          minTimes = Math.min(minTimes, times)
        }
      }
      
      return {
        success: true,
        level: 'chapter',
        stats: {
          bookId,
          chapter,
          totalVersesInChapter,
          allCompleted,
          completionCount: allCompleted ? minTimes : 0
        }
      }
    }

    // Trường hợp: Chỉ chọn sách (book)
    const totalChapters = await getChapterCount(bookId)
    
    // Lấy completion count cho từng chapter
    const chapterCompletions: number[] = []
    
    for (let ch = 1; ch <= totalChapters; ch++) {
      const totalVersesInChapter = await getVerseCount(bookId, ch)
      
      const sql = `
        SELECT verse_start, verse_end, times_typed
        FROM typing_history
        WHERE book_id = ${bookId} 
          AND chapter = ${ch}
          AND user_id = '${user.id}'
      `
      
      const records = await queryTypingHistoryDatabase(sql)
      
      // Tạo map
      const verseMap = new Map<number, number>()
      for (const record of records) {
        const start = record.verse_start
        const end = record.verse_end || record.verse_start
        for (let v = start; v <= end; v++) {
          verseMap.set(v, (verseMap.get(v) || 0) + record.times_typed)
        }
      }
      
      // Kiểm tra chapter này completed chưa
      let minTimes = Infinity
      let chapterCompleted = true
      
      for (let v = 1; v <= totalVersesInChapter; v++) {
        const times = verseMap.get(v) || 0
        if (times === 0) {
          chapterCompleted = false
          break
        } else {
          minTimes = Math.min(minTimes, times)
        }
      }
      
      if (chapterCompleted) {
        chapterCompletions.push(minTimes)
      }
    }
    
    // Tính book completion
    const allChaptersCompleted = chapterCompletions.length === totalChapters
    const bookCompletionCount = allChaptersCompleted ? Math.min(...chapterCompletions) : 0
    
    return {
      success: true,
      level: 'book',
      stats: {
        bookId,
        totalChapters,
        completedChapters: chapterCompletions.length,
        allCompleted: allChaptersCompleted,
        completionCount: bookCompletionCount
      }
    }
  } catch (error) {
    console.error('Error fetching typing stats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
})
