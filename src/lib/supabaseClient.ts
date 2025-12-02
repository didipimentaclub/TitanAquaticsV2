// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sgrmqmxwnhmegojpvjqk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncm1xbXh3bmhtZWdvanB2anFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNjA1OTYsImV4cCI6MjA3OTkzNjU5Nn0.SW8DZNeZWTFoZmM2yQL7b2WlQJZZnjrGU4E3TSGerek';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
