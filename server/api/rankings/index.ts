import { defineEventHandler } from 'h3'
import { getTopRankings } from '../../utils/rankings-db';
 
export default defineEventHandler(async () => {
  try {
    const rankings = await getTopRankings(20);
    return rankings;
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }
})