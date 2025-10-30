import { defineEventHandler } from 'h3';
import { getAllBooks } from '../../utils/sqlite';

export default defineEventHandler(async () => {
  try {
    const books = await getAllBooks();
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return { error: 'Failed to fetch books' };
  }
});
