import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cquvfrepnfwslcrljjpy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdXZmcmVwbmZ3c2xjcmxqanB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDAyNjgsImV4cCI6MjEwNTMxNjI2OH0.aowW6egyY8zCU6MY6VElp1KGecbuyrIDPEvcCqDjRPA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const hasSupabase = true;
export const isLocalDevelopment = false;