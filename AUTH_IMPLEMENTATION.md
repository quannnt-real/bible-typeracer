# Hệ thống Authentication - Implementation Guide

## ✅ Đã hoàn thành

### 1. Database & Migrations
- ✅ `server/migrations/06-users.sql` - Bảng users
- ✅ `server/migrations/04-rankings.sql` - Đã thêm user_id
- ✅ `server/migrations/05-typing-history.sql` - Đã thêm user_id

### 2. Backend Utilities
- ✅ `server/utils/users-db.ts` - CRUD cho users, hash password, JWT
- ✅ `server/utils/auth.ts` - Helper để get current user từ request

### 3. API Endpoints
- ✅ `POST /api/auth/register` - Đăng ký tài khoản mới
- ✅ `POST /api/auth/login` - Đăng nhập
- ✅ `POST /api/auth/logout` - Đăng xuất
- ✅ `GET /api/auth/me` - Lấy thông tin user hiện tại

## 🔄 Cần hoàn thành tiếp

### 4. Cập nhật API để sử dụng user_id

#### A. Update rankings-db.ts
Thêm parameter user_id vào các functions:
```typescript
export async function insertRanking(
  id: string,
  nickname: string,
  scoreWpm: number,
  userId?: string  // <- Thêm này
): Promise<void>

export async function getTopRankings(limit: number = 20, userId?: string): Promise<Ranking[]>
```

#### B. Update typing-history-db.ts
Thêm parameter user_id:
```typescript
export async function checkTypingHistory(
  bookId: number,
  chapter: number,
  userId?: string,  // <- Thêm này
  verseStart?: number,
  verseEnd?: number
): Promise<{ exists: boolean; count: number; history?: TypingHistory }>

export async function recordTypingHistory(
  id: string,
  bookId: number,
  chapter: number,
  textContent: string,
  userId?: string,  // <- Thêm này
  verseStart?: number,
  verseEnd?: number
): Promise<void>
```

#### C. Update API endpoints
- `server/api/rankings/new.post.ts` - Lấy user từ auth, lưu với user_id
- `server/api/rankings/index.ts` - Option để filter theo user
- `server/api/typing-history/check.post.ts` - Check theo user_id
- `server/api/typing-history/record.post.ts` - Record với user_id
- `server/api/typing-history/recent.ts` - Lấy history theo user_id

### 5. Frontend - Composables
Tạo `composables/useAuth.ts`:
```typescript
export const useAuth = () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (username, password) => { /* ... */ }
  const register = async (username, email, password) => { /* ... */ }
  const logout = async () => { /* ... */ }
  const fetchUser = async () => { /* ... */ }

  return { user, isAuthenticated, login, register, logout, fetchUser }
}
```

### 6. Frontend - Pages

#### A. `pages/login.vue`
```vue
<template>
  <div class="login-form">
    <h1>Đăng nhập</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Đăng nhập</button>
    </form>
    <NuxtLink to="/register">Chưa có tài khoản? Đăng ký</NuxtLink>
  </div>
</template>
```

#### B. `pages/register.vue`
```vue
<template>
  <div class="register-form">
    <h1>Đăng ký</h1>
    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="Username" />
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Đăng ký</button>
    </form>
    <NuxtLink to="/login">Đã có tài khoản? Đăng nhập</NuxtLink>
  </div>
</template>
```

### 7. Update Layout
Cập nhật `layouts/default.vue` để hiển thị:
- Tên user khi đã đăng nhập
- Nút Đăng xuất
- Link đến Đăng nhập/Đăng ký khi chưa đăng nhập

### 8. Middleware Protection
Tạo `middleware/auth.ts`:
```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, fetchUser } = useAuth()
  
  if (!user.value) {
    await fetchUser()
  }

  if (!user.value && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
})
```

### 9. Update pages/index.vue
- Check authentication trước khi bắt đầu game
- Lưu user_id khi lưu ranking và history
- Sử dụng user.id thay vì nickname

## Environment Variables
Tạo `.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Testing
```bash
# Đăng ký user mới
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Đăng nhập
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Check current user
curl http://localhost:3000/api/auth/me \
  --cookie "auth_token=YOUR_TOKEN"
```

## Security Notes
1. Luôn sử dụng HTTPS trong production
2. Set JWT_SECRET bằng một random string dài
3. HttpOnly cookies để tránh XSS
4. Validate input ở cả frontend và backend
5. Rate limiting cho login/register endpoints

## Next Steps
1. Cập nhật các API để sử dụng user_id (Bước 4)
2. Tạo frontend components (Bước 5, 6, 7)
3. Thêm middleware protection (Bước 8)
4. Update pages/index.vue (Bước 9)
5. Testing toàn bộ flow
6. Deploy với environment variables
