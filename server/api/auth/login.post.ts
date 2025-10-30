import { defineEventHandler, readRawBody, setCookie } from 'h3';
import { getUserByUsername, verifyPassword, toPublicUser, generateToken } from '../../utils/users-db';

type LoginBody = {
  username: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readRawBody(event);
    if (!body) {
      return { success: false, error: 'No body provided' };
    }

    const data: LoginBody = JSON.parse(body);

    // Validate input
    if (!data.username || !data.password) {
      return { success: false, error: 'Username và password là bắt buộc' };
    }

    // Get user
    const user = await getUserByUsername(data.username);
    console.log('[LOGIN] User found:', !!user);
    if (!user) {
      return { success: false, error: 'Username hoặc password không đúng' };
    }

    // Verify password
    console.log('[LOGIN] Password hash from DB:', user.password_hash);
    console.log('[LOGIN] Password hash length:', user.password_hash?.length);
    console.log('[LOGIN] Password hash starts with $2b$:', user.password_hash?.startsWith('$2b$'));
    
    const isValid = await verifyPassword(data.password, user.password_hash);
    console.log('[LOGIN] Password valid:', isValid);
    
    if (!isValid) {
      return { success: false, error: 'Username hoặc password không đúng' };
    }

    // Generate token
    const token = generateToken(user.id, user.username);

    // Set cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return {
      success: true,
      user: toPublicUser(user),
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Đã xảy ra lỗi khi đăng nhập' };
  }
});
