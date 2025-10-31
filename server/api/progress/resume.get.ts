import { defineEventHandler } from 'h3'
import { getActiveUserProgress } from '../../utils/user-progress-db';
import { getCurrentUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Lấy user hiện tại
    const user = await getCurrentUser(event);
    console.log('[RESUME] User authenticated:', !!user, user?.id);
    if (!user) {
      console.log('[RESUME] No user found');
      return { progress: [] }; // Trả về array rỗng
    }

    const progresses = await getActiveUserProgress(user.id);
    console.log('[RESUME] Found progresses:', progresses.length);
    console.log('[RESUME] Sample progress:', progresses[0]); // Debug log
    return { progress: progresses };
  } catch (error) {
    console.error('[RESUME] Error getting progress:', error);
    return { error: 'Không thể tải tiến độ' };
  }
})