import { createClient } from '@supabase/supabase-js'

// ⬇️ Replace these with your Supabase keys from Project Settings → API
const supabaseUrl = "https://bpoiwbfvzdgljcctslzl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwb2l3YmZ2emRnbGpjY3RzbHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MDYxMzUsImV4cCI6MjA3MjM4MjEzNX0.tJvq3RuXO783Xb6LF3EN5HQmnCi7z5kL3GRp9a5QplY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
