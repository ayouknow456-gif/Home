# Home Manager NK25/3

ระบบจัดการข้อมูลผู้อยู่อาศัย โดยใช้ **Firebase Authentication + Google Sheets + Google Apps Script + LINE Messaging API**

> Tailwan.. เป็นเพียงแนวทางสไตล์ UI ไม่ใช่ชื่อแบรนด์ของระบบ

## ฟังก์ชัน
- เข้าสู่ระบบด้วย Firebase Authentication
- แอดมินเป็นผู้สร้างบัญชีสมาชิกเท่านั้น
- ข้อมูลสมาชิก 13 รายการตามที่กำหนด โดยช่องที่ระบุว่าไม่จำเป็นไม่บังคับกรอก
- แจ้งยืม / แจ้งซ่อม และแจ้งเตือน LINE ของแอดมิน
- นับถอยหลังวันเกิด และส่งข้อความวันเกิดผ่าน LINE
- สมาชิกดูข้อมูลของตัวเองเท่านั้น
- ดูบิลค่าไฟของตัวเอง
- ติดต่อแอดมินผ่าน LINE OA / โปรไฟล์ LINE
- Google Sheet แยกชีต Members, Requests, Bills

## Environment ฝั่งเว็บ
คัดลอก `.env.example` เป็น `.env` แล้วใส่ค่าเอง:
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_BACKEND_URL`, `VITE_LINE_OA_URL`, `VITE_LINE_PROFILE_URL`

## Script Properties ฝั่ง Google Apps Script
ใส่ใน Project Settings > Script Properties เท่านั้น:
- `FIREBASE_WEB_API_KEY`
- `ADMIN_EMAIL`
- `SHEET_ID`
- `ADMIN_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `ADMIN_LINE_USER_ID`
- `LINE_WEBHOOK_SECRET`

**ห้ามใส่รหัสผ่านแอดมิน, LINE token หรือ secret ลง GitHub**

## Google Sheet
สร้าง Google Sheet 1 ไฟล์ แล้วนำ ID ไปใส่ `SHEET_ID` ระบบจะสร้าง `Members`, `Requests`, `Bills` อัตโนมัติ

## Google Apps Script
1. สร้าง Apps Script project
2. นำ `backend/Code.gs` ไปวาง
3. ตั้ง Script Properties
4. Deploy > New deployment > Web app
5. Execute as: Me
6. ตั้งสิทธิ์เข้าถึงตามนโยบายของโปรเจกต์
7. นำ URL `/exec` ไปใส่ `VITE_BACKEND_URL`

## LINE
ตั้ง Webhook ไปที่ Web App URL พร้อม query secret:
`WEB_APP_URL?hook=LINE_WEBHOOK_SECRET`

สร้าง Time-driven trigger ให้เรียก `birthdayReminder` วันละครั้งเพื่อแจ้งวันเกิดอัตโนมัติ

## Firebase Authentication
เปิด Email/Password ใน Firebase Authentication และสร้างบัญชีแอดมิน 1 บัญชีตาม `ADMIN_EMAIL` จากนั้นแอดมินจึงสร้างสมาชิกจากหน้าเว็บได้

## ความปลอดภัย
ข้อมูลบัตร ข้อมูลธนาคาร ที่อยู่ และเอกสารเป็นข้อมูลอ่อนไหว ควรจำกัดสิทธิ์ Google Sheet / Apps Script / Firebase เฉพาะผู้ดูแลที่จำเป็น และไม่เปิด Sheet ให้สมาชิกทั่วไป

## รันในเครื่อง
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

`Hosting = none` ตามที่กำหนด จึงยังไม่มีการ deploy เว็บไซต์จริง แต่ source และ backend template อยู่ใน repo พร้อมตั้งค่า ENV ภายหลัง
