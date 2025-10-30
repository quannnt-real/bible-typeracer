import { defineEventHandler, readRawBody, setCookie } from 'h3';
import { randomUUID } from 'crypto';
import { createUser, getUserByUsername, getUserByEmail, toPublicUser, generateToken } from '../../utils/users-db';

type RegisterBody = {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readRawBody(event);
    if (!body) {
      return { success: false, error: 'No body provided' };
    }

    const data: RegisterBody = JSON.parse(body);

    // Validate input
    if (!data.username || !data.email || !data.password) {
      return { success: false, error: 'Username, email và password là bắt buộc' };
    }

    if (data.password.length < 6) {
      return { success: false, error: 'Password phải có ít nhất 6 ký tự' };
    }

    // Check if username exists
    const existingUsername = await getUserByUsername(data.username);
    if (existingUsername) {
      return { success: false, error: 'Username đã tồn tại' };
    }

    // Check if email exists
    const existingEmail = await getUserByEmail(data.email);
    if (existingEmail) {
      return { success: false, error: 'Email đã tồn tại' };
    }

    // Create user
    const user = await createUser(
      randomUUID(),
      data.username,
      data.email,
      data.password,
      data.displayName
    );

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
    console.error('Register error:', error);
    return { success: false, error: 'Đã xảy ra lỗi khi đăng ký' };
  }
});
