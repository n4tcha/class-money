const roleBadge = document.getElementById('role-badge');
const userEmailSpan = document.getElementById('user-email');
const welcomeText = document.getElementById('welcome-text');
const menuGrid = document.getElementById('menu-grid');
const logoutBtn = document.getElementById('logout-btn');

// เมนูที่แต่ละ role เห็นได้
const MENUS = {
  admin: [
    { title: 'จัดการผู้ใช้ทั้งหมด', desc: 'เพิ่ม/ลบ/เปลี่ยน role ผู้ใช้' },
    { title: 'จัดการข้อมูลระบบ', desc: 'ตั้งค่าระบบทั้งหมด' },
    { title: 'รายงานสรุป', desc: 'ดูรายงานทั้งหมดในระบบ' },
    { title: 'อัพโหลด/ดาวน์โหลดไฟล์', desc: 'จัดการไฟล์ทั้งหมด' },
  ],
  supervisor: [
    { title: 'ดูข้อมูลผู้ใช้', desc: 'ดูรายชื่อผู้ใช้ในทีม' },
    { title: 'รายงานสรุป', desc: 'ดูรายงานของทีม' },
    { title: 'อัพโหลด/ดาวน์โหลดไฟล์', desc: 'จัดการไฟล์ของทีม' },
  ],
  user: [
    { title: 'ข้อมูลของฉัน', desc: 'ดูและแก้ไขข้อมูลส่วนตัว' },
    { title: 'อัพโหลด/ดาวน์โหลดไฟล์', desc: 'จัดการไฟล์ของฉัน' },
  ],
};

async function loadDashboard() {
  // 1. เช็ค session ก่อน ถ้าไม่ได้ login ให้เด้งกลับหน้า login
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  const user = session.user;
  userEmailSpan.textContent = user.email;

  // 2. ดึง role จากตาราง profiles
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('ดึงข้อมูล profile ไม่สำเร็จ:', error);
    roleBadge.textContent = 'ไม่ทราบสิทธิ์';
    return;
  }

  const role = profile.role;

  // 3. แสดง role badge
  roleBadge.textContent = role.toUpperCase();
  roleBadge.classList.add(role);

  // 4. ข้อความต้อนรับ
  welcomeText.textContent = `ยินดีต้อนรับ${profile.full_name ? ', ' + profile.full_name : ''}`;

  // 5. สร้างเมนูตาม role
  renderMenu(role);
}

function renderMenu(role) {
  const menus = MENUS[role] || MENUS['user'];
  menuGrid.innerHTML = '';

  menus.forEach((menu) => {
    const item = document.createElement('div');
    item.className = 'menu-item';
    item.innerHTML = `<h3>${menu.title}</h3><p style="margin-top:8px; color:#94a3b8; font-size:14px;">${menu.desc}</p>`;
    menuGrid.appendChild(item);
  });
}

// ออกจากระบบ
logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
});

loadDashboard();
