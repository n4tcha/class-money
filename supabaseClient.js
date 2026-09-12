// ⚠️ ใส่ค่าจาก Supabase Dashboard → Project Settings → API
const SUPABASE_URL = 'https://bcxfkxvojjfvjtigmyyt.supabase.co';
const SUPABASE_ANON_KEY = 'ใส่_ANON_KEY_ของคุณตรงนี้';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
