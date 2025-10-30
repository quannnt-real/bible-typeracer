import { defineEventHandler, getQuery } from 'h3';
import { getVerses, getVersesText, getChapterCount, getVerseCount } from '../../utils/sqlite';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    
    const bookId = parseInt(query.bookId as string);
    const chapter = parseInt(query.chapter as string);
    const verseStart = query.verseStart ? parseInt(query.verseStart as string) : undefined;
    const verseEnd = query.verseEnd ? parseInt(query.verseEnd as string) : undefined;
    
    if (isNaN(bookId) || isNaN(chapter)) {
      return { error: 'Invalid bookId or chapter' };
    }
    
    // Nếu cần lấy số chapter
    if (query.action === 'chapter-count') {
      const count = await getChapterCount(bookId);
      return { count };
    }
    
    // Nếu cần lấy số câu trong chương
    if (query.action === 'verse-count') {
      const count = await getVerseCount(bookId, chapter);
      return { count };
    }
    
    // Nếu chỉ cần text (cho game typing)
    if (query.format === 'text') {
      const text = await getVersesText(bookId, chapter, verseStart, verseEnd);
      return { text };
    }
    
    // Trả về full verses data
    const verses = await getVerses(bookId, chapter, verseStart, verseEnd);
    return { verses };
  } catch (error) {
    console.error('Error fetching verses:', error);
    return { error: 'Failed to fetch verses' };
  }
});
