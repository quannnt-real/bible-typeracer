import { defineEventHandler } from 'h3'
import { pauseUserProgress } from '../../utils/user-progress-db';
import { getCurrentUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Lấy user hiện tại
    const user = await getCurrentUser(event);
    if (!user) {
      return "FALSE"; // Chỉ user đăng nhập mới được pause
    }

    await pauseUserProgress(user.id);
    return 'OK';
  } catch (error) {
    console.error('Error pausing progress:', error);
    return 'FALSE';
  }
})