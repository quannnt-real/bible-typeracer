import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler((event) => {
  // Delete cookie
  deleteCookie(event, 'auth_token');

  return { success: true, message: 'Đăng xuất thành công' };
});
