import { defineEventHandler, readRawBody } from 'h3'
import { checkTypingHistory } from '../../utils/typing-history-db';
import { getCurrentUser } from '../../utils/auth';

type Body = {
  bookId: number;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event);
  if (!body) {
    return { exists: false, count: 0 };
  }

  const data: Body = JSON.parse(body);
  if (!data.bookId || !data.chapter) {
    return { exists: false, count: 0 };
  }

  try {
    // Lấy user hiện tại (nếu có)
    const user = await getCurrentUser(event);
    const userId = user?.id;

    const result = await checkTypingHistory(
      data.bookId,
      data.chapter,
      userId,
      data.verseStart,
      data.verseEnd
    );
    return result;
  } catch (error) {
    console.error('Error checking typing history:', error);
    return { exists: false, count: 0 };
  }
})
