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
      className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FAF7F2] border border-[#E8E4DC] rounded-full text-xs font-medium text-[#44403C] shadow-2xs transition-colors"
      title={`Supabase PostgreSQL & Auth:\nURL: ${SUPABASE_CONFIG.url}\nProject ID: ${SUPABASE_CONFIG.projectId}\nStatus: ${status.connected ? 'Connected & Operational' : 'Connecting...'}`}
    >
      <div className="flex items-center space-x-1.5">
        <Database className="w-3.5 h-3.5 text-emerald-700" />
        <span className="text-[11px] font-semibold text-[#1C1917]">
          Supabase DB
        </span>
      </div>

      <span className="text-stone-300">•</span>

      {status.loading ? (
        <span className="flex items-center space-x-1 text-[10px] text-stone-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Syncing</span>
        </span>
      ) : status.connected ? (
        <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>Active</span>
        </span>
      ) : (
        <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Standby</span>
        </span>
      )}
    </div>
  );
};
