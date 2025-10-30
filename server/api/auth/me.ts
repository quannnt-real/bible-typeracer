import { defineEventHandler, getCookie } from 'h3';
import { verifyToken, getUserById, toPublicUser } from '../../utils/users-db';

export default defineEventHandler(async (event) => {
  try {
    // Get token from cookie
    const token = getCookie(event, 'auth_token');

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return { success: false, error: 'Invalid token' };
    }

    // Get user
    const user = await getUserById(decoded.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user: toPublicUser(user)
    };
  } catch (error) {
    console.error('Me error:', error);
    return { success: false, error: 'Authentication failed' };
  }
});
