// ⚠️ ใส่ค่าจาก Supabase Dashboard → Project Settings → API
const SUPABASE_URL = 'https://bcxfkxvojjfvjtigmyyt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjeGZreHZvampmdmp0aWdteXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTk1MzgsImV4cCI6MjEwNDc5NTUzOH0.dyjYCitp7cIK_BAehNaVFURtouasTSW6XQkAHNKT3oE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
