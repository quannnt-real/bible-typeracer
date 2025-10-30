import { defineEventHandler, readRawBody } from 'h3'
import { insertRanking } from '../../utils/rankings-db';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '../../utils/auth';
 
type Body = {
  nickname: string;
  score_wpm: number;
}

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  if (!body) {
    return "FALSE"
  }

  const data = JSON.parse(body);
  if (!data.nickname || !data.score_wpm) {
    return "FALSE";
  }

  try {
    // Lấy user hiện tại (nếu có)
    const user = await getCurrentUser(event);
    const userId = user?.id;

    await insertRanking(randomUUID(), data.nickname, data.score_wpm, userId);
    return 'OK';
  } catch (error) {
    console.error('Error inserting ranking:', error);
    return 'FALSE';
  }
})