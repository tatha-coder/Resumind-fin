import React, { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
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
      className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-[#131d33] border border-slate-200 dark:border-slate-800 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
      title={`Supabase PostgreSQL & Auth:\nURL: ${SUPABASE_CONFIG.url}\nProject ID: ${SUPABASE_CONFIG.projectId}\nStatus: ${status.connected ? 'Connected & Operational' : 'Connecting...'}`}
    >
      <div className="flex items-center space-x-1.5">
        <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
          Supabase DB
        </span>
      </div>

      <span className="text-slate-300 dark:text-slate-700">•</span>

      {status.loading ? (
        <span className="flex items-center space-x-1 text-[10px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Syncing</span>
        </span>
      ) : status.connected ? (
        <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Active</span>
        </span>
      ) : (
        <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Standby</span>
        </span>
      )}
    </div>
  );
};
