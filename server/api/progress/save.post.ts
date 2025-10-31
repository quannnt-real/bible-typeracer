import { defineEventHandler, readRawBody } from 'h3'
import { saveUserProgress } from '../../utils/user-progress-db';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '../../utils/auth';

type Body = {
  bookId: number;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  currentWordIndex: number;
  typedText: string;
  progressPercentage?: number;
  textLength?: number;
  status?: 'active' | 'paused' | 'completed';
  startTime?: string;
  totalTimeSpent: number;
}

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  if (!body) {
    return "FALSE"
  }

  const data: Body = JSON.parse(body);
  if (!data.bookId || !data.chapter || data.currentWordIndex === undefined) {
    return "FALSE";
  }

  try {
    // Lấy user hiện tại
    const user = await getCurrentUser(event);
    if (!user) {
      return "FALSE"; // Chỉ user đăng nhập mới được lưu progress
    }

    await saveUserProgress(
      randomUUID(),
      user.id,
      data.bookId,
      data.chapter,
      data.verseStart,
      data.verseEnd,
      data.currentWordIndex,
      data.typedText || '',
      data.progressPercentage || 0,
      data.textLength || 0,
      data.status || 'active',
      data.startTime,
      data.totalTimeSpent || 0
    );
    return 'OK';
  } catch (error) {
    console.error('Error saving progress:', error);
    return 'FALSE';
  }
})