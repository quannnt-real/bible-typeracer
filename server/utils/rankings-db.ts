import { getTursoClient } from './turso';

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
  const client = getTursoClient();
  
  if (userId) {
    const result = await client.execute({
      sql: 'SELECT * FROM rankings WHERE user_id = ? ORDER BY score_wpm DESC LIMIT ?',
      args: [userId, limit],
    });
    return result.rows as unknown as Ranking[];
  }
  
  const result = await client.execute({
    sql: 'SELECT * FROM rankings ORDER BY score_wpm DESC LIMIT ?',
    args: [limit],
  });
  return result.rows as unknown as Ranking[];
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
  const client = getTursoClient();
  await client.execute({
    sql: 'INSERT INTO rankings(id, nickname, score_wpm, user_id) VALUES(?, ?, ?, ?)',
    args: [id, nickname, scoreWpm, userId || null],
  });
}

/**
 * Lấy thống kê ranking
 */
export async function getRankingStats(): Promise<{
  total: number;
  average: number;
  highest: number;
}> {
  const client = getTursoClient();
  const result = await client.execute(`
    SELECT 
      COUNT(*) as total,
      COALESCE(AVG(score_wpm), 0) as average,
      COALESCE(MAX(score_wpm), 0) as highest
    FROM rankings
  `);
  
  const row = result.rows[0] as unknown as { total: number; average: number; highest: number };
  return row || { total: 0, average: 0, highest: 0 };
}
