import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const DB_PATH = path.join(process.cwd(), 'server', 'db', 'rankings.sqlite');
const MIGRATION_PATH = path.join(process.cwd(), 'server', 'migrations', '04-rankings.sql');

// Khởi tạo database nếu chưa tồn tại
async function initializeDatabase() {
  const dbDir = path.dirname(DB_PATH);
  
  // Tạo thư mục db nếu chưa tồn tại
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Kiểm tra xem database đã tồn tại chưa
  if (!fs.existsSync(DB_PATH)) {
    console.log('Creating rankings database...');
    
    // Đọc migration file
    const migrationSql = fs.readFileSync(MIGRATION_PATH, 'utf-8');
    
    // Thực thi migration
    const escapedSql = migrationSql.replace(/"/g, '\\"').replace(/\n/g, ' ');
    await execAsync(`sqlite3 "${DB_PATH}" "${escapedSql}"`);
    
    console.log('Rankings database created successfully');
  }
}

/**
 * Thực thi câu lệnh SQL và trả về kết quả dạng JSON
 */
async function queryRankingsDatabase<T = any>(sql: string): Promise<T[]> {
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
async function executeRankingsCommand(sql: string): Promise<void> {
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

export interface Ranking {
  id: string;
  nickname: string;
  score_wpm: number;
  user_id: string | null;
  created_at: string;
}

/**
 * Lấy top rankings (tất cả hoặc theo user)
 */
export async function getTopRankings(limit: number = 20, userId?: string): Promise<Ranking[]> {
  if (userId) {
    return queryRankingsDatabase<Ranking>(
      `SELECT * FROM rankings WHERE user_id = '${userId}' ORDER BY score_wpm DESC LIMIT ${limit}`
    );
  }
  return queryRankingsDatabase<Ranking>(
    `SELECT * FROM rankings ORDER BY score_wpm DESC LIMIT ${limit}`
  );
}

/**
 * Thêm ranking mới
 */
export async function insertRanking(
  id: string,
  nickname: string,
  scoreWpm: number,
  userId?: string
): Promise<void> {
  const userIdValue = userId ? `'${userId}'` : 'NULL';
  const sql = `INSERT INTO rankings(id, nickname, score_wpm, user_id) VALUES('${id}', '${nickname}', ${scoreWpm}, ${userIdValue})`;
  await executeRankingsCommand(sql);
}

/**
 * Lấy thống kê ranking
 */
export async function getRankingStats(): Promise<{
  total: number;
  average: number;
  highest: number;
}> {
  const result = await queryRankingsDatabase<{
    total: number;
    average: number;
    highest: number;
  }>(`
    SELECT 
      COUNT(*) as total,
      COALESCE(AVG(score_wpm), 0) as average,
      COALESCE(MAX(score_wpm), 0) as highest
    FROM rankings
  `);
  
  return result[0] || { total: 0, average: 0, highest: 0 };
}
