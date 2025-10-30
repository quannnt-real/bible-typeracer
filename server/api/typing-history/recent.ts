import { defineEventHandler } from 'h3'
import { getRecentTypingHistory } from '../../utils/typing-history-db';
import { getCurrentUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // Lấy user hiện tại (nếu có)
    const user = await getCurrentUser(event);
    const userId = user?.id;

    const history = await getRecentTypingHistory(20, userId);
    return history;
  } catch (error) {
    console.error('Error fetching typing history:', error);
    return [];
  }
})
