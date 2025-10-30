import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const DB_PATH = path.join(process.cwd(), 'server', 'db', 'typing-history.sqlite');
const MIGRATION_PATH = path.join(process.cwd(), 'server', 'migrations', '05-typing-history.sql');

// Khởi tạo database nếu chưa tồn tại
async function initializeDatabase() {
  const dbDir = path.dirname(DB_PATH);
  
  // Tạo thư mục db nếu chưa tồn tại
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Kiểm tra xem database đã tồn tại chưa
  if (!fs.existsSync(DB_PATH)) {
    console.log('Creating typing history database...');
    
    // Đọc migration file
    const migrationSql = fs.readFileSync(MIGRATION_PATH, 'utf-8');
    
    // Thực thi migration
    const escapedSql = migrationSql.replace(/"/g, '\\"').replace(/\n/g, ' ');
    await execAsync(`sqlite3 "${DB_PATH}" "${escapedSql}"`);
    
    console.log('Typing history database created successfully');
  }
}

/**
 * Thực thi câu lệnh SQL và trả về kết quả dạng JSON
 */
export async function queryTypingHistoryDatabase<T = any>(sql: string): Promise<T[]> {
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
async function executeTypingHistoryCommand(sql: string): Promise<void> {
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

export interface TypingHistory {
  id: string;
  book_id: number;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  text_content: string;
  times_typed: number;
  user_id: string | null;
  last_typed_at: string;
  created_at: string;
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
  let sql = `SELECT * FROM typing_history WHERE book_id = ${bookId} AND chapter = ${chapter}`;
  
  // Filter by user_id if provided
  if (userId) {
    sql += ` AND user_id = '${userId}'`;
  } else {
    sql += ` AND user_id IS NULL`;
  }
  
  if (verseStart !== undefined && verseStart !== null) {
    sql += ` AND verse_start = ${verseStart}`;
    if (verseEnd !== undefined && verseEnd !== null) {
      sql += ` AND verse_end = ${verseEnd}`;
    } else {
      sql += ` AND verse_end IS NULL`;
    }
  } else {
    sql += ` AND verse_start IS NULL AND verse_end IS NULL`;
  }
  
  const result = await queryTypingHistoryDatabase<TypingHistory>(sql);
  
  if (result.length > 0) {
    return {
      exists: true,
      count: result[0].times_typed,
      history: result[0]
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
  textContent: string,
  userId?: string,
  verseStart?: number,
  verseEnd?: number
): Promise<void> {
  // Kiểm tra xem đã tồn tại chưa
  const existing = await checkTypingHistory(bookId, chapter, userId, verseStart, verseEnd);
  
  if (existing.exists && existing.history) {
    // Cập nhật số lần gõ
    const sql = `UPDATE typing_history 
                 SET times_typed = ${existing.count + 1}, 
                     last_typed_at = datetime('now')
                 WHERE id = '${existing.history.id}'`;
    await executeTypingHistoryCommand(sql);
  } else {
    // Thêm mới
    const verseStartValue = verseStart !== undefined && verseStart !== null ? verseStart : 'NULL';
    const verseEndValue = verseEnd !== undefined && verseEnd !== null ? verseEnd : 'NULL';
    const userIdValue = userId ? `'${userId}'` : 'NULL';
    const escapedText = textContent.replace(/'/g, "''");
    
    const sql = `INSERT INTO typing_history(id, book_id, chapter, verse_start, verse_end, text_content, times_typed, user_id)
                 VALUES('${id}', ${bookId}, ${chapter}, ${verseStartValue}, ${verseEndValue}, '${escapedText}', 1, ${userIdValue})`;
    await executeTypingHistoryCommand(sql);
  }
}

/**
 * Lấy lịch sử gõ gần đây (tất cả hoặc theo user)
 */
export async function getRecentTypingHistory(limit: number = 10, userId?: string): Promise<TypingHistory[]> {
  if (userId) {
    return queryTypingHistoryDatabase<TypingHistory>(
      `SELECT * FROM typing_history WHERE user_id = '${userId}' ORDER BY last_typed_at DESC LIMIT ${limit}`
    );
  }
  return queryTypingHistoryDatabase<TypingHistory>(
    `SELECT * FROM typing_history ORDER BY last_typed_at DESC LIMIT ${limit}`
  );
}

/**
 * Lấy thống kê lịch sử gõ
 */
export async function getTypingHistoryStats(): Promise<{
  totalTexts: number;
  totalTypings: number;
  mostTypedText?: TypingHistory;
}> {
  const statsResult = await queryTypingHistoryDatabase<{
    total_texts: number;
    total_typings: number;
  }>(`
    SELECT 
      COUNT(*) as total_texts,
      SUM(times_typed) as total_typings
    FROM typing_history
  `);
  
  const mostTypedResult = await queryTypingHistoryDatabase<TypingHistory>(
    `SELECT * FROM typing_history ORDER BY times_typed DESC LIMIT 1`
  );
  
  return {
    totalTexts: statsResult[0]?.total_texts || 0,
    totalTypings: statsResult[0]?.total_typings || 0,
    mostTypedText: mostTypedResult[0]
  };
}
