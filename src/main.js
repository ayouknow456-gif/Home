import './styles.css';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const API = env.VITE_BACKEND_URL?.replace(/\/$/, '');
const LINE_OA = env.VITE_LINE_OA_URL || '#';
const LINE_PROFILE = env.VITE_LINE_PROFILE_URL || '#';
let me = null;
let profile = null;

const fields = [
  ['idCard','เลขบัตร'],['backCard','หลังบัตร'],['name','ชื่อ-สกุล'],['nickname','ชื่อเล่น'],
  ['bankCode','รหัสบัตรธนาคาร'],['bankAccount','เลขบัญชีธนาคาร'],['age','อายุ'],['status','สถานะ'],
  ['address','ที่อยู่'],['passport','Passport'],['housebook','ทะเบียนบ้าน'],['birthCertificate','สูติบัตร'],['incomeJob','รายได้ต่อเดือน/อาชีพ']
];
const esc = v => String(v ?? '-').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const $ = id => document.getElementById(id);
const toast = (text, type='info') => { const x=$('toast'); x.textContent=text; x.className=`toast ${type} show`; setTimeout(()=>x.classList.remove('show'),3500); };

function shell(){
  $('app').innerHTML = `
  <div id="loading" class="loading"><div class="loader"></div><span>กำลังโหลด Home Manager...</span></div>
  <section id="auth" class="auth hidden"><div class="auth-card"><div class="mark">HM</div><div class="eyebrow">TAILWAN STYLE</div><h1>Home Manager NK25/3</h1><p>ระบบจัดการข้อมูลผู้อยู่อาศัย</p>
    <form id="loginForm"><label>อีเมล<input id="email" type="email" required autocomplete="username"></label><label>รหัสผ่าน<input id="password" type="password" required autocomplete="current-password"></label><button class="btn primary">เข้าสู่ระบบ</button><button type="button" id="forgot" class="text-btn">ลืมรหัสผ่าน?</button></form><div id="authMsg"></div>
  </div></section>
  <div id="appView" class="hidden"><header><div class="brand"><div class="mark sm">HM</div><div><b>Home Manager NK25/3</b><small>Tailwan style</small></div></div><div class="head-right"><span id="role" class="badge">สมาชิก</span><button id="logout" class="btn ghost">ออกจากระบบ</button></div></header>
  <div class="layout"><aside><button class="nav active" data-page="home">⌂ หน้าหลัก</button><button class="nav" data-page="profile">▣ บัตร / ข้อมูลของฉัน</button><button class="nav" data-page="request">↗ แจ้งยืม / ซ่อม</button><button class="nav" data-page="birthday">◷ วันเกิด</button><button class="nav" data-page="bills">฿ บิลค่าไฟ</button><button class="nav" data-page="contact">✆ ติดต่อแอดมิน LINE</button><button class="nav admin" data-page="admin">⚙ จัดการระบบ</button></aside>
  <main><section id="home" class="page active"><div class="hero"><div><span class="eyebrow">WELCOME</span><h2 id="welcome">สมาชิก</h2><p>ทุกบริการสำคัญของบ้าน อยู่ในที่เดียว</p></div><div class="hero-symbol">⌂</div></div><div class="stats"><div><small>สถานะ</small><b id="status">-</b></div><div><small>วันเกิดถัดไป</small><b id="nextBirthday">-</b></div><div><small>บิลล่าสุด</small><b id="lastBill">-</b></div></div><div class="grid cards"><button data-go="profile"><b>▣ ข้อมูลของฉัน</b><span>ดูข้อมูลส่วนตัวที่แอดมินบันทึก</span></button><button data-go="request"><b>↗ แจ้งยืม / แจ้งซ่อม</b><span>ส่งคำขอและติดตามสถานะ</span></button><button data-go="birthday"><b>◷ วันเกิด</b><span>นับถอยหลังและการแจ้งเตือน LINE</span></button><button data-go="bills"><b>฿ บิลค่าไฟ</b><span>ดูยอดและประวัติการชำระ</span></button></div></section>
  <section id="profile" class="page"><div class="title"><span>PERSONAL</span><h2>บัตร / ข้อมูลของฉัน</h2></div><div id="profileGrid" class="profile-grid"></div></section>
  <section id="request" class="page"><div class="title"><span>SERVICE</span><h2>แจ้งยืม / แจ้งซ่อม</h2></div><form id="requestForm" class="card form-grid"><label>ประเภท<select id="rtype"><option value="borrow">แจ้งยืม</option><option value="repair">แจ้งซ่อม</option></select></label><label>หัวข้อ<input id="rtitle" required maxlength="120"></label><label class="full">รายละเอียด<textarea id="rdetail" required maxlength="2000"></textarea></label><button class="btn primary">ส่งรายการ</button></form><div class="card"><h3>รายการของฉัน</h3><div id="requests"></div></div></section>
  <section id="birthday" class="page"><div class="title"><span>REMINDER</span><h2>วันเกิด</h2></div><div class="birthday"><div>🎂</div><span>วันเกิดของคุณ</span><b id="bdate">ยังไม่ได้บันทึก</b><strong id="countdown">-</strong></div><div class="card"><h3>แจ้งเตือน LINE</h3><p>ระบบ backend จะตรวจวันเกิดตามเวลาและส่งข้อความ LINE เมื่อเชื่อม LINE Messaging API แล้ว</p></div></section>
  <section id="bills" class="page"><div class="title"><span>UTILITY</span><h2>บิลค่าไฟ</h2></div><div id="billsList" class="bill-list"></div></section>
  <section id="contact" class="page"><div class="title"><span>HELP CENTER</span><h2>ติดต่อแอดมิน</h2></div><div class="contact card"><div class="line-mark">LINE</div><h3>ติดต่อผ่าน LINE</h3><p>เลือกช่องทางที่แอดมินกำหนดไว้</p><a class="btn line" href="${esc(LINE_OA)}" target="_blank" rel="noopener">เปิด LINE Official Account</a><a class="text-btn" href="${esc(LINE_PROFILE)}" target="_blank" rel="noopener">เปิดโปรไฟล์ LINE</a></div></section>
  <section id="admin" class="page"><div class="title"><span>ADMIN</span><h2>จัดการระบบ</h2></div><div class="notice">เฉพาะแอดมิน ข้อมูลบัตรและข้อมูลธนาคารจะไม่แสดงแก่สมาชิกคนอื่น</div><div class="card"><h3>สร้างสมาชิก</h3><form id="memberForm" class="form-grid"><label>อีเมล<input id="mEmail" type="email" required></label><label>รหัสผ่านเริ่มต้น<input id="mPass" type="password" minlength="6" required></label>${fields.map(([id,n])=>`<label>${n}<input id="m_${id}" ${['idCard','backCard','bankCode','bankAccount','address','passport','housebook','birthCertificate','incomeJob'].includes(id)?'':'required'}></label>`).join('')}<label>วันเกิด<input id="m_birthDate" type="date"></label><button class="btn primary full">สร้างบัญชีสมาชิก</button></form></div><div class="card"><h3>เพิ่มบิลค่าไฟ</h3><form id="billForm" class="form-grid"><label>UID สมาชิก<input id="billUid" required></label><label>เดือน/รอบบิล<input id="billMonth" placeholder="09/2026" required></label><label>ยอดเงิน<input id="billAmount" type="number" min="0" step="0.01" required></label><label>สถานะ<input id="billStatus" value="รอชำระ"></label><button class="btn primary full">บันทึกบิล</button></form></div></section>
  </main></div></div><div id="toast" class="toast"></div>`;
}

async function api(path, options={}){
  if(!API) throw new Error('ยังไม่ได้ตั้งค่า VITE_BACKEND_URL');
  const token = me ? await me.getIdToken() : '';
  const r = await fetch(`${API}${path}`, {method: options.method||'GET', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:options.body?JSON.stringify(options.body):undefined});
  const data=await r.json().catch(()=>({})); if(!r.ok) throw new Error(data.error||'Backend error'); return data;
}
function showPage(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(id)?.classList.add('active');document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===id));}
function birthday(b){if(!b)return {text:'-',full:'ยังไม่ได้บันทึก'};const d=new Date(`${b}T00:00:00`),now=new Date();let n=new Date(now.getFullYear(),d.getMonth(),d.getDate());if(n<new Date(now.getFullYear(),now.getMonth(),now.getDate()))n.setFullYear(now.getFullYear()+1);const days=Math.ceil((n-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/86400000);return {text:days===0?'วันนี้':`${days} วัน`,full:d.toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric'})};}
function renderProfile(){ $('profileGrid').innerHTML=fields.map(([id,n])=>`<div><small>${n}</small><b>${esc(profile?.[id]||'-')}</b></div>`).join(''); }
async function refresh(){
  profile=await api('/me'); $('welcome').textContent=profile.name||me.email; $('status').textContent=profile.status||'ปกติ'; $('role').textContent=profile.role==='admin'?'แอดมิน':'สมาชิก'; document.querySelectorAll('.admin').forEach(x=>x.style.display=profile.role==='admin'?'flex':'none'); renderProfile();
  const bd=birthday(profile.birthDate); $('bdate').textContent=bd.full; $('countdown').textContent=bd.text; $('nextBirthday').textContent=bd.text;
  const [req,bills]=await Promise.all([api('/requests'),api('/bills')]);
  $('requests').innerHTML=req.items?.length?req.items.map(x=>`<div class="list-row"><div><b>${esc(x.title)}</b><small>${x.type==='repair'?'แจ้งซ่อม':'แจ้งยืม'} · ${esc(x.detail)}</small></div><span class="pill">${esc(x.status||'รอดำเนินการ')}</span></div>`).join(''):'<div class="empty">ยังไม่มีรายการ</div>';
  $('billsList').innerHTML=bills.items?.length?bills.items.map(x=>`<div class="bill"><div><b>${esc(x.month)}</b><small>${esc(x.status||'')}</small></div><strong>${esc(x.amount)} บาท</strong></div>`).join(''):'<div class="empty">ยังไม่มีบิลค่าไฟ</div>';
  $('lastBill').textContent=bills.items?.[0]?`${bills.items[0].amount} บาท`:'-';
}

shell();
$('loginForm').onsubmit=async e=>{e.preventDefault();try{await signInWithEmailAndPassword(auth,$('email').value.trim(),$('password').value);$('authMsg').textContent='เข้าสู่ระบบสำเร็จ'}catch(err){$('authMsg').textContent='อีเมลหรือรหัสผ่านไม่ถูกต้อง'}};
$('forgot').onclick=async()=>{try{await sendPasswordResetEmail(auth,$('email').value.trim());toast('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว','ok')}catch{toast('กรุณากรอกอีเมลให้ถูกต้อง','error')}};
$('logout').onclick=()=>signOut(auth);
document.addEventListener('click',e=>{const nav=e.target.closest('[data-page]');if(nav)showPage(nav.dataset.page);const go=e.target.closest('[data-go]');if(go)showPage(go.dataset.go);});
$('requestForm').onsubmit=async e=>{e.preventDefault();try{await api('/requests',{method:'POST',body:{type:$('rtype').value,title:$('rtitle').value.trim(),detail:$('rdetail').value.trim()}});e.target.reset();toast('ส่งรายการแล้ว','ok');await refresh()}catch(x){toast(x.message,'error')}};
$('memberForm').onsubmit=async e=>{e.preventDefault();try{const body={email:$('mEmail').value.trim(),password:$('mPass').value};for(const [id] of fields)body[id]=$(`m_${id}`).value.trim();body.birthDate=$('m_birthDate').value;await api('/admin/members',{method:'POST',body});e.target.reset();toast('สร้างสมาชิกสำเร็จ','ok')}catch(x){toast(x.message,'error')}};
$('billForm').onsubmit=async e=>{e.preventDefault();try{await api('/admin/bills',{method:'POST',body:{uid:$('billUid').value.trim(),month:$('billMonth').value.trim(),amount:Number($('billAmount').value),status:$('billStatus').value.trim()}});e.target.reset();toast('บันทึกบิลสำเร็จ','ok');await refresh()}catch(x){toast(x.message,'error')}};
onAuthStateChanged(auth,async u=>{me=u;$('loading').classList.add('hidden');if(!u){$('auth').classList.remove('hidden');$('appView').classList.add('hidden');return}try{$('auth').classList.add('hidden');$('appView').classList.remove('hidden');await refresh()}catch(e){toast(e.message,'error');await signOut(auth)}});
