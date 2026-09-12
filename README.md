# ระบบ Login 3 ระดับ (Admin / Supervisor / User)

## วิธี Deploy บน GitHub Pages

### ขั้นตอนที่ 1: ใส่ Supabase credentials
เปิดไฟล์ `supabaseClient.js` แล้วแก้บรรทัด:
```js
const SUPABASE_ANON_KEY = 'ใส่_ANON_KEY_ของคุณตรงนี้';
```
หาค่า anon key ได้จาก Supabase Dashboard → Project Settings → API → "anon public" key

### ขั้นตอนที่ 2: Push ขึ้น GitHub
```bash
git init
git add .
git commit -m "Initial login system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### ขั้นตอนที่ 3: เปิดใช้งาน GitHub Pages
1. ไปที่ repo บน GitHub → Settings → Pages
2. Source: เลือก branch `main`, folder `/ (root)`
3. กด Save
4. รอ 1-2 นาที จะได้ URL แบบ `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### ขั้นตอนที่ 4: อนุญาต URL ใน Supabase
สำคัญมาก! ไปที่ Supabase Dashboard → Authentication → URL Configuration
- Site URL: ใส่ URL ของ GitHub Pages เช่น `https://YOUR_USERNAME.github.io/YOUR_REPO/`
- Redirect URLs: เพิ่ม URL เดียวกัน

ถ้าไม่ทำขั้นตอนนี้ อาจมีปัญหาเรื่อง CORS หรือ redirect ไม่ถูกต้อง

## ไฟล์ทั้งหมด
- `index.html` — หน้า login/สมัครสมาชิก
- `dashboard.html` — หน้าหลังล็อกอิน แสดงเมนูตาม role
- `auth.js` — logic การ login/signup
- `dashboard.js` — logic ดึง role และแสดงเมนู
- `supabaseClient.js` — การตั้งค่าเชื่อมต่อ Supabase
- `style.css` — สไตล์หน้าเว็บ
