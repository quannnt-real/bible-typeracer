import { getCurrentUser } from '../../utils/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const DB_PATH = path.join(process.cwd(), 'server', 'db', 'users.sqlite');

export default defineEventHandler(async (event) => {
  try {
    // Kiểm tra authentication
    const user = await getCurrentUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Xóa tất cả progress của user (cả active và paused)
    const sql = `DELETE FROM user_progress WHERE user_id = '${user.id}'`;
    const escapedSql = sql.replace(/"/g, '\\"');
    const command = `sqlite3 "${DB_PATH}" "${escapedSql}"`;
    
    await execAsync(command);

    return {
      success: true,
      message: 'All progress cleared'
    }
  } catch (error: any) {
    console.error('Error clearing progress:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Internal server error'
    })
  }
})