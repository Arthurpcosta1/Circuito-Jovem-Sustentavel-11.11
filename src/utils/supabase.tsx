import { createClient } from './supabase/client';

// Exportar instância única do Supabase client
export const supabase = createClient();
