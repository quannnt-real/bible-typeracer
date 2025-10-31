import { getCurrentUser } from '../../utils/auth';
import { deleteUserProgress } from '../../utils/user-progress-db';

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

    const body = await readBody(event);
    const { progressId } = body;

    if (!progressId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing progressId'
      })
    }

    // Xóa progress
    await deleteUserProgress(user.id, progressId);

    return {
      success: true,
      message: 'Progress deleted'
    }
  } catch (error: any) {
    console.error('Error deleting progress:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Internal server error'
    })
  }
})