// =========================================================
// dashboard.js — หน้าหลัก (โหลดต่อจาก supabaseClient.js และ session.js)
// =========================================================

const STUDENTS_PAGE_URL = 'students.html';

const ROLE_GREETING = {
  admin: 'สวัสดีค่ะ ผู้ดูแลระบบ',
  sup: 'สวัสดีค่ะ หัวหน้างาน',
  user: 'สวัสดีค่ะ',
};

async function loadDashboard() {
  const user = await requireLogin();
  if (!user) return;

  renderUserBox(user);

  document.getElementById('greeting-title').textContent =
    `${ROLE_GREETING[user.role] || 'สวัสดีค่ะ'} คุณ${user.fullName}`;

  document.getElementById('greeting-sub').textContent = user.canEdit
    ? 'ระบบจัดการการเก็บเงินภายในห้องเรียน'
    : 'ระบบจัดการการเก็บเงินภายในห้องเรียน · คุณดูข้อมูลได้อย่างเดียว';

  // ทุกคนเปิดหน้ารายชื่อนักเรียนได้ (user ทั่วไปจะเห็นแบบอ่านอย่างเดียว)
  document.getElementById('nav-students').onclick = () => {
    window.location.href = STUDENTS_PAGE_URL;
  };
}

loadDashboard();
