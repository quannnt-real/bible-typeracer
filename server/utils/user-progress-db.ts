import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const DB_PATH = path.join(process.cwd(), 'server', 'db', 'users.sqlite');
const MIGRATION_PATH = path.join(process.cwd(), 'server', 'migrations', '10-create-user-progress.sql');

// Khởi tạo database nếu chưa tồn tại
async function initializeDatabase() {
  const dbDir = path.dirname(DB_PATH);

  // Tạo thư mục db nếu chưa tồn tại
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Kiểm tra xem database đã tồn tại chưa
  if (!fs.existsSync(DB_PATH)) {
    console.log('Creating users database...');

    // Đọc migration file
    const migrationSql = fs.readFileSync(MIGRATION_PATH, 'utf-8');

    // Thực thi migration
    const escapedSql = migrationSql.replace(/"/g, '\\"').replace(/\n/g, ' ');
    await execAsync(`sqlite3 "${DB_PATH}" "${escapedSql}"`);

    console.log('Users database created successfully');
  }
}

/**
 * Thực thi câu lệnh SQL và trả về kết quả dạng JSON
 */
async function queryUsersDatabase<T = any>(sql: string): Promise<T[]> {
  try {
    await initializeDatabase();

    const escapedSql = sql.replace(/"/g, '\\"');
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
 * Thực thi câu lệnh SQL không trả về kết quả (INSERT, UPDATE, DELETE)
 */
async function executeUsersCommand(sql: string): Promise<void> {
  try {
    await initializeDatabase();

    const escapedSql = sql.replace(/"/g, '\\"');
    const command = `sqlite3 "${DB_PATH}" "${escapedSql}"`;

    const { stderr } = await execAsync(command);

    if (stderr) {
      console.error('SQLite error:', stderr);
      throw new Error(stderr);
    }
  } catch (error) {
    console.error('Database command error:', error);
    throw error;
  }
}

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
  const verseStartValue = verseStart !== undefined && verseStart !== null ? verseStart : 'NULL';
  const verseEndValue = verseEnd !== undefined && verseEnd !== null ? verseEnd : 'NULL';
  const startTimeValue = startTime ? `'${startTime}'` : 'datetime("now")';
  const escapedText = typedText.replace(/'/g, "''");

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
    const sql = `UPDATE user_progress
                 SET current_word_index = ${currentWordIndex},
                     typed_text = '${escapedText}',
                     progress_percentage = ${progressPercentage},
                     text_length = ${textLength},
                     status = '${status}',
                     last_updated = datetime('now'),
                     total_time_spent = ${totalTimeSpent},
                     updated_at = datetime('now')
                 WHERE id = '${existing.id}'`;
    await executeUsersCommand(sql);
  } else {
    // Create new progress
    const sql = `INSERT INTO user_progress(id, user_id, book_id, chapter, verse_start, verse_end, current_word_index, typed_text, progress_percentage, text_length, status, start_time, total_time_spent)
                 VALUES('${id}', '${userId}', ${bookId}, ${chapter}, ${verseStartValue}, ${verseEndValue}, ${currentWordIndex}, '${escapedText}', ${progressPercentage}, ${textLength}, '${status}', ${startTimeValue}, ${totalTimeSpent})`;
    await executeUsersCommand(sql);
  }
}

/**
 * Lấy tất cả tiến độ active/paused của user (tối đa 5)
 */
export async function getActiveUserProgress(userId: string): Promise<UserProgress[]> {
  const result = await queryUsersDatabase<UserProgress>(
    `SELECT * FROM user_progress WHERE user_id = '${userId}' AND status IN ('active', 'paused') ORDER BY last_updated DESC LIMIT 5`
  );
  return result;
}

/**
 * Đếm số progress active/paused của user
 */
export async function countActiveUserProgress(userId: string): Promise<number> {
  const result = await queryUsersDatabase<{ count: number }>(
    `SELECT COUNT(*) as count FROM user_progress WHERE user_id = '${userId}' AND status IN ('active', 'paused')`
  );
  return result[0]?.count || 0;
}

/**
 * Lấy tất cả tiến độ của user
 */
export async function getUserProgressHistory(userId: string, limit: number = 10): Promise<UserProgress[]> {
  return queryUsersDatabase<UserProgress>(
    `SELECT * FROM user_progress WHERE user_id = '${userId}' ORDER BY last_updated DESC LIMIT ${limit}`
  );
}

/**
 * Tạm dừng tiến độ
 */
export async function pauseUserProgress(userId: string): Promise<void> {
  const sql = `UPDATE user_progress
               SET status = 'paused',
                   last_updated = datetime('now'),
                   updated_at = datetime('now')
               WHERE user_id = '${userId}' AND status = 'active'`;
  await executeUsersCommand(sql);
}

/**
 * Xóa progress theo ID
 */
export async function deleteUserProgress(userId: string, progressId: string): Promise<void> {
  const sql = `DELETE FROM user_progress WHERE user_id = '${userId}' AND id = '${progressId}'`;
  await executeUsersCommand(sql);
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
  let sql = `DELETE FROM user_progress WHERE user_id = '${userId}' AND book_id = ${bookId} AND chapter = ${chapter}`;
  
  if (verseStart !== undefined && verseStart !== null) {
    sql += ` AND verse_start = ${verseStart}`;
  }
  
  if (verseEnd !== undefined && verseEnd !== null) {
    sql += ` AND verse_end = ${verseEnd}`;
  }
  
  await executeUsersCommand(sql);
}