// =========================================================
// auth.js — หน้า login แบบ 2 ขั้น
//   ขั้นที่ 1: ใส่ username -> ถามฐานข้อมูลว่าเป็นผู้ใช้ประเภทไหน (rpc check_username)
//     - user        -> เข้าระบบทันที (ดูอย่างเดียว)
//     - admin / sup -> ไปขั้นที่ 2
//   ขั้นที่ 2: ใส่ password -> ตรวจกับ Supabase Auth
// =========================================================

const formTitle = document.getElementById('form-title');
const messageBox = document.getElementById('message');
const loginHint = document.getElementById('login-hint');

const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username');
const usernameBtn = document.getElementById('username-btn');

const passwordForm = document.getElementById('password-form');
const passwordInput = document.getElementById('password');
const passwordBtn = document.getElementById('password-btn');
const usernameHidden = document.getElementById('username-hidden');
const chipUsername = document.getElementById('chip-username');
const chipRole = document.getElementById('chip-role');
const changeUserLink = document.getElementById('change-user-link');

// ข้อมูลบัญชี admin/sup ที่กำลังรอใส่รหัสผ่าน
let pendingStaff = null;

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.style.display = 'block';
}

function hideMessage() {
  messageBox.style.display = 'none';
}

function setBusy(button, busy, idleText) {
  button.disabled = busy;
  button.textContent = busy ? 'กำลังตรวจสอบ...' : idleText;
}

function goToDashboard(delay = 600) {
  setTimeout(() => { window.location.href = 'dashboard.html'; }, delay);
}

function showUsernameStep() {
  pendingStaff = null;
  passwordForm.style.display = 'none';
  usernameForm.style.display = 'flex';
  formTitle.textContent = 'เข้าสู่ระบบ';
  loginHint.style.display = 'block';
  passwordInput.value = '';
  hideMessage();
  usernameInput.focus();
  usernameInput.select();
}

function showPasswordStep(info) {
  pendingStaff = info;
  chipUsername.textContent = info.username;
  chipRole.textContent = ROLE_LABEL[info.role] || info.role;
  usernameHidden.value = info.username;
  usernameForm.style.display = 'none';
  passwordForm.style.display = 'flex';
  formTitle.textContent = 'ยืนยันรหัสผ่าน';
  loginHint.style.display = 'none';
  hideMessage();
  passwordInput.focus();
}

// ถ้า login ค้างไว้อยู่แล้ว -> ไปหน้าหลักเลย
(async function checkExistingLogin() {
  const user = await getCurrentUser();
  if (user) window.location.replace('dashboard.html');
})();

// ---------- ขั้นที่ 1: ตรวจ username ----------
usernameForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();

  const username = usernameInput.value.trim();
  if (!username) return;

  setBusy(usernameBtn, true, 'ถัดไป');
  try {
    const { data, error } = await supabaseClient.rpc('check_username', { p_username: username });
    if (error) throw error;

    if (!data || !data.found) {
      showMessage('ไม่พบชื่อผู้ใช้นี้ในระบบ', 'error');
      usernameInput.select();
      return;
    }

    if (data.needs_password) {
      if (!data.email) {
        showMessage('บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ', 'error');
        return;
      }
      showPasswordStep(data);
      return;
    }

    // user ทั่วไป: ไม่ต้องใส่รหัสผ่าน เข้าระบบได้ทันที
    await supabaseClient.auth.signOut();   // ล้าง session admin/sup ที่อาจค้างอยู่
    saveViewer({ username: data.username });
    showMessage(`ยินดีต้อนรับ ${data.full_name || data.username} (ดูข้อมูลได้อย่างเดียว)`, 'success');
    goToDashboard();
  } catch (err) {
    console.error(err);
    showMessage('เชื่อมต่อฐานข้อมูลไม่สำเร็จ: ' + err.message, 'error');
  } finally {
    setBusy(usernameBtn, false, 'ถัดไป');
  }
});

// ---------- ขั้นที่ 2: ตรวจ password (admin / sup) ----------
passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();
  if (!pendingStaff) return showUsernameStep();

  setBusy(passwordBtn, true, 'เข้าสู่ระบบ');
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: pendingStaff.email,
      password: passwordInput.value,
    });
    if (error) throw error;

    // ยืนยันซ้ำจากฐานข้อมูลว่ายังเป็น admin/sup จริง
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, full_name')
      .eq('auth_user_id', data.user.id)
      .single();

    if (profileError || !profile || !['admin', 'sup'].includes(profile.role)) {
      await supabaseClient.auth.signOut();
      throw new Error('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล');
    }

    clearViewer();
    showMessage(`เข้าสู่ระบบสำเร็จ สวัสดี ${profile.full_name || pendingStaff.username}`, 'success');
    goToDashboard();
  } catch (err) {
    console.error(err);
    showMessage(translateError(err.message), 'error');
    passwordInput.select();
  } finally {
    setBusy(passwordBtn, false, 'เข้าสู่ระบบ');
  }
});

changeUserLink.addEventListener('click', (e) => {
  e.preventDefault();
  showUsernameStep();
});

// แปล error message ที่พบบ่อยเป็นภาษาไทย
function translateError(msg) {
  const map = {
    'Invalid login credentials': 'รหัสผ่านไม่ถูกต้อง',
    'Email not confirmed': 'บัญชียังไม่ได้ยืนยันอีเมล กรุณาติดต่อผู้ดูแลระบบ',
  };
  return map[msg] || msg;
}
