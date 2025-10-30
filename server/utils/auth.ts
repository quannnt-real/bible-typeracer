import { H3Event, getCookie } from 'h3';
import { verifyToken, getUserById, User } from './users-db';

export async function getCurrentUser(event: H3Event): Promise<User | null> {
  try {
    const token = getCookie(event, 'auth_token');
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await getUserById(decoded.userId);
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function requireAuth(event: H3Event): Promise<User> {
  const user = await getCurrentUser(event);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
