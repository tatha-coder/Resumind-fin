import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, Shield, ArrowRight, X, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase, mapSupabaseUser, isValidEmail } from '../lib/supabase';
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

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
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

        fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, targetRole }),
        }).catch(() => {});

        if (session && sbUser) {
          const userObj = mapSupabaseUser(sbUser, targetRole.trim());
          localStorage.setItem('resumind_token', session.access_token);
          onLoginSuccess(userObj, session.access_token);
          onClose();
        } else if (sbUser) {
          setSuccessMsg(
            'Account created successfully in Supabase! If email confirmation is enabled, please check your inbox to confirm, then sign in.'
          );
          setMode('login');
        } else {
          throw new Error('Failed to create account in Supabase.');
        }
      } else {
        const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        let token = sbData?.session?.access_token;
        let userObj: UserType | null = sbData?.user ? mapSupabaseUser(sbData.user) : null;

        if (sbErr || !token || !userObj) {
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

  const handleQuickDemo = async (demoEmail: string, demoName: string, demoRole: string) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const demoPassword = 'password123';

    try {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-[#E8E4DC] rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
        
        {/* Header */}
        <div className="relative bg-[#FAF7F2] p-6 border-b border-[#E8E4DC]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#F2EDE4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            <h2 className="text-base font-bold text-[#1C1917]">
              {mode === 'login' ? 'Account Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {mode === 'login' 
                ? 'Sign in to access your confidential resume vault' 
                : 'Register a new account to isolate and save your audit reports'}
            </p>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 mt-3 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md border border-emerald-200">
            <Shield className="w-3 h-3 text-emerald-700" />
            <span>Supabase Authentication</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start space-x-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-10 pr-3 py-2 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                    Target Role / Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Full Stack Developer"
                      className="w-full pl-10 pr-3 py-2 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-emerald-300 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center pt-1">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign Up" 
                : 'Already have an account? Sign In'}
            </button>
          </div>

          {/* Quick Demo Profiles Box */}
          <div className="pt-3.5 border-t border-[#E8E4DC]">
            <div className="flex items-center space-x-1.5 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-xs font-bold text-[#1C1917]">Quick Test Profiles (1-Click Sign In):</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('sarah.jenkins@example.com', 'Sarah Jenkins', 'Senior Frontend Engineer')}
                className="p-2.5 bg-[#FAF7F2] hover:bg-emerald-50 border border-[#E8E4DC] hover:border-emerald-300 rounded-xl text-left transition-colors group cursor-pointer"
              >
                <div className="text-xs font-bold text-[#1C1917] truncate">
                  Sarah Jenkins
                </div>
                <div className="text-[10px] text-[#78716C] font-medium truncate">Senior Frontend Eng.</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('alex.rivera@example.com', 'Alex Rivera', 'Lead Product Manager')}
                className="p-2.5 bg-[#FAF7F2] hover:bg-emerald-50 border border-[#E8E4DC] hover:border-emerald-300 rounded-xl text-left transition-colors group cursor-pointer"
              >
                <div className="text-xs font-bold text-[#1C1917] truncate">
                  Alex Rivera
                </div>
                <div className="text-[10px] text-[#78716C] font-medium truncate">Lead Product Manager</div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
