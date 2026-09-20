// Supabase 專案設定：Test20260920
// anon / publishable key 是設計給前端公開使用的金鑰，安全性由資料表的 Row Level Security (RLS) 政策控管。
const SUPABASE_URL = "https://fzzpdyphcuqxqzztuzhr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_lXuxtiKdEZNn6gxvAqj7TQ_YaWVlkf7";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
