import { getCurrentUser } from '../../utils/auth';
import { countActiveUserProgress } from '../../utils/user-progress-db';

export default defineEventHandler(async (event) => {
  try {
    // Lấy user hiện tại
    const user = await getCurrentUser(event);
    if (!user) {
      return { count: 0 }; // User chưa đăng nhập
    }

    const count = await countActiveUserProgress(user.id);
    return { count };
  } catch (error) {
    console.error('Error counting progress:', error);
    return { count: 0 };
  }
})