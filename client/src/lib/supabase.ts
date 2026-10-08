import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kkpqfbelzwwlmhljdcbf.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_YiD_M5F9HxuSHbOJfw4Cwg_kYCtXKVw';

export const supabase = createClient(supabaseUrl, supabaseKey);
