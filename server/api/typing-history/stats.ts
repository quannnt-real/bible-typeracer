import { defineEventHandler } from 'h3'
import { getTypingHistoryStats } from '../../utils/typing-history-db';

export default defineEventHandler(async () => {
  try {
    const stats = await getTypingHistoryStats();
    return stats;
  } catch (error) {
    console.error('Error fetching typing history stats:', error);
    return { totalTexts: 0, totalTypings: 0 };
  }
})
