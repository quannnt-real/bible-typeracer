import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getTursoClient } from './turso';

const SALT_ROUNDS = 10;

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  color: string;
  car: string;
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
  car: string;
  created_at: string;
}

/**
 * Lấy user theo username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
    args: [username],
  });
  
  return (result.rows[0] as unknown as User) || null;
}

/**
 * Lấy user theo email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ? LIMIT 1',
    args: [email],
  });
  
  return (result.rows[0] as unknown as User) || null;
}

/**
 * Lấy user theo ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
    args: [id],
  });
  
  return (result.rows[0] as unknown as User) || null;
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
  
  const client = getTursoClient();
  await client.execute({
    sql: `INSERT INTO users(id, username, email, password_hash, display_name)
          VALUES(?, ?, ?, ?, ?)`,
    args: [id, username, email, passwordHash, displayName || null],
  });
  
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
  const config = useRuntimeConfig();
  return jwt.sign(
    { userId, username },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    const config = useRuntimeConfig();
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; username: string };
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
    car?: string;
  }
): Promise<UserPublic | null> {
  const setParts: string[] = [];
  const args: any[] = [];
  
  if (updates.display_name !== undefined) {
    setParts.push('display_name = ?');
    args.push(updates.display_name);
  }
  
  if (updates.avatar_url !== undefined) {
    setParts.push('avatar_url = ?');
    args.push(updates.avatar_url);
  }
  
  if (updates.car !== undefined) {
    setParts.push('car = ?');
    args.push(updates.car);
  }
  
  if (setParts.length === 0) {
    const user = await getUserById(userId);
    return user ? toPublicUser(user) : null;
  }
  
  setParts.push('updated_at = CURRENT_TIMESTAMP');
  args.push(userId);
  
  const client = getTursoClient();
  await client.execute({
    sql: `UPDATE users SET ${setParts.join(', ')} WHERE id = ?`,
    args,
  });
  
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
  
  const client = getTursoClient();
  await client.execute({
    sql: 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    args: [newPasswordHash, userId],
  });
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
    car: user.car,
    created_at: user.created_at
  };
}
