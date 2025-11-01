import { getTursoClient } from './turso';

export interface TypingHistory {
  id: string;
  book_id: number;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  times_typed: number;
  user_id: string | null;
  last_typed_at: string;
  created_at: string;
  best_wpm: number;
}

/**
 * Query helper for typing_history table
 */
export async function queryTypingHistoryDatabase<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const client = getTursoClient();
  const result = await client.execute({ sql, args });
  return result.rows as unknown as T[];
}

/**
 * Kiểm tra xem đoạn văn đã được gõ bao nhiêu lần (theo user)
 */
export async function checkTypingHistory(
  bookId: number,
  chapter: number,
  userId?: string,
  verseStart?: number,
  verseEnd?: number
): Promise<{ exists: boolean; count: number; history?: TypingHistory }> {
  const client = getTursoClient();
  
  let sql = 'SELECT * FROM typing_history WHERE book_id = ? AND chapter = ?';
  const args: any[] = [bookId, chapter];
  
  // Filter by user_id
  if (userId) {
    sql += ' AND user_id = ?';
    args.push(userId);
  } else {
    sql += ' AND user_id IS NULL';
  }
  
  // Filter by verse range
  if (verseStart !== undefined && verseStart !== null) {
    sql += ' AND verse_start = ?';
    args.push(verseStart);
    if (verseEnd !== undefined && verseEnd !== null) {
      sql += ' AND verse_end = ?';
      args.push(verseEnd);
    } else {
      sql += ' AND verse_end IS NULL';
    }
  } else {
    sql += ' AND verse_start IS NULL AND verse_end IS NULL';
  }
  
  const result = await client.execute({ sql, args });
  const history = result.rows[0] as unknown as TypingHistory;
  
  if (history) {
    return {
      exists: true,
      count: history.times_typed,
      history
    };
  }
  
  return { exists: false, count: 0 };
}

/**
 * Thêm hoặc cập nhật lịch sử gõ
 */
export async function recordTypingHistory(
  id: string,
  bookId: number,
  chapter: number,
  userId?: string,
  verseStart?: number,
  verseEnd?: number,
  wpm?: number
): Promise<void> {
  const client = getTursoClient();
  
  // Kiểm tra xem đã tồn tại chưa
  const existing = await checkTypingHistory(bookId, chapter, userId, verseStart, verseEnd);
  
  if (existing.exists && existing.history) {
    // Cập nhật
    const currentBestWpm = existing.history.best_wpm || 0;
    const newBestWpm = wpm && wpm > currentBestWpm ? wpm : currentBestWpm;
    
    await client.execute({
      sql: `UPDATE typing_history 
            SET times_typed = ?, 
                last_typed_at = datetime('now'),
                best_wpm = ?
            WHERE id = ?`,
      args: [existing.count + 1, newBestWpm, existing.history.id],
    });
  } else {
    // Thêm mới
    await client.execute({
      sql: `INSERT INTO typing_history(id, book_id, chapter, verse_start, verse_end, times_typed, user_id, best_wpm)
            VALUES(?, ?, ?, ?, ?, 1, ?, ?)`,
      args: [id, bookId, chapter, verseStart || null, verseEnd || null, userId || null, wpm || 0],
    });
  }
}

/**
 * Lấy lịch sử gõ gần đây
 */
export async function getRecentTypingHistory(limit: number = 10, userId?: string): Promise<TypingHistory[]> {
  const client = getTursoClient();
  
  if (userId) {
    const result = await client.execute({
      sql: 'SELECT * FROM typing_history WHERE user_id = ? ORDER BY last_typed_at DESC LIMIT ?',
      args: [userId, limit],
    });
    return result.rows as unknown as TypingHistory[];
  }
  
  const result = await client.execute({
    sql: 'SELECT * FROM typing_history ORDER BY last_typed_at DESC LIMIT ?',
    args: [limit],
  });
  return result.rows as unknown as TypingHistory[];
}

/**
 * Lấy thống kê lịch sử gõ
 */
export async function getTypingHistoryStats(): Promise<{
  totalTexts: number;
  totalTypings: number;
  mostTypedText?: TypingHistory;
}> {
  const client = getTursoClient();
  
  const statsResult = await client.execute(`
    SELECT 
      COUNT(*) as total_texts,
      SUM(times_typed) as total_typings
    FROM typing_history
  `);
  
  const mostTypedResult = await client.execute(
    'SELECT * FROM typing_history ORDER BY times_typed DESC LIMIT 1'
  );
  
  const stats = statsResult.rows[0] as unknown as { total_texts: number; total_typings: number };
  const mostTyped = mostTypedResult.rows[0] as unknown as TypingHistory;
  
  return {
    totalTexts: stats?.total_texts || 0,
    totalTypings: stats?.total_typings || 0,
    mostTypedText: mostTyped
  };
}
