// =========================================================
// session.js — ใช้ร่วมกันทุกหน้า (โหลดต่อจาก supabaseClient.js)
//   admin / sup : login ด้วยรหัสผ่านผ่าน Supabase Auth
//   user        : ไม่มีรหัสผ่าน เก็บ username ไว้ใน localStorage แล้วตรวจกับฐานข้อมูลทุกครั้งที่เปิดหน้า
// =========================================================

const VIEWER_STORAGE_KEY = 'classmoney.viewer';

const ROLE_LABEL = {
  admin: 'ผู้ดูแลระบบ',
  sup: 'หัวหน้างาน',
  user: 'ผู้ใช้ทั่วไป',
};

function readViewer() {
  try {
    const raw = localStorage.getItem(VIEWER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveViewer(viewer) {
  try {
    localStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(viewer));
  } catch {
    /* โหมดส่วนตัวบางเบราว์เซอร์เขียนไม่ได้ */
  }
}

function clearViewer() {
  try {
    localStorage.removeItem(VIEWER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// คืนข้อมูลผู้ใช้ปัจจุบัน หรือ null ถ้ายังไม่ได้ login
// { kind: 'staff' | 'viewer', role, username, fullName, canEdit }
async function getCurrentUser() {
  // 1) admin / sup ที่ login ด้วยรหัสผ่าน
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('username, full_name, role')
      .eq('auth_user_id', session.user.id)
      .single();

    if (!error && profile && (profile.role === 'admin' || profile.role === 'sup')) {
      return {
        kind: 'staff',
        role: profile.role,
        username: profile.username,
        fullName: profile.full_name || profile.username,
        canEdit: true,
      };
    }
    // มี session แต่ไม่ใช่ admin/sup แล้ว (เช่น ถูกลดสิทธิ์) -> ออกจากระบบ
    await supabaseClient.auth.signOut();
  }

  // 2) user ทั่วไป (ไม่มีรหัสผ่าน)
  const viewer = readViewer();
  if (viewer && viewer.username) {
    const { data, error } = await supabaseClient.rpc('check_username', { p_username: viewer.username });
    if (!error && data && data.found && !data.needs_password) {
      return {
        kind: 'viewer',
        role: 'user',
        username: data.username,
        fullName: data.full_name || data.username,
        canEdit: false,
      };
    }
    // ถูกลบ หรือถูกเปลี่ยนเป็น admin/sup แล้ว -> ต้อง login ใหม่
    clearViewer();
  }

  return null;
}

// ใช้ที่หน้าในระบบ: ถ้ายังไม่ login ให้กลับไปหน้า login
async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.replace('index.html');
    return null;
  }
  document.body.classList.remove('auth-pending');
  return user;
}

async function logout() {
  if (!confirm('ต้องการออกจากระบบใช่หรือไม่?')) return;
  clearViewer();
  await supabaseClient.auth.signOut();
  window.location.replace('index.html');
}

// แสดงชื่อและสิทธิ์ในกล่องผู้ใช้ที่ sidebar (ถ้าหน้านั้นมี)
function renderUserBox(user) {
  const nameEl = document.getElementById('user-box-name');
  const roleEl = document.getElementById('user-box-role');
  if (nameEl) nameEl.textContent = user.fullName;
  if (roleEl) {
    roleEl.textContent = user.canEdit ? ROLE_LABEL[user.role] : ROLE_LABEL.user + ' · ดูอย่างเดียว';
    roleEl.className = 'user-box-role role-' + user.role;
  }
}
