import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const execAsync = promisify(exec);

const DB_PATH = path.join(process.cwd(), 'server', 'db', 'users.sqlite');
const MIGRATION_PATH = path.join(process.cwd(), 'server', 'migrations', '06-users.sql');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const SALT_ROUNDS = 10;

// Khởi tạo database nếu chưa tồn tại
async function initializeDatabase() {
  const dbDir = path.dirname(DB_PATH);
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  if (!fs.existsSync(DB_PATH)) {
    console.log('Creating users database...');
    const migrationSql = fs.readFileSync(MIGRATION_PATH, 'utf-8');
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
    
    // Escape backslashes, double quotes, và $ để tránh shell interpretation
    const escapedSql = sql.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
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
 * Thực thi câu lệnh SQL không trả về kết quả
 */
async function executeUsersCommand(sql: string): Promise<void> {
  try {
    await initializeDatabase();
    
    // Escape backslashes và double quotes cho shell, sau đó escape $ để tránh variable expansion
    const escapedSql = sql.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
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

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  color: string;
  created_at: string;
}

/**
 * Lấy user theo username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const escapedUsername = username.replace(/'/g, "''");
  const result = await queryUsersDatabase<User>(
    `SELECT * FROM users WHERE LOWER(username) = LOWER('${escapedUsername}') LIMIT 1`
  );
  return result[0] || null;
}

/**
 * Lấy user theo email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const escapedEmail = email.replace(/'/g, "''");
  const result = await queryUsersDatabase<User>(
    `SELECT * FROM users WHERE email = '${escapedEmail}' LIMIT 1`
  );
  return result[0] || null;
}

/**
 * Lấy user theo ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const escapedId = id.replace(/'/g, "''");
  const result = await queryUsersDatabase<User>(
    `SELECT * FROM users WHERE id = '${escapedId}' LIMIT 1`
  );
  return result[0] || null;
}

/**
 * Tạo user mới
 */
export async function createUser(
  id: string,
  username: string,
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Escape strings (password hash không cần escape vì bcrypt hash chỉ chứa base64 chars)
  const escapedUsername = username.replace(/'/g, "''");
  const escapedEmail = email.replace(/'/g, "''");
  const escapedDisplayName = displayName ? displayName.replace(/'/g, "''") : null;
  
  const displayNameValue = escapedDisplayName ? `'${escapedDisplayName}'` : 'NULL';
  
  const sql = `INSERT INTO users(id, username, email, password_hash, display_name)
               VALUES('${id}', '${escapedUsername}', '${escapedEmail}', '${passwordHash}', ${displayNameValue})`;
  
  await executeUsersCommand(sql);
  
  const user = await getUserById(id);
  if (!user) {
    throw new Error('Failed to create user');
  }
  
  return user;
}

/**
 * Xác thực password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Tạo JWT token
 */
export function generateToken(userId: string, username: string): string {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Cập nhật profile user
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    display_name?: string;
    avatar_url?: string;
    color?: string;
  }
): Promise<UserPublic | null> {
  const escapedUserId = userId.replace(/'/g, "''");
  const setParts: string[] = [];
  
  if (updates.display_name !== undefined) {
    const escaped = updates.display_name.replace(/'/g, "''");
    setParts.push(`display_name = '${escaped}'`);
  }
  
  if (updates.avatar_url !== undefined) {
    const escaped = updates.avatar_url.replace(/'/g, "''");
    setParts.push(`avatar_url = '${escaped}'`);
  }
  
  if (updates.color !== undefined) {
    const escaped = updates.color.replace(/'/g, "''");
    setParts.push(`color = '${escaped}'`);
  }
  
  if (setParts.length === 0) {
    const user = await getUserById(userId);
    return user ? toPublicUser(user) : null;
  }
  
  setParts.push(`updated_at = CURRENT_TIMESTAMP`);
  
  const sql = `UPDATE users SET ${setParts.join(', ')} WHERE id = '${escapedUserId}'`;
  await executeUsersCommand(sql);
  
  const user = await getUserById(userId);
  return user ? toPublicUser(user) : null;
}

/**
 * Cập nhật mật khẩu (không cần mật khẩu cũ, dùng khi đã đăng nhập)
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const escapedUserId = userId.replace(/'/g, "''");
  
  const sql = `UPDATE users SET password_hash = '${newPasswordHash}', updated_at = CURRENT_TIMESTAMP WHERE id = '${escapedUserId}'`;
  await executeUsersCommand(sql);
}

/**
 * Chuyển User sang UserPublic (bỏ password_hash)
 */
export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    color: user.color,
    created_at: user.created_at
  };
}
