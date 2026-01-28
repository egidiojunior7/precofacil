
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nbbavwsfesidygmvdqwa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iYmF2d3NmZXNpZHltbXZkcXdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg1NjQ5MzYsImV4cCI6MjAzNDE0MDkzNn0.sb_publishable_xIvawtFgu0ucwLs1Iyyh4w_NsFlTMt8';

export const supabase = createClient(supabaseUrl, supabaseKey);
