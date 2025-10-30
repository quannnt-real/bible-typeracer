import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const DB_PATH = path.join(process.cwd(), 'server', 'db', 'VIE2010.sqlite');

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
 * Thực thi câu lệnh SQL và trả về kết quả dạng JSON
 */
export async function queryDatabase<T = any>(sql: string): Promise<T[]> {
  try {
    // Escape quotes trong SQL
    const escapedSql = sql.replace(/"/g, '\\"');
    
    // Sử dụng sqlite3 CLI với output mode JSON
    const command = `sqlite3 "${DB_PATH}" -json "${escapedSql}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('SQLite error:', stderr);
      return [];
    }
    
    if (!stdout.trim()) {
      return [];
    }
    
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
}

/**
 * Lấy tất cả sách trong Kinh Thánh
 */
export async function getAllBooks(): Promise<Book[]> {
  return queryDatabase<Book>('SELECT * FROM book ORDER BY id');
}

/**
 * Lấy số chapter của một sách
 */
export async function getChapterCount(bookId: number): Promise<number> {
  const result = await queryDatabase<{ max_chapter: number }>(
    `SELECT MAX(chapter) as max_chapter FROM verse WHERE book_id = ${bookId}`
  );
  return result[0]?.max_chapter || 0;
}

/**
 * Lấy số câu của một chương
 */
export async function getVerseCount(bookId: number, chapter: number): Promise<number> {
  const result = await queryDatabase<{ max_verse: number }>(
    `SELECT MAX(verse) as max_verse FROM verse WHERE book_id = ${bookId} AND chapter = ${chapter}`
  );
  return result[0]?.max_verse || 0;
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
  let sql = `SELECT * FROM verse WHERE book_id = ${bookId} AND chapter = ${chapter}`;
  
  if (verseStart !== undefined) {
    if (verseEnd !== undefined) {
      sql += ` AND verse >= ${verseStart} AND verse <= ${verseEnd}`;
    } else {
      sql += ` AND verse = ${verseStart}`;
    }
  }
  
  sql += ' ORDER BY verse';
  
  return queryDatabase<Verse>(sql);
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
