
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Substitua estas URLs pelas que você pegou no Passo 2 do tutorial
const SUPABASE_URL = 'https://SUA_URL_AQUI.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
