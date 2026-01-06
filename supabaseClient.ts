
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * ℹ️ INSTRUÇÕES:
 * 1. Vá ao seu painel do Supabase.
 * 2. Em 'Project Settings' > 'API', copie a URL e a chave 'anon public'.
 * 3. Cole abaixo para ativar o banco de dados em tempo real.
 */

const SUPABASE_URL = 'https://tgumakfhaqaffonotzdc.supabase.co'; // Substitua pela sua URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndW1ha2ZoYXFhZmZvbm90emRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzQ1OTksImV4cCI6MjA4MzIxMDU5OX0.nIwW_fOFAhonJXxKuly2k_VsCy7HyquJqQKf4IrmsVE'; // Substitua pela sua Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
