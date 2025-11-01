import { getTursoClient } from './turso';

export interface Book {
  id: number;
  book_reference_id: number;
  testament_reference_id: number;
  name: string;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Lấy tất cả các sách trong Kinh Thánh
 */
export async function getAllBooks(): Promise<Book[]> {
  const client = getTursoClient();
  const result = await client.execute('SELECT * FROM book ORDER BY id');
  return result.rows as unknown as Book[];
}

/**
 * Lấy thông tin sách theo ID
 */
export async function getBookById(bookId: number): Promise<Book | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM book WHERE id = ?',
    args: [bookId],
  });
  return (result.rows[0] as unknown as Book) || null;
}

/**
 * Lấy tất cả các câu trong một chương
 */
export async function getVersesByChapter(bookId: number, chapter: number): Promise<Verse[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM verse WHERE book_id = ? AND chapter = ? ORDER BY verse',
    args: [bookId, chapter],
  });
  return result.rows as unknown as Verse[];
}

/**
 * Lấy một câu cụ thể
 */
export async function getVerse(bookId: number, chapter: number, verseNum: number): Promise<Verse | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM verse WHERE book_id = ? AND chapter = ? AND verse = ?',
    args: [bookId, chapter, verseNum],
  });
  return (result.rows[0] as unknown as Verse) || null;
}

/**
 * Lấy một đoạn văn (nhiều câu liên tiếp)
 */
export async function getVerseRange(
  bookId: number,
  chapter: number,
  startVerse: number,
  endVerse: number
): Promise<Verse[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM verse WHERE book_id = ? AND chapter = ? AND verse BETWEEN ? AND ? ORDER BY verse',
    args: [bookId, chapter, startVerse, endVerse],
  });
  return result.rows as unknown as Verse[];
}

/**
 * Lấy câu ngẫu nhiên
 */
export async function getRandomVerse(): Promise<Verse | null> {
  const client = getTursoClient();
  const result = await client.execute('SELECT * FROM verse ORDER BY RANDOM() LIMIT 1');
  return (result.rows[0] as unknown as Verse) || null;
}

/**
 * Đếm số chương trong một sách
 */
export async function countChaptersInBook(bookId: number): Promise<number> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT MAX(chapter) as max_chapter FROM verse WHERE book_id = ?',
    args: [bookId],
  });
  const row = result.rows[0] as unknown as { max_chapter: number };
  return row?.max_chapter || 0;
}

/**
 * Đếm số câu trong một chương
 */
export async function countVersesInChapter(bookId: number, chapter: number): Promise<number> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM verse WHERE book_id = ? AND chapter = ?',
    args: [bookId, chapter],
  });
  const row = result.rows[0] as unknown as { count: number };
  return row?.count || 0;
}

/**
 * Tìm kiếm câu theo văn bản
 */
export async function searchVerses(searchText: string, limit: number = 20): Promise<Verse[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM verse WHERE text LIKE ? LIMIT ?',
    args: [`%${searchText}%`, limit],
  });
  return result.rows as unknown as Verse[];
}

/**
 * Alias cho countChaptersInBook (compatibility)
 */
export async function getChapterCount(bookId: number): Promise<number> {
  return countChaptersInBook(bookId);
}

/**
 * Lấy số câu của một chương (alias cho countVersesInChapter)
 */
export async function getVerseCount(bookId: number, chapter: number): Promise<number> {
  return countVersesInChapter(bookId, chapter);
}

/**
 * Lấy verses theo book, chapter, và verse range
 */
export async function getVerses(
  bookId: number,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): Promise<Verse[]> {
  if (verseStart !== undefined && verseEnd !== undefined) {
    return getVerseRange(bookId, chapter, verseStart, verseEnd);
  } else if (verseStart !== undefined) {
    const verse = await getVerse(bookId, chapter, verseStart);
    return verse ? [verse] : [];
  } else {
    return getVersesByChapter(bookId, chapter);
  }
}

/**
 * Lấy text từ verses (kết hợp thành một đoạn văn)
 */
export async function getVersesText(
  bookId: number,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): Promise<string> {
  const verses = await getVerses(bookId, chapter, verseStart, verseEnd);
  return verses.map(v => v.text).join(' ');
}
