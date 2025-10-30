import { defineEventHandler, readRawBody } from 'h3'
import { recordTypingHistory } from '../../utils/typing-history-db';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '../../utils/auth';

type Body = {
  bookId: number;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  wpm?: number;
}

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event);
  if (!body) {
    return "FALSE";
  }

  const data: Body = JSON.parse(body);
  console.log('[TYPING-HISTORY] Received data:', data);
  console.log('[TYPING-HISTORY] WPM:', data.wpm);
  
  if (!data.bookId || !data.chapter) {
    return "FALSE";
  }

  try {
    // Lấy user hiện tại (nếu có)
    const user = await getCurrentUser(event);
    const userId = user?.id;

    await recordTypingHistory(
      randomUUID(),
      data.bookId,
      data.chapter,
      userId,
      data.verseStart,
      data.verseEnd,
      data.wpm
    );
    return 'OK';
  } catch (error) {
    console.error('Error recording typing history:', error);
    return 'FALSE';
  }
})
