# Deploy to Vercel - Hướng dẫn chi tiết

## ✅ Đã hoàn thành

### 1. Chuyển đổi Database sang Turso
- ✅ Install Turso CLI
- ✅ Create Turso account và database
- ✅ Import dữ liệu Bible (VIE2010.sqlite)
- ✅ Setup schema cho users, rankings, typing_history, user_progress
- ✅ Update code để sử dụng Turso SDK (@libsql/client)
- ✅ Replace tất cả database utilities (SQLite CLI → Turso client)

### 2. Cấu hình Project
- ✅ Install bcryptjs thay thế bcrypt
- ✅ Cấu hình `.env` với Turso credentials
- ✅ Update `nuxt.config.ts` với Turso runtime config
- ✅ Test build thành công

## 🚀 Các bước tiếp theo: Deploy lên Vercel

### Bước 1: Push code lên GitHub

```bash
# Đảm bảo bạn đã commit mọi thay đổi
git add .
git commit -m "feat: migrate to Turso database for Vercel deployment"
git push origin master
```

### Bước 2: Tạo tài khoản Vercel

1. Truy cập https://vercel.com/signup
2. Đăng nhập bằng GitHub account
3. Authorize Vercel truy cập GitHub repositories

### Bước 3: Import Project vào Vercel

1. Click **"Add New..."** → **"Project"**
2. Chọn repository: `bible-typeracer` (quannnt-real/bible-typeracer)
3. Click **"Import"**

### Bước 4: Cấu hình Environment Variables

Trong màn hình **Configure Project**, thêm các Environment Variables:

```
TURSO_DATABASE_URL=libsql://bible-typeracer-quannnt-real.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjIwMTc1ODAsImlkIjoiNjlhZjc2NDgtNDE0Ny00NDljLTk4YTctYjNiZmNkOWQ3ZjU2IiwicmlkIjoiZDVjOWJiOGQtMmM2Yi00YjM2LWI2ZWYtNTdkM2EwNzFiYTQwIn0.mhnKqGOo703zcd6tTXMQgQltyoBMkY7ahRMDp1SuGjJlEqjTsEgvOPNpO2Lg61O_WmWC25-b0XnDSVXhrBtEAA
JWT_SECRET=your-strong-random-secret-key-change-this
NODE_ENV=production
```

**Lưu ý:** Nên tạo JWT_SECRET mới và mạnh hơn cho production.

### Bước 5: Deploy

1. Click **"Deploy"**
2. Đợi Vercel build và deploy (khoảng 1-3 phút)
3. Sau khi deploy xong, bạn sẽ nhận được URL: `https://bible-typeracer.vercel.app` (hoặc tương tự)

### Bước 6: Setup Custom Domain (Tùy chọn)

Nếu bạn muốn dùng subdomain từ Azdigi:

1. Trong Vercel project settings → **Domains**
2. Add domain: `bible.htnguonsong.com`
3. Vercel sẽ cung cấp DNS records
4. Vào Azdigi → DNS Management → Thêm CNAME record:
   ```
   Type: CNAME
   Name: bible
   Value: cname.vercel-dns.com
   ```

### Bước 7: Test Website

1. Truy cập URL được deploy
2. Test các chức năng:
   - ✅ Login/Register
   - ✅ Typing game
   - ✅ Rankings
   - ✅ History
   - ✅ Profile management

## 📊 Thông tin Database

### Turso Database Info
- **Database Name:** bible-typeracer
- **Region:** aws-ap-northeast-1 (Singapore)
- **URL:** libsql://bible-typeracer-quannnt-real.aws-ap-northeast-1.turso.io

### Turso CLI Commands

```bash
# View database info
turso db show bible-typeracer

# Open SQL shell
turso db shell bible-typeracer

# List all tables
turso db shell bible-typeracer ".tables"

# Create new auth token (nếu cần)
turso db tokens create bible-typeracer

# View database list
turso db list
```

## 🔧 Troubleshooting

### 1. Build Failed
- Check Environment Variables đã được set chưa
- Verify Turso URL và Token còn hợp lệ không
- Check build logs trong Vercel dashboard

### 2. Database Connection Error
- Verify TURSO_AUTH_TOKEN chưa hết hạn
- Tạo token mới nếu cần: `turso db tokens create bible-typeracer`
- Update Environment Variable trong Vercel settings

### 3. Authentication Issues
- Check JWT_SECRET đã được set trong Environment Variables
- Verify bcryptjs được cài đúng trong package.json

## 📝 Notes

- Turso free tier: 9GB storage, 1 billion row reads/month
- Vercel free tier: Unlimited deployments, 100GB bandwidth/month
- Auto-deploy khi push code lên GitHub
- Database được host ở Singapore (low latency cho VN)

## 🎉 Done!

Sau khi hoàn thành các bước trên, website của bạn sẽ được deploy lên Vercel với:
- ✅ Full SSR capabilities
- ✅ Cloud database (Turso)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Zero configuration

Giờ bạn có thể chia sẻ link website với mọi người! 🚀
