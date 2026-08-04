import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkSupabaseConnection, SUPABASE_CONFIG } from '../lib/supabase';

export const SupabaseBadge: React.FC = () => {
  const [status, setStatus] = useState<{
    connected: boolean;
    loading: boolean;
    message?: string;
  }>({
    connected: false,
    loading: true,
  });

  useEffect(() => {
    checkSupabaseConnection().then((res) => {
      setStatus({
        connected: res.connected,
        loading: false,
        message: res.message,
      });
    });
  }, []);

  return (
    <div
      className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 shadow-sm"
      title={`Supabase URL: ${SUPABASE_CONFIG.url}\nProject ID: ${SUPABASE_CONFIG.projectId}`}
    >
      <Database className="w-3.5 h-3.5 text-emerald-600" />
      <span>
        Supabase: <strong className="font-bold">{SUPABASE_CONFIG.projectName}</strong>
      </span>
      {status.loading ? (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      ) : status.connected ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
      )}
    </div>
  );
};
