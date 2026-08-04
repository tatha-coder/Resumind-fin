import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, Shield, ArrowRight, X, AlertCircle, CheckCircle2, KeyRound, Database } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase, mapSupabaseUser } from '../lib/supabase';
import { safeFetchJson } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (mode === 'register' && !name) {
      setError('Please provide your full name.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        // Direct Supabase Auth SignUp call
        const { data: sbData, error: sbErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              target_role: targetRole.trim(),
            },
          },
        });

        if (sbErr) {
          throw new Error(sbErr.message);
        }

        const sbUser = sbData.user;
        const session = sbData.session;

        // Try syncing profile with server in background (non-blocking)
        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, targetRole }),
        }).catch(() => {/* Ignore server offline on static hosts */});

        if (session && sbUser) {
          const userObj = mapSupabaseUser(sbUser, targetRole.trim());
          localStorage.setItem('resumind_token', session.access_token);
          onLoginSuccess(userObj, session.access_token);
          onClose();
        } else if (sbUser) {
          setSuccessMsg(
            'Account created successfully in Supabase! If email confirmation is enabled in your Supabase project, please check your inbox to confirm, then sign in.'
          );
          setMode('login');
        } else {
          throw new Error('Failed to create account in Supabase.');
        }
      } else {
        // Direct Supabase Auth SignIn call
        const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        let token = sbData?.session?.access_token;
        let userObj: UserType | null = sbData?.user ? mapSupabaseUser(sbData.user) : null;

        if (sbErr || !token || !userObj) {
          // Fallback to Express backend endpoint (if available)
          const res = await safeFetchJson('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (res.ok && res.data) {
            token = res.data.token;
            userObj = res.data.user;
          } else {
            throw new Error(sbErr?.message || res.error || 'Invalid email or password.');
          }
        }

        if (token && userObj) {
          localStorage.setItem('resumind_token', token);
          onLoginSuccess(userObj, token);
          onClose();
        } else {
          throw new Error('Failed to retrieve authentication token.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Account Helper
  const handleQuickDemo = async (demoEmail: string, demoName: string, demoRole: string) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const demoPassword = 'password123';

    try {
      // 1. Try Supabase sign in first
      const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (!sbErr && sbData.session && sbData.user) {
        const userObj = mapSupabaseUser(sbData.user, demoRole);
        localStorage.setItem('resumind_token', sbData.session.access_token);
        onLoginSuccess(userObj, sbData.session.access_token);
        onClose();
        return;
      }

      // 2. Try Supabase signUp for demo if not registered
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            full_name: demoName,
            target_role: demoRole,
          },
        },
      });

      if (!signUpErr && signUpData.session && signUpData.user) {
        const userObj = mapSupabaseUser(signUpData.user, demoRole);
        localStorage.setItem('resumind_token', signUpData.session.access_token);
        onLoginSuccess(userObj, signUpData.session.access_token);
        onClose();
        return;
      }

      // 3. Fallback to Express backend or demo mock profile
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        localStorage.setItem('resumind_token', data.token);
        onLoginSuccess(data.user, data.token);
        onClose();
        return;
      }

      // 4. Create client demo session
      const mockUser: UserType = {
        id: 'usr_demo_' + demoEmail.replace(/[^a-z0-9]/gi, ''),
        email: demoEmail,
        name: demoName,
        targetRole: demoRole,
        createdAt: new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(demoName)}`,
      };
      const mockToken = 'demo_token_' + Date.now();
      localStorage.setItem('resumind_token', mockToken);
      onLoginSuccess(mockUser, mockToken);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
        
        {/* Header */}
        <div className="relative bg-slate-50 dark:bg-slate-850 p-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {mode === 'login' ? 'Supabase Sign In' : 'Supabase Sign Up'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {mode === 'login' 
                  ? 'Sign in with your registered Supabase email' 
                  : 'Create a new account in Supabase Database'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-100/80 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md">
            <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Supabase Email Auth Enabled</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {error && (
            <div className="flex items-start space-x-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start space-x-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Sarah Jenkins"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-850 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Target Role / Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Senior Full Stack Developer"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Minimum 6 characters with Supabase encrypted storage.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In with Supabase' : 'Sign Up in Supabase'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-bold"
            >
              {mode === 'login' 
                ? "Don't have a Supabase account? Sign Up" 
                : 'Already have an account? Sign In'}
            </button>
          </div>

          {/* Quick Demo Profiles Box */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-slate-700">Quick Test Profiles (1-Click Login):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('sarah.jenkins@example.com', 'Sarah Jenkins', 'Senior Frontend Engineer')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                  Sarah Jenkins
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">Senior Frontend Eng.</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('alex.rivera@example.com', 'Alex Rivera', 'Lead Product Manager')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">
                  Alex Rivera
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">Lead Product Manager</div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

