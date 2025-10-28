import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://stzgborngxdsygyfoadz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0emdib3JuZ3hkc3lneWZvYWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzI5ODIsImV4cCI6MjA3NzIwODk4Mn0.94jt07uDOLl1ucr-F9l28tkEN2-DHv_XOkQtnBHCXyU";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
