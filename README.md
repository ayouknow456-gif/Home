# Home Manager NK25/3

Tailwan.. — ระบบจัดการข้อมูลผู้อยู่อาศัย

## สิ่งที่สร้างแล้ว
- หน้า Login ด้วย Firebase Authentication
- Dashboard แบบ Responsive
- โปรไฟล์/ข้อมูลส่วนตัวของสมาชิก
- แจ้งยืม / แจ้งซ่อม และติดตามรายการของตัวเอง
- วันเกิดและตัวนับถอยหลัง
- บิลค่าไฟจาก Firestore
- หน้าติดต่อแอดมินผ่าน LINE
- หน้าจัดการสมาชิกสำหรับ Admin
- Firestore Security Rules แยกสิทธิ์สมาชิก/แอดมิน

## Firebase
โปรเจกต์ที่เชื่อมต่อคือ `home-8e824` และฐานข้อมูลเดิมไม่ได้ถูกลบ

เปิด Firebase Authentication → Sign-in method → Email/Password เพื่อเปิดการเข้าสู่ระบบ

นำ `firestore.rules` ไปใช้ใน Firebase Console เพื่อบังคับสิทธิ์การอ่าน/เขียนข้อมูล

## การสร้างสมาชิกโดย Admin
หน้าเว็บเตรียมฟอร์มและตรวจสิทธิ์ Admin แล้ว แต่การสร้าง Firebase Authentication user ให้สมาชิกใหม่โดยไม่ทำให้ Admin หลุดจากระบบต้องใช้ Backend ที่มี Firebase Admin SDK เช่น Cloud Functions หรือเซิร์ฟเวอร์ที่ปลอดภัย

ตั้งค่า URL ของ Backend ใน `app2.js` ตัวแปร `BACKEND_URL` หลังจากสร้าง Backend แล้วเท่านั้น

## LINE
LINE Webhook และการแจ้งเตือนวันเกิดต้องทำงานฝั่ง Backend ไม่ควรใส่ Channel Secret/Access Token ไว้ใน GitHub Pages หรือ JavaScript ฝั่งผู้ใช้

## ข้อมูลสำคัญ
ข้อมูลเลขบัตร เลขบัญชีธนาคาร Passport ทะเบียนบ้าน และสูติบัตรเป็นข้อมูลอ่อนไหวมาก ควรเก็บด้วยสิทธิ์เข้าถึงแบบจำกัด และควรเก็บไฟล์เอกสารใน Firebase Storage พร้อม Storage Rules ที่เข้มงวด
