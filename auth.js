let isLoginMode = true;

const form = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const toggleModeText = document.getElementById('toggle-mode-text');
const toggleModeLink = document.getElementById('toggle-mode-link');
const messageBox = document.getElementById('message');

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.style.display = 'block';
}

function hideMessage() {
  messageBox.style.display = 'none';
}

// สลับโหมด Login <-> Signup
toggleModeLink.addEventListener('click', (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  hideMessage();

  if (isLoginMode) {
    formTitle.textContent = 'เข้าสู่ระบบ';
    submitBtn.textContent = 'เข้าสู่ระบบ';
    toggleModeText.textContent = 'ยังไม่มีบัญชี?';
    toggleModeLink.textContent = 'สมัครสมาชิก';
  } else {
    formTitle.textContent = 'สมัครสมาชิก';
    submitBtn.textContent = 'สมัครสมาชิก';
    toggleModeText.textContent = 'มีบัญชีอยู่แล้ว?';
    toggleModeLink.textContent = 'เข้าสู่ระบบ';
  }
});

// ตรวจสอบว่า login อยู่แล้วหรือยัง -> เด้งไป dashboard เลย
async function checkExistingSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
}
checkExistingSession();

// จัดการ submit form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังดำเนินการ...';

  try {
    if (isLoginMode) {
      // เข้าสู่ระบบ
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showMessage('เข้าสู่ระบบสำเร็จ กำลังไปหน้าหลัก...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);

    } else {
      // สมัครสมาชิก
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      showMessage('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ', 'success');
      // สลับกลับไปหน้า login อัตโนมัติ
      isLoginMode = true;
      formTitle.textContent = 'เข้าสู่ระบบ';
      submitBtn.textContent = 'เข้าสู่ระบบ';
      toggleModeText.textContent = 'ยังไม่มีบัญชี?';
      toggleModeLink.textContent = 'สมัครสมาชิก';
      form.reset();
    }
  } catch (err) {
    showMessage(translateError(err.message), 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก';
  }
});

// แปล error message ที่พบบ่อยเป็นภาษาไทย
function translateError(msg) {
  const map = {
    'Invalid login credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'User already registered': 'อีเมลนี้ถูกใช้สมัครแล้ว',
    'Password should be at least 6 characters': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  };
  return map[msg] || msg;
}
