
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Substitua estas URLs pelas que você pegou no Passo 2 do tutorial
const SUPABASE_URL = 'https://tgumakfhaqaffonotzdc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndW1ha2ZoYXFhZmZvbm90emRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzQ1OTksImV4cCI6MjA4MzIxMDU5OX0.nIwW_fOFAhonJXxKuly2k_VsCy7HyquJqQKf4IrmsVE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
