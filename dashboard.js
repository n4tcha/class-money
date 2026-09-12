const logoutBtn = document.getElementById('logout-btn');
const userNameLabel = document.getElementById('user-name-label');
const greetingTitle = document.getElementById('greeting-title');

// คำทักทายที่แตกต่างกันตาม role เพื่อความเป็นกันเอง
const ROLE_GREETING_PREFIX = {
  admin: 'สวัสดีค่ะ ผู้ดูแลระบบ',
  supervisor: 'สวัสดีค่ะ หัวหน้างาน',
  user: 'สวัสดีค่ะ',
};

async function loadDashboard() {
  // 1. เช็ค session ก่อน ถ้าไม่ได้ login ให้เด้งกลับหน้า login
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  const user = session.user;

  // 2. ดึง full_name และ role จากตาราง profiles
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('ดึงข้อมูล profile ไม่สำเร็จ:', error);
    userNameLabel.textContent = user.email;
    greetingTitle.textContent = 'สวัสดีค่ะ';
    return;
  }

  // ใช้ full_name ถ้ามี ไม่งั้น fallback เป็น email
  const displayName = profile.full_name || user.email;

  // 3. แสดงชื่อที่ topbar มุมขวาบน
  userNameLabel.textContent = displayName;

  // 4. แสดงคำทักทายหลัก ใช้ full_name จริงจากฐานข้อมูลแทนคำว่า "ผู้ดูแล"
  greetingTitle.textContent = profile.full_name
    ? `สวัสดีค่ะ คุณ${profile.full_name}`
    : 'สวัสดีค่ะ';
}

// ออกจากระบบ
logoutBtn.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
});

loadDashboard();
