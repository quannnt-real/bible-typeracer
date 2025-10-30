import { defineEventHandler, getQuery } from 'h3'
import { createKysely } from '@vercel/postgres-kysely';
import { Database } from '../../types/database';
import { sql } from 'kysely';
import { match } from 'ts-pattern';
import { getVersesText, getAllBooks } from '../../utils/sqlite';
 
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Nếu có tham số từ Bible, lấy text từ Bible
  if (query.source === 'bible') {
    return computeBibleResponse(query);
  }
  
  return match(process.env.NODE_ENV)
    .with('production', () => computeReponse())
    .otherwise(() => computeFakeResponse())
})

async function computeReponse() {
  const db = createKysely<Database>();
  const query = sql`SELECT content FROM texts ORDER BY RANDOM() LIMIT 1;`.compile(db)
  const { rows } = await db.executeQuery(query) as { rows: Array<{ content: string }> }
  
  return {
    text: rows[0].content as string,
  }
}

async function computeBibleResponse(query: any) {
  try {
    const bookId = parseInt(query.bookId as string);
    const chapter = parseInt(query.chapter as string);
    const verseStart = query.verseStart ? parseInt(query.verseStart as string) : undefined;
    const verseEnd = query.verseEnd ? parseInt(query.verseEnd as string) : undefined;
    
    const text = await getVersesText(bookId, chapter, verseStart, verseEnd);
    
    return { text };
  } catch (error) {
    console.error('Error getting Bible text:', error);
    return { text: "Lỗi khi lấy nội dung Kinh Thánh" };
  }
}

function computeFakeResponse() {
  return {
    text: "Bonjour comment allez-vous ce matin?"
  }
}
