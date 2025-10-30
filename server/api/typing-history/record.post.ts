import { defineEventHandler, readRawBody } from 'h3'
import { recordTypingHistory } from '../../utils/typing-history-db';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '../../utils/auth';

type Body = {
  bookId: number;
  chapter: number;
  textContent: string;
  verseStart?: number;
  verseEnd?: number;
}

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event);
  if (!body) {
    return "FALSE";
  }

  const data: Body = JSON.parse(body);
  if (!data.bookId || !data.chapter || !data.textContent) {
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
      data.textContent,
      userId,
      data.verseStart,
      data.verseEnd
    );
    return 'OK';
  } catch (error) {
    console.error('Error recording typing history:', error);
    return 'FALSE';
  }
})
