import { getTursoClient } from './turso';

export interface UserProgress {
  id: string;
  user_id: string;
  book_id: number;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  current_word_index: number;
  typed_text: string;
  progress_percentage: number;
  text_length: number;
  status: 'active' | 'paused' | 'completed';
  start_time: string;
  last_updated: string;
  total_time_spent: number;
  created_at: string;
  updated_at: string;
}

/**
 * Lưu tiến độ gõ
 */
export async function saveUserProgress(
  id: string,
  userId: string,
  bookId: number,
  chapter: number,
  verseStart?: number,
  verseEnd?: number,
  currentWordIndex: number = 0,
  typedText: string = '',
  progressPercentage: number = 0,
  textLength: number = 0,
  status: 'active' | 'paused' | 'completed' = 'active',
  startTime?: string,
  totalTimeSpent: number = 0
): Promise<void> {
  const client = getTursoClient();

  // Kiểm tra xem đã có progress cho đoạn này chưa
  const existingProgresses = await getActiveUserProgress(userId);
  const existing = existingProgresses.find(p => 
    p.book_id === bookId && 
    p.chapter === chapter && 
    p.verse_start === verseStart && 
    p.verse_end === verseEnd
  );

  if (existing) {
    // Update existing progress
    await client.execute({
      sql: `UPDATE user_progress
            SET current_word_index = ?,
                typed_text = ?,
                progress_percentage = ?,
                text_length = ?,
                status = ?,
                last_updated = datetime('now'),
                total_time_spent = ?,
                updated_at = datetime('now')
            WHERE id = ?`,
      args: [currentWordIndex, typedText, progressPercentage, textLength, status, totalTimeSpent, existing.id],
    });
  } else {
    // Create new progress
    await client.execute({
      sql: `INSERT INTO user_progress(id, user_id, book_id, chapter, verse_start, verse_end, current_word_index, typed_text, progress_percentage, text_length, status, start_time, total_time_spent)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), ?)`,
      args: [id, userId, bookId, chapter, verseStart || null, verseEnd || null, currentWordIndex, typedText, progressPercentage, textLength, status, startTime || null, totalTimeSpent],
    });
  }
}

/**
 * Lấy tất cả tiến độ active/paused của user (tối đa 5)
 */
export async function getActiveUserProgress(userId: string): Promise<UserProgress[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `SELECT * FROM user_progress WHERE user_id = ? AND status IN ('active', 'paused') ORDER BY last_updated DESC LIMIT 5`,
    args: [userId],
  });
  return result.rows as unknown as UserProgress[];
}

/**
 * Đếm số progress active/paused của user
 */
export async function countActiveUserProgress(userId: string): Promise<number> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND status IN ('active', 'paused')`,
    args: [userId],
  });
  const row = result.rows[0] as unknown as { count: number };
  return row?.count || 0;
}

/**
 * Lấy tất cả tiến độ của user
 */
export async function getUserProgressHistory(userId: string, limit: number = 10): Promise<UserProgress[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `SELECT * FROM user_progress WHERE user_id = ? ORDER BY last_updated DESC LIMIT ?`,
    args: [userId, limit],
  });
  return result.rows as unknown as UserProgress[];
}

/**
 * Tạm dừng tiến độ
 */
export async function pauseUserProgress(userId: string): Promise<void> {
  const client = getTursoClient();
  await client.execute({
    sql: `UPDATE user_progress
          SET status = 'paused',
              last_updated = datetime('now'),
              updated_at = datetime('now')
          WHERE user_id = ? AND status = 'active'`,
    args: [userId],
  });
}

/**
 * Xóa progress theo ID
 */
export async function deleteUserProgress(userId: string, progressId: string): Promise<void> {
  const client = getTursoClient();
  await client.execute({
    sql: `DELETE FROM user_progress WHERE user_id = ? AND id = ?`,
    args: [userId, progressId],
  });
}

/**
 * Xóa progress theo selection (khi hoàn thành)
 */
export async function deleteUserProgressBySelection(
  userId: string,
  bookId: number,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): Promise<void> {
  const client = getTursoClient();
  
  let sql = `DELETE FROM user_progress WHERE user_id = ? AND book_id = ? AND chapter = ?`;
  const args: any[] = [userId, bookId, chapter];
  
  if (verseStart !== undefined && verseStart !== null) {
    sql += ` AND verse_start = ?`;
    args.push(verseStart);
  } else {
    sql += ` AND verse_start IS NULL`;
  }
  
  if (verseEnd !== undefined && verseEnd !== null) {
    sql += ` AND verse_end = ?`;
    args.push(verseEnd);
  } else {
    sql += ` AND verse_end IS NULL`;
  }
  
  await client.execute({ sql, args });
}
