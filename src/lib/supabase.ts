import { createClient } from '@supabase/supabase-js';
import { User as UserType } from '../types';

const getEnvVar = (viteKey: string, processKey: string, fallback: string) => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[viteKey]) {
      return (import.meta as any).env[viteKey];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env?.[processKey]) {
      return process.env[processKey];
    }
  } catch (e) {}
  return fallback;
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'SUPABASE_URL', 'https://ohbyloyfwowslgxpogum.supabase.co');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'sb_publishable_mCgdiWspb8VxMEvtrSKP_Q_Odwi3rer');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_CONFIG = {
  projectName: "tatha-coder's Project",
  projectId: 'ohbyloyfwowslgxpogum',
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
};

export function mapSupabaseUser(sbUser: any, fallbackRole = 'Software Engineer'): UserType {
  const name =
    sbUser.user_metadata?.full_name ||
    sbUser.user_metadata?.name ||
    (sbUser.email ? sbUser.email.split('@')[0] : 'User');
  const targetRole =
    sbUser.user_metadata?.target_role ||
    sbUser.user_metadata?.targetRole ||
    fallbackRole;

  return {
    id: sbUser.id,
    email: (sbUser.email || '').toLowerCase(),
    name,
    targetRole,
    createdAt: sbUser.created_at || new Date().toISOString(),
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  };
}

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Ping Supabase API endpoint or REST health endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (response.ok || response.status === 200 || response.status === 404) {
      return {
        connected: true,
        message: 'Successfully connected to Supabase project "tatha-coder\'s Project"',
        details: {
          projectId: 'ohbyloyfwowslgxpogum',
          status: response.status,
          statusText: response.statusText,
        },
      };
    } else {
      return {
        connected: false,
        message: `Supabase returned status ${response.status}`,
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Failed to connect to Supabase endpoint',
    };
  }
}

